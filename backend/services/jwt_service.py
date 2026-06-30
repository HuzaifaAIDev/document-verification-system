"""JWT helpers (access + refresh)."""
import logging
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any, Dict

from fastapi import HTTPException, status
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from config import settings
from models import RevokedToken

logger = logging.getLogger(__name__)


def _encode(payload: Dict[str, Any], expires_delta: timedelta, token_type: str) -> str:
    data = payload.copy()
    data.update({
        "exp": datetime.now(timezone.utc) + expires_delta,
        "iat": datetime.now(timezone.utc),
        "jti": uuid.uuid4().hex,
        "type": token_type,
    })
    return jwt.encode(data, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_access_token(data: Dict[str, Any]) -> str:
    return _encode(data, timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES), "access")


def create_refresh_token(data: Dict[str, Any], remember_me: bool = False) -> str:
    days = settings.REFRESH_TOKEN_EXPIRE_DAYS * (4 if remember_me else 1)
    return _encode(data, timedelta(days=days), "refresh")


def verify_token(token: str) -> dict:
    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token.",
            headers={"WWW-Authenticate": "Bearer"},
        )


def verify_access_token(token: str) -> dict:
    payload = verify_token(token)
    if payload.get("type") != "access":
        raise HTTPException(status_code=401, detail="Invalid access token.")
    return payload


def verify_refresh_token(token: str, db: Session | None = None) -> dict:
    payload = verify_token(token)
    if payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token.")
    if db is not None:
        jti = payload.get("jti")
        if jti and db.query(RevokedToken).filter(RevokedToken.jti == jti).first():
            raise HTTPException(status_code=401, detail="Refresh token revoked.")
    return payload


def revoke_token(db: Session, payload: dict) -> None:
    jti = payload.get("jti")
    if not jti:
        return
    if db.query(RevokedToken).filter(RevokedToken.jti == jti).first():
        return
    db.add(RevokedToken(jti=jti, user_id=payload.get("user_id")))
    db.commit()
