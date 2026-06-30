"""FastAPI dependencies for auth + role checks."""
import logging
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from database import get_db
from models import User
from services.jwt_service import verify_access_token

logger = logging.getLogger(__name__)
bearer_scheme = HTTPBearer(auto_error=False)


def get_client_info(request: Request) -> tuple[str, str]:
    ip = request.client.host if request.client else ""
    fwd = request.headers.get("x-forwarded-for")
    if fwd:
        ip = fwd.split(",")[0].strip()
    ua = request.headers.get("user-agent", "")[:500]
    return ip, ua


def get_current_user(
    creds: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    err = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if creds is None or not creds.credentials:
        raise err
    payload = verify_access_token(creds.credentials)
    user_id = payload.get("user_id")
    if not user_id:
        raise err
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise err
    return user


def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    if not current_user.is_active:
        raise HTTPException(status_code=403, detail="Inactive account.")
    if not current_user.is_verified:
        raise HTTPException(status_code=403, detail="Email not verified.")
    return current_user


def get_current_admin(current_user: User = Depends(get_current_active_user)) -> User:
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin privileges required.")
    return current_user


def get_current_verifier(current_user: User = Depends(get_current_active_user)) -> User:
    if current_user.role not in {"verifier", "admin"}:
        raise HTTPException(status_code=403, detail="Verifier privileges required.")
    return current_user
