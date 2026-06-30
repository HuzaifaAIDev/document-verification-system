"""OTP generation and verification."""
import logging
import secrets
from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from auth import hash_password, verify_password
from config import settings
from models import User

logger = logging.getLogger(__name__)


def generate_otp() -> str:
    return f"{secrets.randbelow(1_000_000):06d}"


def issue_otp(db: Session, user: User) -> str:
    otp = generate_otp()
    user.otp_code_hash = hash_password(otp)
    user.otp_expiry = datetime.now(timezone.utc) + timedelta(minutes=settings.OTP_EXPIRY_MINUTES)
    user.otp_attempts = 0
    db.commit()
    print(f"OTP for {user.email}: {otp}")
    return otp


def verify_otp(db: Session, user: User, otp: str) -> tuple[bool, str]:
    if not user.otp_code_hash or not user.otp_expiry:
        return False, "No OTP issued. Please request a new one."

    if datetime.utcnow() > user.otp_expiry.replace(tzinfo=None):
        return False, "OTP expired. Please request a new one."

    if user.otp_attempts >= settings.OTP_MAX_ATTEMPTS:
        return False, "Too many attempts. Please request a new OTP."

    if not verify_password(otp, user.otp_code_hash):
        user.otp_attempts += 1
        db.commit()
        remaining = settings.OTP_MAX_ATTEMPTS - user.otp_attempts
        return False, f"Invalid OTP. {remaining} attempts remaining."

    user.is_verified = True
    user.otp_code_hash = None
    user.otp_expiry = None
    user.otp_attempts = 0
    db.commit()
    return True, "Email verified successfully."
