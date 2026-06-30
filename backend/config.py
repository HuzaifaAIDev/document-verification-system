"""Centralized application configuration."""
import os
settings = Settings()

print("SECRET_KEY from os.getenv:", repr(os.getenv("SECRET_KEY")))
print("Settings.SECRET_KEY:", repr(settings.SECRET_KEY))

if not settings.SECRET_KEY:
    raise RuntimeError("SECRET_KEY missing. Copy .env.example to .env and set SECRET_KEY.")


def _bool(name: str, default: bool = False) -> bool:
    return os.getenv(name, str(default)).strip().lower() in {"1", "true", "yes", "on"}


def _int(name: str, default: int) -> int:
    try:
        return int(os.getenv(name, str(default)))
    except (TypeError, ValueError):
        return default


def _list(name: str, default: str) -> list[str]:
    raw = os.getenv(name, default)
    return [x.strip() for x in raw.split(",") if x.strip()]


class Settings:
    # App
    APP_NAME: str = os.getenv("APP_NAME", "Document Verification System")
    APP_VERSION: str = os.getenv("APP_VERSION", "1.0.0")
    DEBUG: bool = _bool("DEBUG", False)
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")

    # DB
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./document_verification.db")

    # JWT
    SECRET_KEY: str = os.getenv("SECRET_KEY", "")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = _int("ACCESS_TOKEN_EXPIRE_MINUTES", 15)
    REFRESH_TOKEN_EXPIRE_DAYS: int = _int("REFRESH_TOKEN_EXPIRE_DAYS", 7)

    # Frontend / CORS
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")
    CORS_ORIGINS: list[str] = _list("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")

    # Uploads
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "uploads")
    MAX_FILE_SIZE_MB: int = _int("MAX_FILE_SIZE_MB", 10)
    ALLOWED_EXTENSIONS: list[str] = _list("ALLOWED_EXTENSIONS", "pdf,jpg,jpeg,png,doc,docx")

    # Logging
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    LOG_FILE: str = os.getenv("LOG_FILE", "logs/app.log")

    # Security
    MAX_FAILED_LOGINS: int = _int("MAX_FAILED_LOGINS", 5)
    LOCKOUT_MINUTES: int = _int("LOCKOUT_MINUTES", 30)
    PASSWORD_HISTORY_SIZE: int = _int("PASSWORD_HISTORY_SIZE", 5)
    OTP_EXPIRY_MINUTES: int = _int("OTP_EXPIRY_MINUTES", 5)
    OTP_MAX_ATTEMPTS: int = _int("OTP_MAX_ATTEMPTS", 3)
    RESET_TOKEN_EXPIRY_MINUTES: int = _int("RESET_TOKEN_EXPIRY_MINUTES", 15)

    # OCR
    OCR_ENABLED: bool = _bool("OCR_ENABLED", False)
    OCR_LANGUAGE: str = os.getenv("OCR_LANGUAGE", "eng")

    # SMTP
    SMTP_HOST: str = os.getenv("SMTP_HOST", "")
    SMTP_PORT: int = _int("SMTP_PORT", 587)
    SMTP_USER: str = os.getenv("SMTP_USER", "")
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "")
    SMTP_FROM: str = os.getenv("SMTP_FROM", "no-reply@dvs.local")
    SMTP_FROM_NAME: str = os.getenv("SMTP_FROM_NAME", "Document Verification System")
    SMTP_TLS: bool = _bool("SMTP_TLS", True)
    SMTP_DEV_MODE: bool = _bool("SMTP_DEV_MODE", True)


settings = Settings()

if not settings.SECRET_KEY:
    raise RuntimeError("SECRET_KEY missing. Copy .env.example to .env and set SECRET_KEY.")
