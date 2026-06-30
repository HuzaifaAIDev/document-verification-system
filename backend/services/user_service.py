"""User domain service."""
import logging
from sqlalchemy.orm import Session

from auth import hash_password, hash_security_answer
from models import PasswordHistory, User

logger = logging.getLogger(__name__)


def create_user(db: Session, payload) -> User:
    user = User(
        first_name=payload.first_name.strip(),
        last_name=payload.last_name.strip(),
        username=payload.username.strip(),
        email=payload.email.lower(),
        phone=(payload.phone or "").strip() or None,
        date_of_birth=payload.date_of_birth,
        gender=payload.gender,
        country=payload.country,
        hashed_password=hash_password(payload.password),
        role=payload.role,
        is_active=True,
        is_verified=False,
        security_question_1=payload.security_question_1.strip(),
        security_answer_1_hash=hash_security_answer(payload.security_answer_1),
        security_question_2=payload.security_question_2.strip(),
        security_answer_2_hash=hash_security_answer(payload.security_answer_2),
    )
    db.add(user)
    db.flush()
    db.add(PasswordHistory(user_id=user.id, hashed_password=user.hashed_password))
    db.commit()
    db.refresh(user)
    return user
