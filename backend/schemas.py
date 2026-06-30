"""Pydantic v2 schemas."""
import re
from datetime import datetime, date
from typing import Optional

from pydantic import BaseModel, EmailStr, Field, field_validator, ConfigDict

PASSWORD_RE = re.compile(
    r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,128}$"
)
ROLES = {"employee", "verifier", "admin"}


def _validate_password(value: str) -> str:
    if not PASSWORD_RE.match(value):
        raise ValueError(
            "Password must be 8-128 chars with upper, lower, number, and special character."
        )
    return value


# ---------- Auth ----------
class RegisterIn(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    phone: Optional[str] = Field(default=None, max_length=30)
    date_of_birth: Optional[date] = None
    gender: Optional[str] = Field(default=None, max_length=20)
    country: Optional[str] = Field(default=None, max_length=80)
    password: str = Field(..., min_length=8, max_length=128)
    confirm_password: str
    security_question_1: str = Field(..., min_length=3, max_length=255)
    security_answer_1: str = Field(..., min_length=1, max_length=255)
    security_question_2: str = Field(..., min_length=3, max_length=255)
    security_answer_2: str = Field(..., min_length=1, max_length=255)
    role: str = "employee"

    @field_validator("username")
    @classmethod
    def _uname(cls, v: str) -> str:
        v = v.strip()
        if not re.match(r"^[A-Za-z0-9_.-]+$", v):
            raise ValueError("Username may only contain letters, digits, _ . -")
        return v

    @field_validator("role")
    @classmethod
    def _role(cls, v: str) -> str:
        v = v.strip().lower()
        if v not in ROLES:
            raise ValueError(f"Role must be one of {ROLES}")
        return v

    @field_validator("password")
    @classmethod
    def _pw(cls, v: str) -> str:
        return _validate_password(v)

    @field_validator("confirm_password")
    @classmethod
    def _match(cls, v: str, info):
        if "password" in info.data and v != info.data["password"]:
            raise ValueError("Passwords do not match.")
        return v


class LoginIn(BaseModel):
    email: str
    password: str = Field(..., min_length=1)
    remember_me: bool = False


class OTPVerifyIn(BaseModel):
    email: str
    otp: str = Field(..., min_length=4, max_length=10)


class OTPResendIn(BaseModel):
    email: str


class ForgotPasswordIn(BaseModel):
    email: str
    first_name: str
    last_name: str
    date_of_birth: date
    security_answer_1: str
    security_answer_2: str


class ResetPasswordIn(BaseModel):
    token: str
    new_password: str
    confirm_password: str

    @field_validator("new_password")
    @classmethod
    def _pw(cls, v: str) -> str:
        return _validate_password(v)

    @field_validator("confirm_password")
    @classmethod
    def _match(cls, v: str, info):
        if "new_password" in info.data and v != info.data["new_password"]:
            raise ValueError("Passwords do not match.")
        return v


class ChangePasswordIn(BaseModel):
    old_password: str = Field(..., min_length=1)
    new_password: str

    @field_validator("new_password")
    @classmethod
    def _pw(cls, v: str) -> str:
        return _validate_password(v)


class RefreshIn(BaseModel):
    refresh_token: str


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


# ---------- User ----------
class UserResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    username: str
    email: str
    phone: Optional[str] = None
    role: str
    is_active: bool
    is_verified: bool
    force_password_change: bool
    created_at: datetime
    last_login: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)


class UserUpdate(BaseModel):
    first_name: Optional[str] = Field(default=None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(default=None, min_length=1, max_length=100)
    phone: Optional[str] = Field(default=None, max_length=30)
    country: Optional[str] = Field(default=None, max_length=80)


# ---------- Documents ----------
class DocumentResponse(BaseModel):
    id: int
    filename: str
    stored_filename: str
    size: int
    content_type: str
    status: str
    remarks: Optional[str] = None
    extracted_text: Optional[str] = None
    uploaded_by: int
    verified_by: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


class DocumentApproval(BaseModel):
    status: str
    remarks: Optional[str] = Field(default=None, max_length=1000)

    @field_validator("status")
    @classmethod
    def _s(cls, v: str) -> str:
        v = v.strip().upper()
        if v not in {"APPROVED", "REJECTED"}:
            raise ValueError("Status must be APPROVED or REJECTED.")
        return v


# ---------- Misc ----------
class MessageResponse(BaseModel):
    success: bool = True
    message: str


class StatsResponse(BaseModel):
    total_users: int
    total_documents: int
    pending_documents: int
    approved_documents: int
    rejected_documents: int
    total_verifiers: int
    total_admins: int


class AuditLogResponse(BaseModel):
    id: int
    user_id: int
    document_id: Optional[int]
    action: str
    ip_address: Optional[str]
    user_agent: Optional[str]
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
