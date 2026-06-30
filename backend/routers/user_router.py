"""User profile + password management."""
import logging
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from auth import hash_password, verify_password
from database import get_db
from dependencies import get_client_info, get_current_active_user
from models import PasswordHistory, User
from schemas import ChangePasswordIn, MessageResponse, UserResponse, UserUpdate
from services.audit_service import log_action
from config import settings

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=UserResponse)
def me(current_user: User = Depends(get_current_active_user)):
    return current_user


@router.put("/me", response_model=UserResponse)
def update_me(
    payload: UserUpdate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    try:
        if payload.first_name: current_user.first_name = payload.first_name.strip()
        if payload.last_name:  current_user.last_name = payload.last_name.strip()
        if payload.phone is not None: current_user.phone = payload.phone.strip() or None
        if payload.country is not None: current_user.country = payload.country.strip() or None
        db.commit()
        db.refresh(current_user)
        ip, ua = get_client_info(request)
        log_action(db, current_user.id, "UPDATE_PROFILE", ip_address=ip, user_agent=ua)
        return current_user
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Conflict.")


@router.post("/change-password", response_model=MessageResponse)
def change_password(
    payload: ChangePasswordIn,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    if not verify_password(payload.old_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Old password incorrect.")

    history = (
        db.query(PasswordHistory)
        .filter(PasswordHistory.user_id == current_user.id)
        .order_by(PasswordHistory.created_at.desc())
        .limit(settings.PASSWORD_HISTORY_SIZE)
        .all()
    )
    for h in history:
        if verify_password(payload.new_password, h.hashed_password):
            raise HTTPException(status_code=400, detail="You cannot reuse a recent password.")

    db.add(PasswordHistory(user_id=current_user.id, hashed_password=current_user.hashed_password))
    current_user.hashed_password = hash_password(payload.new_password)
    current_user.force_password_change = False
    db.commit()
    ip, ua = get_client_info(request)
    log_action(db, current_user.id, "CHANGE_PASSWORD", ip_address=ip, user_agent=ua)
    return MessageResponse(message="Password updated successfully.")
