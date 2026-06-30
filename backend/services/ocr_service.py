"""OCR extraction (PDF + image)."""
import logging
import os

from PyPDF2 import PdfReader

from config import settings

logger = logging.getLogger(__name__)

try:
    import pytesseract
    from PIL import Image
    _OCR_AVAILABLE = True
except Exception:
    _OCR_AVAILABLE = False


def extract_from_pdf(path: str) -> str:
    try:
        reader = PdfReader(path)
        return "\n".join((p.extract_text() or "") for p in reader.pages).strip()
    except Exception:
        logger.exception("PDF extract failed")
        return ""


def extract_from_image(path: str) -> str:
    if not _OCR_AVAILABLE:
        logger.warning("pytesseract/PIL not available")
        return ""
    try:
        return pytesseract.image_to_string(Image.open(path), lang=settings.OCR_LANGUAGE).strip()
    except Exception:
        logger.exception("Image OCR failed")
        return ""


def extract_text(path: str) -> str:
    if not settings.OCR_ENABLED:
        return ""
    if not path or not os.path.exists(path):
        return ""
    ext = path.rsplit(".", 1)[-1].lower() if "." in path else ""
    if ext == "pdf":
        return extract_from_pdf(path)
    if ext in {"jpg", "jpeg", "png"}:
        return extract_from_image(path)
    return ""
