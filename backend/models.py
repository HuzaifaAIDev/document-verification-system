"""SQLAlchemy ORM models."""
from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime, ForeignKey, Text, BigInteger,
    CheckConstraint, Date,
)
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from database import Base


class User(Base):
    __tablename__ = "users"
    __table_args__ = (
        CheckConstraint("length(username) >= 3", name="check_username_length"),
    )

    id = Column(Integer, primary_key=True, index=True)

    # Identity
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    phone = Column(String(30), nullable=True)
    date_of_birth = Column(Date, nullable=True)
    gender = Column(String(20), nullable=True)
    country = Column(String(80), nullable=True)

    # Auth
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False, default="employee")
    is_active = Column(Boolean, nullable=False, default=True)
    is_verified = Column(Boolean, nullable=False, default=False)
    force_password_change = Column(Boolean, nullable=False, default=False)

    # Security questions (answers stored as bcrypt hashes of trimmed+lowered values)
    security_question_1 = Column(String(255), nullable=True)
    security_answer_1_hash = Column(String(255), nullable=True)
    security_question_2 = Column(String(255), nullable=True)
    security_answer_2_hash = Column(String(255), nullable=True)

    # OTP
    otp_code_hash = Column(String(255), nullable=True)
    otp_expiry = Column(DateTime(timezone=True), nullable=True)
    otp_attempts = Column(Integer, nullable=False, default=0)

    # Password reset
    reset_token_hash = Column(String(255), nullable=True)
    reset_token_expiry = Column(DateTime(timezone=True), nullable=True)
    password_reset_attempts = Column(Integer, nullable=False, default=0)
    password_reset_window_start = Column(DateTime(timezone=True), nullable=True)

    # Lockout
    failed_login_attempts = Column(Integer, nullable=False, default=0)
    locked_until = Column(DateTime(timezone=True), nullable=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    last_login = Column(DateTime(timezone=True), nullable=True)

    uploaded_documents = relationship(
        "Document", foreign_keys="Document.uploaded_by", back_populates="uploader"
    )
    verified_documents = relationship(
        "Document", foreign_keys="Document.verified_by", back_populates="verifier"
    )
    audit_logs = relationship(
        "AuditLog", back_populates="user", cascade="all, delete-orphan"
    )
    password_history = relationship(
        "PasswordHistory", back_populates="user", cascade="all, delete-orphan"
    )


class Document(Base):
    __tablename__ = "documents"
    __table_args__ = (CheckConstraint("size >= 0", name="check_file_size"),)

    ALLOWED_STATUSES = {"PENDING", "APPROVED", "REJECTED"}
    ALLOWED_CONTENT_TYPES = {
        "application/pdf",
        "image/jpeg",
        "image/png",
        "image/jpg",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    }

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), nullable=False)
    stored_filename = Column(String(255), unique=True, nullable=False)
    filepath = Column(String(500), nullable=False)
    size = Column(BigInteger, nullable=False, default=0)
    content_type = Column(String(100), nullable=False)
    status = Column(String(20), nullable=False, default="PENDING", index=True)
    remarks = Column(Text, nullable=True)
    extracted_text = Column(Text, nullable=True)

    uploaded_by = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    verified_by = Column(
        Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    uploader = relationship("User", foreign_keys=[uploaded_by], back_populates="uploaded_documents")
    verifier = relationship("User", foreign_keys=[verified_by], back_populates="verified_documents")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    document_id = Column(
        Integer, ForeignKey("documents.id", ondelete="SET NULL"), nullable=True, index=True
    )
    action = Column(String(255), nullable=False)
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    user = relationship("User", back_populates="audit_logs")


class PasswordHistory(Base):
    __tablename__ = "password_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    user = relationship("User", back_populates="password_history")


class RevokedToken(Base):
    """Blacklist of refresh tokens (by jti) for logout / forced re-login."""
    __tablename__ = "revoked_tokens"

    id = Column(Integer, primary_key=True, index=True)
    jti = Column(String(64), unique=True, nullable=False, index=True)
    user_id = Column(Integer, nullable=True, index=True)
    revoked_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
