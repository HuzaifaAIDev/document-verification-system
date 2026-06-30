"""Authentication router: register, OTP, login, refresh, logout, forgot/reset."""
import logging
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.orm import Session

from auth import authenticate_user
from database import get_db
from dependencies import get_client_info, get_current_active_user
from middleware.rate_limiter import limiter
from models import User
from schemas import (
    ForgotPasswordIn, LoginIn, MessageResponse, OTPResendIn, OTPVerifyIn,
    RefreshIn, RegisterIn, ResetPasswordIn, Token, UserResponse,
)
from services.audit_service import log_action
from services.email_service import (
    send_otp_email, send_password_reset_email, send_welcome_email,
)
from services.jwt_service import (
    create_access_token, create_refresh_token, revoke_token,
    verify_refresh_token,
)
from services.otp_service import issue_otp, verify_otp
from services.password_reset_service import (
    consume_reset_token, issue_reset_token, verify_identity,
)
from services.user_service import create_user
from config import settings

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=201)
@limiter.limit("10/minute")
def register(request: Request, payload: RegisterIn, db: Session = Depends(get_db)):
    try:
        existing = (
            db.query(User)
            .filter((User.email == payload.email.lower()) | (User.username == payload.username))
            .first()
        )
        if existing:
            raise HTTPException(status_code=409, detail="Email or username already registered.")

        # Only allow self-registration as 'employee'. Admins/verifiers must be created by admin.
        if payload.role != "employee":
            raise HTTPException(status_code=403, detail="Only employees can self-register.")

        user = create_user(db, payload)
        otp = issue_otp(db, user)
        send_otp_email(user.email, user.first_name, otp, settings.OTP_EXPIRY_MINUTES)

        ip, ua = get_client_info(request)
        log_action(db, user.id, "REGISTER", ip_address=ip, user_agent=ua)
        return user
    except HTTPException:
        raise
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="User already exists.")
    except SQLAlchemyError:
        db.rollback()
        logger.exception("DB error during registration")
        raise HTTPException(status_code=500, detail="Registration failed.")


@router.post("/verify-otp", response_model=MessageResponse)
@limiter.limit("20/minute")
def verify_otp_route(request: Request, payload: OTPVerifyIn, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email.lower()).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    if user.is_verified:
        return MessageResponse(message="Email already verified.")

    ok, msg = verify_otp(db, user, payload.otp)
    ip, ua = get_client_info(request)
    log_action(db, user.id, "OTP_VERIFY_SUCCESS" if ok else "OTP_VERIFY_FAILED",
               ip_address=ip, user_agent=ua)
    if not ok:
        raise HTTPException(status_code=400, detail=msg)
    send_welcome_email(user.email, user.first_name)
    return MessageResponse(message=msg)


@router.post("/resend-otp", response_model=MessageResponse)
@limiter.limit("5/minute")
def resend_otp(request: Request, payload: OTPResendIn, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email.lower()).first()
    if not user:
        return MessageResponse(message="If the account exists, an OTP has been sent.")
    if user.is_verified:
        return MessageResponse(message="Email already verified.")
    otp = issue_otp(db, user)
    send_otp_email(user.email, user.first_name, otp, settings.OTP_EXPIRY_MINUTES)
    return MessageResponse(message="OTP sent.")


@router.post("/login", response_model=Token)
@limiter.limit("15/minute")
def login(request: Request, payload: LoginIn, db: Session = Depends(get_db)):
    user, err = authenticate_user(db, payload.email, payload.password)
    ip, ua = get_client_info(request)
    if err == "locked":
        log_action(db, user.id if user else 0, "LOGIN_LOCKED", ip_address=ip, user_agent=ua)
        raise HTTPException(status_code=423, detail="Account temporarily locked. Try later.")
    if err == "inactive":
        raise HTTPException(status_code=403, detail="Account inactive.")
    if err == "unverified":
        raise HTTPException(status_code=403, detail="Email not verified. Please verify OTP first.")
    if err or not user:
        raise HTTPException(status_code=401, detail="Invalid credentials.")

    user.last_login = datetime.now(timezone.utc)
    db.commit()

    claims = {"sub": user.email, "user_id": user.id, "role": user.role}
    log_action(db, user.id, "LOGIN_SUCCESS", ip_address=ip, user_agent=ua)
    return Token(
        access_token=create_access_token(claims),
        refresh_token=create_refresh_token(claims, remember_me=payload.remember_me),
    )


@router.post("/refresh", response_model=Token)
@limiter.limit("30/minute")
def refresh(request: Request, payload: RefreshIn, db: Session = Depends(get_db)):
    data = verify_refresh_token(payload.refresh_token, db=db)
    # Token rotation: revoke old, issue new
    revoke_token(db, data)
    claims = {"sub": data["sub"], "user_id": data["user_id"], "role": data["role"]}
    return Token(
        access_token=create_access_token(claims),
        refresh_token=create_refresh_token(claims),
    )


@router.post("/logout", response_model=MessageResponse)
def logout(payload: RefreshIn, request: Request, db: Session = Depends(get_db),
           current_user: User = Depends(get_current_active_user)):
    try:
        data = verify_refresh_token(payload.refresh_token, db=db)
        revoke_token(db, data)
    except HTTPException:
        pass
    ip, ua = get_client_info(request)
    log_action(db, current_user.id, "LOGOUT", ip_address=ip, user_agent=ua)
    return MessageResponse(message="Logged out successfully.")


@router.get("/me", response_model=UserResponse)
def me(current_user: User = Depends(get_current_active_user)):
    return current_user


@router.post("/forgot-password", response_model=MessageResponse)
@limiter.limit("5/hour")
def forgot_password(request: Request, payload: ForgotPasswordIn, db: Session = Depends(get_db)):
    user, generic = verify_identity(
        db, payload.email, payload.first_name, payload.last_name,
        payload.date_of_birth, payload.security_answer_1, payload.security_answer_2,
    )
    if user:
        print("===== USER VERIFIED =====")
        print(user.email)

        token = issue_reset_token(db, user)
        print("TOKEN:", token)

        link = f"{settings.FRONTEND_URL}/reset-password/{token}"
        print("LINK:", link)

        result = send_password_reset_email(
            user.email,
            user.first_name,
            link,
            settings.RESET_TOKEN_EXPIRY_MINUTES,
        )

        print("EMAIL SENT:", result)

        ip, ua = get_client_info(request)
        log_action(
            db,
            user.id,
            "PASSWORD_RESET_REQUESTED",
            ip_address=ip,
            user_agent=ua,
        )
    else:
        print("IDENTITY VERIFICATION FAILED")
    return MessageResponse(message=generic)


@router.post("/reset-password", response_model=MessageResponse)
@limiter.limit("10/hour")
def reset_password(request: Request, payload: ResetPasswordIn, db: Session = Depends(get_db)):
    ok, msg = consume_reset_token(db, payload.token, payload.new_password)
    if not ok:
        raise HTTPException(status_code=400, detail=msg)
    # Audit
    try:
        uid = int(payload.token.split(".", 1)[0])
        ip, ua = get_client_info(request)
        log_action(db, uid, "PASSWORD_RESET_COMPLETED", ip_address=ip, user_agent=ua)
    except Exception:
        pass
    return MessageResponse(message=msg)


@router.get("/security-questions/{email}")
def get_security_questions(email: str, db: Session = Depends(get_db)):
    """Return the security questions for an account (for the forgot-password form).
    Returns generic placeholders if user doesn't exist (no enumeration)."""
    user = db.query(User).filter(User.email == email.lower()).first()
    if not user or not user.security_question_1:
        return {
            "question_1": "What was your first pet's name?",
            "question_2": "In what city were you born?",
        }
    return {"question_1": user.security_question_1, "question_2": user.security_question_2}
