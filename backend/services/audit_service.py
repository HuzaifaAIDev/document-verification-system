"""Audit logging."""
import logging
from sqlalchemy.orm import Session

from models import AuditLog

logger = logging.getLogger(__name__)


def log_action(
    db: Session,
    user_id: int,
    action: str,
    document_id: int | None = None,
    ip_address: str | None = None,
    user_agent: str | None = None,
) -> AuditLog | None:
    try:
        entry = AuditLog(
            user_id=user_id,
            action=action[:255],
            document_id=document_id,
            ip_address=ip_address,
            user_agent=user_agent,
        )
        db.add(entry)
        db.commit()
        return entry
    except Exception:
        db.rollback()
        logger.exception("Audit log failed")
        return None
