"""Password reset (identity-verified, secure token, history check)."""

import logging
import secrets
from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from auth import hash_password, verify_password, verify_security_answer
from config import settings
from models import PasswordHistory, RevokedToken, User

logger = logging.getLogger(__name__)


def make_aware(dt):
    """
    SQLite returns naive datetimes even when timezone=True.
    Convert them to UTC-aware datetimes.
    """
    if dt is None:
        return None
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt


def verify_identity(
    db: Session,
    email: str,
    first_name: str,
    last_name: str,
    dob,
    answer_1: str,
    answer_2: str,
) -> tuple[User | None, str]:

    user = db.query(User).filter(User.email == email.lower()).first()

    # Always behave identically to avoid user enumeration
    generic = "If the details match, a reset link has been sent."

    if not user:
        return None, generic

    now = datetime.now(timezone.utc)

    window_start = make_aware(user.password_reset_window_start)

    # Rate limit: 5 requests/hour
    if window_start and (now - window_start) < timedelta(hours=1):
        if user.password_reset_attempts >= 5:
            return None, "Too many reset requests. Try again later."
    else:
        user.password_reset_window_start = now
        user.password_reset_attempts = 0

    user.password_reset_attempts += 1
    db.commit()

    if (user.first_name or "").strip().lower() != first_name.strip().lower():
        return None, generic

    if (user.last_name or "").strip().lower() != last_name.strip().lower():
        return None, generic

    if user.date_of_birth != dob:
        return None, generic

    if not verify_security_answer(answer_1, user.security_answer_1_hash):
        return None, generic

    if not verify_security_answer(answer_2, user.security_answer_2_hash):
        return None, generic

    return user, generic


def issue_reset_token(db: Session, user: User) -> str:
    raw = secrets.token_urlsafe(32)

    user.reset_token_hash = hash_password(raw)
    user.reset_token_expiry = (
        datetime.now(timezone.utc)
        + timedelta(minutes=settings.RESET_TOKEN_EXPIRY_MINUTES)
    )

    db.commit()

    # Token sent to client = "<user_id>.<raw>"
    return f"{user.id}.{raw}"


def consume_reset_token(
    db: Session,
    token: str,
    new_password: str,
) -> tuple[bool, str]:

    try:
        user_id_str, raw = token.split(".", 1)
        user_id = int(user_id_str)
    except (ValueError, AttributeError):
        return False, "Invalid reset token."

    user = db.query(User).filter(User.id == user_id).first()

    if not user or not user.reset_token_hash or not user.reset_token_expiry:
        return False, "Invalid or expired reset token."

    expiry = make_aware(user.reset_token_expiry)

    if datetime.now(timezone.utc) > expiry:
        return False, "Reset token expired."

    if not verify_password(raw, user.reset_token_hash):
        return False, "Invalid reset token."

    # Password history check
    history = (
        db.query(PasswordHistory)
        .filter(PasswordHistory.user_id == user.id)
        .order_by(PasswordHistory.created_at.desc())
        .limit(settings.PASSWORD_HISTORY_SIZE)
        .all()
    )

    for h in history:
        if verify_password(new_password, h.hashed_password):
            return False, "You cannot reuse a recent password."

    if verify_password(new_password, user.hashed_password):
        return False, "You cannot reuse your current password."

    # Save current password to history
    db.add(
        PasswordHistory(
            user_id=user.id,
            hashed_password=user.hashed_password,
        )
    )

    # Update password
    user.hashed_password = hash_password(new_password)
    user.reset_token_hash = None
    user.reset_token_expiry = None
    user.force_password_change = False
    user.failed_login_attempts = 0
    user.locked_until = None

    db.commit()

    return True, "Password reset successfully. Please log in again."