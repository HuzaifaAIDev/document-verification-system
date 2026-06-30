"""Verifier endpoints."""
import logging
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.orm import Session

from database import get_db
from dependencies import get_client_info, get_current_verifier
from models import Document, User
from schemas import DocumentApproval, DocumentResponse, UserResponse
from services.audit_service import log_action

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/verifier", tags=["Verifier"])


# ---------------------------------------------------------------------------
# Existing endpoints — unchanged
# ---------------------------------------------------------------------------

@router.get("/pending", response_model=list[DocumentResponse])
def pending(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_verifier),
    q: Optional[str] = Query(default=None),
    skip: int = 0,
    limit: int = 50,
):
    query = db.query(Document).filter(Document.status == "PENDING")
    if q:
        query = query.filter(Document.filename.ilike(f"%{q}%"))
    return query.order_by(Document.created_at.asc()).offset(skip).limit(limit).all()


@router.get("/history", response_model=list[DocumentResponse])
def history(
    db: Session = Depends(get_db),
    current: User = Depends(get_current_verifier),
    skip: int = 0,
    limit: int = 100,
):
    return (
        db.query(Document)
        .filter(Document.verified_by == current.id)
        .order_by(Document.updated_at.desc())
        .offset(skip).limit(limit).all()
    )


@router.post("/{doc_id}/decision", response_model=DocumentResponse)
def decide(
    doc_id: int,
    payload: DocumentApproval,
    request: Request,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_verifier),
):
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
    if doc.status != "PENDING":
        raise HTTPException(status_code=409, detail=f"Document already {doc.status}.")

    doc.status = payload.status
    doc.remarks = payload.remarks
    doc.verified_by = current.id
    doc.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(doc)
    ip, ua = get_client_info(request)
    log_action(db, current.id, f"VERIFY_DOCUMENT_{doc.status}",
               document_id=doc.id, ip_address=ip, user_agent=ua)
    return doc


@router.get("/stats")
def verifier_stats(db: Session = Depends(get_db), current: User = Depends(get_current_verifier)):
    pending_count = db.query(Document).filter(Document.status == "PENDING").count()
    approved = db.query(Document).filter(
        Document.status == "APPROVED", Document.verified_by == current.id
    ).count()
    rejected = db.query(Document).filter(
        Document.status == "REJECTED", Document.verified_by == current.id
    ).count()
    return {"pending": pending_count, "my_approved": approved, "my_rejected": rejected}


# ---------------------------------------------------------------------------
# NEW: user-centric workflow endpoints
# ---------------------------------------------------------------------------
@router.get("/users", response_model=list[UserResponse])
def list_users_with_pending(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_verifier),
    q: Optional[str] = Query(default=None),
    skip: int = 0,
    limit: int = 100,
):
    """
    Return all users who have uploaded documents.
    This allows verifiers to search and view profiles even after
    all documents have been approved or rejected.
    """

    uploader_ids = (
        db.query(Document.uploaded_by)
        .distinct()
        .subquery()
    )

    query = db.query(User).filter(User.id.in_(uploader_ids))

    if q:
        like = f"%{q}%"
        query = query.filter(
            (User.first_name.ilike(like))
            | (User.last_name.ilike(like))
            | (User.username.ilike(like))
            | (User.email.ilike(like))
        )

    return (
        query.order_by(User.first_name.asc(), User.last_name.asc())
        .offset(skip)
        .limit(limit)
        .all()
    )
@router.get("/users/{user_id}/documents", response_model=list[DocumentResponse])
def get_user_documents(
    user_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_verifier),
    status: Optional[str] = Query(default=None),
    skip: int = 0,
    limit: int = 100,
):
    """
    Return all documents uploaded by a specific user.
    Optionally filter by status (PENDING / APPROVED / REJECTED).
    """
    # Confirm the user actually exists
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    query = db.query(Document).filter(Document.uploaded_by == user_id)
    if status:
        query = query.filter(Document.status == status.upper())
    return query.order_by(Document.created_at.desc()).offset(skip).limit(limit).all()