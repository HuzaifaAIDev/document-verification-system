"""File storage service."""
import logging
import os
import re
import uuid
from pathlib import Path

from fastapi import HTTPException, UploadFile

from config import settings
from models import Document

logger = logging.getLogger(__name__)
UPLOAD_DIR = settings.UPLOAD_DIR
os.makedirs(UPLOAD_DIR, exist_ok=True)


def _ext(name: str) -> str:
    name = Path(name).name
    return name.rsplit(".", 1)[-1].lower() if "." in name else ""


def sanitize_filename(name: str) -> str:
    name = Path(name).name
    name = re.sub(r"[^\w.\-]+", "_", name)
    return name[:255]


def save_file(file: UploadFile) -> tuple[str, str, int, str]:
    if not file or not file.filename:
        raise HTTPException(status_code=400, detail="No file uploaded.")

    ext = _ext(file.filename)
    if ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"File type not allowed: .{ext}")

    if file.content_type not in Document.ALLOWED_CONTENT_TYPES:
        raise HTTPException(status_code=400, detail=f"Unsupported content type: {file.content_type}")

    file.file.seek(0, os.SEEK_END)
    size = file.file.tell()
    file.file.seek(0)

    max_bytes = settings.MAX_FILE_SIZE_MB * 1024 * 1024
    if size <= 0:
        raise HTTPException(status_code=400, detail="Empty file.")
    if size > max_bytes:
        raise HTTPException(status_code=400, detail=f"File exceeds {settings.MAX_FILE_SIZE_MB}MB limit.")

    safe_original = sanitize_filename(file.filename)
    unique = f"{uuid.uuid4().hex}.{ext}"
    path = os.path.join(UPLOAD_DIR, unique)
    with open(path, "wb") as out:
        out.write(file.file.read())

    logger.info("File saved: %s (%d bytes)", path, size)
    return safe_original, unique, size, path


def delete_file(path: str) -> None:
    try:
        if path and os.path.exists(path):
            os.remove(path)
    except Exception:
        logger.exception("Delete failed for %s", path)
