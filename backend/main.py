"""FastAPI application entrypoint."""
import logging
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from sqlalchemy.exc import SQLAlchemyError

from config import settings
from database import Base, engine
from middleware.audit_middleware import RequestAuditMiddleware
from middleware.rate_limiter import limiter
from middleware.security_headers import SecurityHeadersMiddleware
from routers import (
    admin_router, auth_router, document_router, user_router, verifier_router,
)

os.makedirs(os.path.dirname(settings.LOG_FILE) or ".", exist_ok=True)
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO),
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
    handlers=[logging.StreamHandler(), logging.FileHandler(settings.LOG_FILE)],
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    logger.info("%s v%s started", settings.APP_NAME, settings.APP_VERSION)
    yield
    logger.info("Shutting down")
#####################
print("CORS_ORIGINS =", settings.CORS_ORIGINS)

app = FastAPI(
    title=settings.APP_NAME, version=settings.APP_VERSION,
    description="Enterprise document verification system with JWT, OTP, OCR and audit logs.",
    lifespan=lifespan,
)

# Middleware
app.state.limiter = limiter
app.add_middleware(SlowAPIMiddleware)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RequestAuditMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(RateLimitExceeded)
async def _rate_limit(_: Request, exc: RateLimitExceeded):
    return JSONResponse(status_code=429, content={"success": False, "message": "Too many requests."})


@app.exception_handler(RequestValidationError)
async def _validation(_: Request, exc: RequestValidationError):
    return JSONResponse(status_code=422, content={"success": False, "message": "Validation Error", "errors": exc.errors()})


@app.exception_handler(HTTPException)
async def _http(_: Request, exc: HTTPException):
    return JSONResponse(status_code=exc.status_code, content={"success": False, "message": exc.detail})


@app.exception_handler(SQLAlchemyError)
async def _sql(_: Request, __: SQLAlchemyError):
    logger.exception("Database error")
    return JSONResponse(status_code=500, content={"success": False, "message": "Database error."})


@app.exception_handler(Exception)
async def _all(_: Request, __: Exception):
    logger.exception("Unhandled error")
    return JSONResponse(status_code=500, content={"success": False, "message": "Internal Server Error"})


@app.get("/", tags=["Root"])
async def root():
    return {"success": True, "message": settings.APP_NAME, "version": settings.APP_VERSION}


@app.get("/health", tags=["Health"])
async def health():
    return {"status": "healthy"}


app.include_router(auth_router.router)
app.include_router(user_router.router)
app.include_router(document_router.router)
app.include_router(verifier_router.router)
app.include_router(admin_router.router)
