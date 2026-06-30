"""Password hashing + authentication primitives."""
import logging
from datetime import datetime, timezone, timedelta
from typing import Optional

from passlib.context import CryptContext
from sqlalchemy.orm import Session

from config import settings
from models import User

logger = logging.getLogger(__name__)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    if not password:
        raise ValueError("Password cannot be empty")
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    if not plain or not hashed:
        return False
    try:
        return pwd_context.verify(plain, hashed)
    except Exception:
        logger.exception("Password verification failed")
        return False


def hash_security_answer(answer: str) -> str:
    return pwd_context.hash(answer.strip().lower())


def verify_security_answer(answer: str, hashed: str) -> bool:
    if not hashed:
        return False
    return verify_password(answer.strip().lower(), hashed)


def authenticate_user(db: Session, email: str, password: str) -> tuple[Optional[User], Optional[str]]:
    """Return (user, error_code). error_code in {None, 'invalid', 'inactive', 'unverified', 'locked'}."""
    user = db.query(User).filter(User.email == email.lower()).first()
    if not user:
        return None, "invalid"

    now = datetime.now(timezone.utc)
    if user.locked_until and user.locked_until > now:
        return None, "locked"

    if not verify_password(password, user.hashed_password):
        user.failed_login_attempts = (user.failed_login_attempts or 0) + 1
        if user.failed_login_attempts >= settings.MAX_FAILED_LOGINS:
            user.locked_until = now + timedelta(minutes=settings.LOCKOUT_MINUTES)
            user.failed_login_attempts = 0
        db.commit()
        return None, "invalid"

    if not user.is_active:
        return None, "inactive"
    if not user.is_verified:
        return None, "unverified"

    user.failed_login_attempts = 0
    user.locked_until = None
    return user, None
