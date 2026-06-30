"""Admin endpoints."""
import logging
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy import func
from sqlalchemy.orm import Session

from auth import hash_password
from database import get_db
from dependencies import get_client_info, get_current_admin
from models import AuditLog, Document, User
from schemas import AuditLogResponse, MessageResponse, StatsResponse, UserResponse
from services.audit_service import log_action

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/stats", response_model=StatsResponse)
def stats(db: Session = Depends(get_db), _: User = Depends(get_current_admin)):
    return StatsResponse(
        total_users=db.query(User).count(),
        total_documents=db.query(Document).count(),
        pending_documents=db.query(Document).filter(Document.status == "PENDING").count(),
        approved_documents=db.query(Document).filter(Document.status == "APPROVED").count(),
        rejected_documents=db.query(Document).filter(Document.status == "REJECTED").count(),
        total_verifiers=db.query(User).filter(User.role == "verifier").count(),
        total_admins=db.query(User).filter(User.role == "admin").count(),
    )


@router.get("/analytics")
def analytics(db: Session = Depends(get_db), _: User = Depends(get_current_admin)):
    by_status = dict(
        db.query(Document.status, func.count(Document.id)).group_by(Document.status).all()
    )
    by_role = dict(
        db.query(User.role, func.count(User.id)).group_by(User.role).all()
    )
    return {"documents_by_status": by_status, "users_by_role": by_role}


@router.get("/users", response_model=list[UserResponse])
def list_users(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
    q: Optional[str] = Query(default=None),
    role: Optional[str] = Query(default=None),
    skip: int = 0, limit: int = 100,
):
    query = db.query(User)
    if role:
        query = query.filter(User.role == role.lower())
    if q:
        like = f"%{q}%"
        query = query.filter(
            (User.email.ilike(like)) | (User.username.ilike(like))
            | (User.first_name.ilike(like)) | (User.last_name.ilike(like))
        )
    return query.order_by(User.created_at.desc()).offset(skip).limit(limit).all()


@router.post("/users/{user_id}/activate", response_model=MessageResponse)
def activate(user_id: int, request: Request, db: Session = Depends(get_db),
             admin: User = Depends(get_current_admin)):
    u = db.query(User).filter(User.id == user_id).first()
    if not u: raise HTTPException(404, "User not found")
    u.is_active = True
    db.commit()
    ip, ua = get_client_info(request)
    log_action(db, admin.id, f"ACTIVATE_USER_{user_id}", ip_address=ip, user_agent=ua)
    return MessageResponse(message="Activated.")


@router.post("/users/{user_id}/deactivate", response_model=MessageResponse)
def deactivate(user_id: int, request: Request, db: Session = Depends(get_db),
               admin: User = Depends(get_current_admin)):
    u = db.query(User).filter(User.id == user_id).first()
    if not u: raise HTTPException(404, "User not found")
    if u.id == admin.id: raise HTTPException(400, "Cannot deactivate self.")
    u.is_active = False
    db.commit()
    ip, ua = get_client_info(request)
    log_action(db, admin.id, f"DEACTIVATE_USER_{user_id}", ip_address=ip, user_agent=ua)
    return MessageResponse(message="Deactivated.")


@router.post("/users/{user_id}/role/{role}", response_model=MessageResponse)
def change_role(user_id: int, role: str, request: Request,
                db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    role = role.lower()
    if role not in {"employee", "verifier", "admin"}:
        raise HTTPException(400, "Invalid role.")
    u = db.query(User).filter(User.id == user_id).first()
    if not u: raise HTTPException(404, "User not found")
    u.role = role
    db.commit()
    ip, ua = get_client_info(request)
    log_action(db, admin.id, f"ROLE_CHANGE_{user_id}_{role}", ip_address=ip, user_agent=ua)
    return MessageResponse(message="Role updated.")


@router.delete("/users/{user_id}", response_model=MessageResponse)
def delete_user(user_id: int, request: Request, db: Session = Depends(get_db),
                admin: User = Depends(get_current_admin)):
    u = db.query(User).filter(User.id == user_id).first()
    if not u: raise HTTPException(404, "User not found")
    if u.id == admin.id: raise HTTPException(400, "Cannot delete self.")
    db.delete(u)
    db.commit()
    ip, ua = get_client_info(request)
    log_action(db, admin.id, f"DELETE_USER_{user_id}", ip_address=ip, user_agent=ua)
    return MessageResponse(message="User deleted.")


@router.get("/documents")
def all_documents(db: Session = Depends(get_db), _: User = Depends(get_current_admin),
                  status: Optional[str] = None, skip: int = 0, limit: int = 100):
    q = db.query(Document)
    if status: q = q.filter(Document.status == status.upper())
    return q.order_by(Document.created_at.desc()).offset(skip).limit(limit).all()


@router.get("/audit-logs", response_model=list[AuditLogResponse])
def audit_logs(db: Session = Depends(get_db), _: User = Depends(get_current_admin),
               skip: int = 0, limit: int = 200):
    return (
        db.query(AuditLog).order_by(AuditLog.created_at.desc())
        .offset(skip).limit(limit).all()
    )
