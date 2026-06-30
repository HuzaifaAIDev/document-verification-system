"""SMTP email service with dev-mode fallback (logs emails instead of sending)."""
import logging
import smtplib
from email.message import EmailMessage

from config import settings

logger = logging.getLogger(__name__)


def _wrap(title: str, body_html: str) -> str:
    return f"""<!doctype html><html><body style="font-family:Inter,Arial,sans-serif;background:#f3f4f6;padding:32px;color:#0f172a">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;padding:32px;box-shadow:0 4px 20px rgba(0,0,0,.05)">
    <div style="text-align:center;margin-bottom:24px">
      <div style="display:inline-block;background:linear-gradient(135deg,#2563eb,#7c3aed);color:#fff;padding:10px 18px;border-radius:10px;font-weight:700">DVS</div>
    </div>
    <h2 style="margin:0 0 16px;color:#1e293b">{title}</h2>
    {body_html}
    <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0">
    <p style="font-size:12px;color:#64748b;text-align:center">{settings.APP_NAME} &middot; Automated message, do not reply.</p>
  </div></body></html>"""


def send_email(to: str, subject: str, html: str) -> bool:
    msg = EmailMessage()
    msg["From"] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_FROM}>"
    msg["To"] = to
    msg["Subject"] = subject
    msg.set_content("This email requires an HTML-capable client.")
    msg.add_alternative(html, subtype="html")

    if settings.SMTP_DEV_MODE or not settings.SMTP_HOST:
        logger.info("=" * 60)
        logger.info("[DEV EMAIL] To=%s | Subject=%s", to, subject)
        logger.info("%s", html)
        logger.info("=" * 60)
        return True

    try:
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=15) as srv:
            if settings.SMTP_TLS:
                srv.starttls()
            if settings.SMTP_USER:
                srv.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            srv.send_message(msg)
        logger.info("Email sent to %s", to)
        return True
    except Exception:
        logger.exception("Failed to send email to %s", to)
        return False


def send_otp_email(to: str, name: str, otp: str, minutes: int) -> bool:
    body = f"""
    <p>Hi <b>{name}</b>,</p>
    <p>Use the verification code below to complete your registration:</p>
    <div style="text-align:center;margin:24px 0">
      <div style="display:inline-block;font-size:32px;letter-spacing:10px;font-weight:800;color:#2563eb;background:#eff6ff;padding:16px 28px;border-radius:12px">{otp}</div>
    </div>
    <p>This code expires in <b>{minutes} minutes</b>. If you didn't request this, you can safely ignore this email.</p>
    """
    return send_email(to, "Your verification code", _wrap("Verify your email", body))


def send_password_reset_email(to: str, name: str, link: str, minutes: int) -> bool:
    body = f"""
    <p>Hi <b>{name}</b>,</p>
    <p>We received a request to reset your password. Click the button below to choose a new one:</p>
    <div style="text-align:center;margin:24px 0">
      <a href="{link}" style="background:linear-gradient(135deg,#2563eb,#7c3aed);color:#fff;text-decoration:none;padding:14px 28px;border-radius:10px;font-weight:600;display:inline-block">Reset Password</a>
    </div>
    <p style="font-size:13px;color:#64748b">Or copy this link: <br><span style="word-break:break-all">{link}</span></p>
    <p>This link expires in <b>{minutes} minutes</b> and can only be used once.</p>
    """
    return send_email(to, "Reset your password", _wrap("Password reset request", body))


def send_welcome_email(to: str, name: str) -> bool:
    body = f"<p>Hi <b>{name}</b>,</p><p>Welcome to {settings.APP_NAME}! Your account is verified and ready to use.</p>"
    return send_email(to, f"Welcome to {settings.APP_NAME}", _wrap("Welcome aboard", body))
