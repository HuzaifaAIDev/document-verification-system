"""Document upload + retrieval (employee)."""
import logging
import os
from typing import Optional

from fastapi import APIRouter, Depends, File, HTTPException, Query, Request, UploadFile
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from database import get_db
from dependencies import get_client_info, get_current_active_user
from models import Document, User
from schemas import DocumentResponse
from services.audit_service import log_action
from services.file_service import delete_file, save_file
from services.ocr_service import extract_text

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/documents", tags=["Documents"])


@router.post("/upload", response_model=DocumentResponse, status_code=201)
def upload(
    request: Request,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    original, stored, size, path = save_file(file)
    text = extract_text(path)
    doc = Document(
        filename=original,
        stored_filename=stored,
        filepath=path,
        size=size,
        content_type=file.content_type,
        uploaded_by=current_user.id,
        status="PENDING",
        extracted_text=text or None,
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    ip, ua = get_client_info(request)
    log_action(db, current_user.id, "UPLOAD_DOCUMENT", document_id=doc.id, ip_address=ip, user_agent=ua)
    return doc


@router.get("/my", response_model=list[DocumentResponse])
def my_documents(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    status: Optional[str] = Query(default=None),
    q: Optional[str] = Query(default=None),
    skip: int = 0,
    limit: int = 50,
):
    query = db.query(Document).filter(Document.uploaded_by == current_user.id)
    if status:
        query = query.filter(Document.status == status.upper())
    if q:
        like = f"%{q}%"
        query = query.filter(Document.filename.ilike(like))
    return query.order_by(Document.created_at.desc()).offset(skip).limit(limit).all()


@router.get("/{doc_id}", response_model=DocumentResponse)
def get_doc(
    doc_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
    if doc.uploaded_by != current_user.id and current_user.role not in {"admin", "verifier"}:
        raise HTTPException(status_code=403, detail="Forbidden.")
    return doc


@router.get("/{doc_id}/download")
def download(
    doc_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
    if doc.uploaded_by != current_user.id and current_user.role not in {"admin", "verifier"}:
        raise HTTPException(status_code=403, detail="Forbidden.")
    if not os.path.exists(doc.filepath):
        raise HTTPException(status_code=410, detail="File missing on server.")
    ip, ua = get_client_info(request)
    log_action(db, current_user.id, "DOWNLOAD_DOCUMENT", document_id=doc.id, ip_address=ip, user_agent=ua)
    return FileResponse(doc.filepath, filename=doc.filename, media_type=doc.content_type)


@router.delete("/{doc_id}")
def delete_doc(
    doc_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
    if doc.uploaded_by != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Forbidden.")
    delete_file(doc.filepath)
    db.delete(doc)
    db.commit()
    ip, ua = get_client_info(request)
    log_action(db, current_user.id, "DELETE_DOCUMENT", document_id=doc_id, ip_address=ip, user_agent=ua)
    return {"success": True, "message": "Document deleted."}
