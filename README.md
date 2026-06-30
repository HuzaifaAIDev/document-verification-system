# Document Verification System (DVS)

An enterprise-grade, full-stack document verification platform.

**Stack:** FastAPI · SQLAlchemy · Pydantic v2 · Alembic · React 18 · Vite · TailwindCSS · Recharts · JWT · OTP · OCR (Tesseract) · Docker.

## Features

- **Auth & Security**
  - Email/password registration with strong password policy
  - Email **OTP verification** (6-digit, hashed, expiring, rate-limited)
  - **Forgot-password flow** with security questions + DOB + name verification → emailed reset link → forced password change
  - JWT access + refresh tokens with **rotation** and **revocation** (logout/refresh blacklist)
  - Account lockout after repeated failed logins
  - Password history (no recent reuse)
  - Bcrypt-hashed passwords and security answers
  - CORS, security headers, rate limiting (`slowapi`)
- **Roles:** `employee`, `verifier`, `admin` (RBAC dependencies)
- **Documents:** Upload, list, download, delete with MIME + size + extension validation, filename sanitization, optional OCR text extraction (PDF / image)
- **Verification workflow:** Pending queue, approve/reject with remarks, verifier history
- **Admin console:** User CRUD, role changes, activation/deactivation, document oversight, audit log viewer, analytics
- **Audit logs** captured for all sensitive actions (IP + UA)
- **Frontend:** Premium dashboard UI (gradient + glass + dark mode), responsive, role-aware sidebar, charts, drag-and-drop upload, animated OTP input
- **Tooling:** Alembic migrations, Dockerfiles, docker-compose, pytest suite, seeded admin

## Project Layout

```
document_verification_system/
├── backend/                FastAPI service
│   ├── main.py             App entry, middleware, exception handlers
│   ├── config.py           Env-driven settings
│   ├── database.py         SQLAlchemy engine + session
│   ├── models.py           ORM models
│   ├── schemas.py          Pydantic schemas
│   ├── auth.py             Password hashing, authenticate_user
│   ├── dependencies.py     Auth / role / client-info dependencies
│   ├── routers/            auth, user, document, verifier, admin
│   ├── services/           jwt, email, otp, password_reset, user, file, ocr, audit
│   ├── middleware/         security headers, rate limiter, audit
│   ├── alembic/            Alembic migration env
│   ├── tests/              Pytest suite (TestClient)
│   ├── seed.py             Creates an initial admin
│   ├── requirements.txt
│   ├── .env.example
│   └── Dockerfile
├── frontend/               React 18 + Vite + Tailwind
│   ├── src/
│   │   ├── pages/          Login, Register, VerifyOTP, ForgotPassword,
│   │   │                   ResetPassword, Dashboard, UploadDocument,
│   │   │                   MyDocuments, VerifyDocuments, VerifierHistory,
│   │   │                   AdminDashboard, UserManagement, AuditLogs,
│   │   │                   Profile, NotFound
│   │   ├── components/     AuthLayout, AppShell, Navbar, Sidebar, StatCard,
│   │   │                   DashboardCard, DocumentCard, DataTable, Pagination,
│   │   │                   SearchBar, OTPInput, ConfirmModal, Loader, ProtectedRoute
│   │   ├── context/        AuthContext (login, logout, refresh)
│   │   ├── hooks/          useAuth
│   │   ├── services/       api, authService, documentService, adminService
│   │   └── routes/         AppRoutes
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vite.config.js
│   ├── Dockerfile
│   └── nginx.conf
└── docker-compose.yml
```

## Quickstart (local, no Docker)

### Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate    # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env and set a real SECRET_KEY:
#   python -c "import secrets; print(secrets.token_urlsafe(48))"
python seed.py                 # creates admin@dvs.local / Admin@2026
uvicorn main:app --reload      # http://localhost:8000   (Swagger at /docs)
```

Email defaults to **dev-mode**: outgoing emails (OTP, reset links) are printed
in the backend logs/console instead of being sent. Disable `SMTP_DEV_MODE` and
fill in `SMTP_*` to use a real SMTP server (Mailtrap, Gmail app password, SendGrid…).

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev                    # http://localhost:5173
```

## Run with Docker Compose

```bash
cd document_verification_system
cp backend/.env.example backend/.env  # then set SECRET_KEY
docker compose up --build
```

- Frontend: <http://localhost:5173>
- Backend:  <http://localhost:8000/docs>
- Postgres: localhost:5432 (dvs/dvs)
- Default admin: **admin@dvs.local / Admin@2026**

## Alembic Migrations

```bash
cd backend
alembic revision --autogenerate -m "init"
alembic upgrade head
```

(Models include `Base.metadata.create_all(...)` on startup as a fallback for
dev. Use Alembic for production.)

## Tests

```bash
cd backend
pytest -q
```

## Default Roles

| Role     | Capabilities                                             |
|----------|----------------------------------------------------------|
| employee | Upload, view, download, delete own documents             |
| verifier | Browse pending queue, approve/reject with remarks        |
| admin    | All of the above + user mgmt + analytics + audit logs    |

Self-registration is restricted to `employee`. Admins promote users via the
admin console.

## Security Notes

- Always set a strong `SECRET_KEY` in `.env`. Rotate periodically.
- Use HTTPS in production and enable `Secure` cookies on your reverse proxy.
- Configure a real SMTP provider before enabling password reset in prod.
- Add daily backups for the database and `uploads/` directory.

## Email Flows (Dev Mode)

Watch the backend logs after registering or requesting a password reset:

```
INFO ... [DEV EMAIL] To=you@example.com | Subject=Your verification code
INFO ... <html>...123456...</html>
```

Copy the OTP / reset link out of the logs and paste it into the UI.

---

Built for production demos, internships, and real-world adoption.


## Author

Muhammad Huzaifa

BS Artificial Intelligence

GitHub: https://github.com/HuzaifaAIDev

LinkedIn: https://linkedin.com/in/yourprofile
