"""Request audit middleware (light)."""
import logging
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

logger = logging.getLogger("audit.request")


class RequestAuditMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        if request.url.path.startswith(("/auth", "/documents", "/admin", "/verifier", "/users")):
            ip = request.headers.get("x-forwarded-for") or (request.client.host if request.client else "?")
            logger.info("%s %s -> %s (%s)", request.method, request.url.path, response.status_code, ip)
        return response
