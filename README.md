# Document Verification System (DVS)

![Python](https://img.shields.io/badge/Python-3.11-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-Framework-009688)
![React](https://img.shields.io/badge/React-18-61DAFB)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supported-336791)
![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED)
![JWT](https://img.shields.io/badge/Auth-JWT-orange)
![License](https://img.shields.io/badge/License-MIT-yellow)

An **enterprise-grade full-stack document verification platform** designed for secure document submission, verification, and management workflows.

The system provides **role-based access control (RBAC)**, **OTP verification**, **JWT authentication with refresh token rotation**, **OCR-powered document extraction**, **audit logging**, and a modern **React dashboard** for employees, verifiers, and administrators.

Built using **FastAPI**, **React**, **PostgreSQL**, **Docker**, and industry-standard security practices.

---

# Features

## Authentication & Security

- Email/password registration
- Strong password policy enforcement
- Email OTP verification
- JWT access tokens
- JWT refresh tokens with rotation
- Token revocation/blacklisting
- Account lockout after repeated failures
- Password history validation
- Forgot-password workflow
- Security questions verification
- Date-of-birth verification
- Password reset email flow
- BCrypt password hashing
- Secure password storage
- Rate limiting
- Security headers middleware
- CORS protection

---

## Role-Based Access Control (RBAC)

The system supports three user roles:

| Role | Permissions |
|------|-------------|
| Employee | Upload and manage personal documents |
| Verifier | Verify and reject submitted documents |
| Admin | Complete system administration |

Self-registration is restricted to employee accounts. Administrators can promote users through the admin dashboard.

---

## Document Management

- Secure document uploads
- File type validation
- MIME validation
- File size validation
- Filename sanitization
- Download documents
- Delete documents
- OCR text extraction
- PDF support
- Image support
- Document status tracking

---

## Verification Workflow

- Pending verification queue
- Approve documents
- Reject documents
- Verification remarks
- Verification history
- Audit trail tracking

---

## Admin Dashboard

- User management
- Role management
- Account activation/deactivation
- Document oversight
- Analytics dashboard
- Audit log viewer
- Verification statistics
- Security monitoring

---

## Audit Logging

All sensitive actions are recorded including:

- Login attempts
- Password changes
- Document uploads
- Verification actions
- User management
- Role changes
- Administrative actions
- Client IP addresses
- User agent information

---

## Frontend Features

- React 18
- Vite
- TailwindCSS
- Dark mode
- Responsive dashboard
- Glassmorphism UI
- Animated OTP inputs
- Charts and analytics
- Drag-and-drop uploads
- Role-aware navigation

---

# Tech Stack

| Category | Technology |
|----------|------------|
| Backend | FastAPI |
| Frontend | React 18 |
| Styling | TailwindCSS |
| Database | PostgreSQL |
| ORM | SQLAlchemy 2.0 |
| Validation | Pydantic v2 |
| Authentication | JWT |
| Password Hashing | BCrypt |
| OCR | Tesseract OCR |
| Migrations | Alembic |
| Charts | Recharts |
| Testing | Pytest |
| Containerization | Docker |

---

# System Architecture

```text
                React Frontend
                       │
                       ▼
                FastAPI Backend
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
 Authentication    Business Logic    OCR Service
        │              │              │
        └──────────────┼──────────────┘
                       ▼
                 SQLAlchemy ORM
                       │
                       ▼
                  PostgreSQL
```

---

# Project Structure

```text
document_verification_system/

├── backend/
│   ├── main.py
│   ├── config.py
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   ├── auth.py
│   ├── dependencies.py
│   │
│   ├── routers/
│   │   ├── auth
│   │   ├── user
│   │   ├── document
│   │   ├── verifier
│   │   └── admin
│   │
│   ├── services/
│   │   ├── jwt
│   │   ├── email
│   │   ├── otp
│   │   ├── password_reset
│   │   ├── file
│   │   ├── ocr
│   │   └── audit
│   │
│   ├── middleware/
│   │   ├── security
│   │   ├── audit
│   │   └── rate_limit
│   │
│   ├── alembic/
│   ├── tests/
│   ├── seed.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── context/
│   │   └── routes/
│   │
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vite.config.js
│   ├── Dockerfile
│   └── nginx.conf
│
└── docker-compose.yml
```

---

# Security Features

✅ JWT Authentication  
✅ Refresh Token Rotation  
✅ Token Revocation  
✅ Password History Enforcement  
✅ Account Lockout  
✅ OTP Verification  
✅ Rate Limiting  
✅ Security Headers  
✅ Role-Based Access Control  
✅ Audit Logging  
✅ BCrypt Password Hashing  
✅ Secure Password Reset Workflow

---

# Local Development Setup

## Clone Repository

```bash
git clone https://github.com/HuzaifaAIDev/document-verification-system.git
cd document-verification-system
```

---

## Backend Setup

```bash
cd backend
```

### Windows

```bash
python -m venv .venv
.venv\Scripts\activate
```

### Linux/macOS

```bash
python -m venv .venv
source .venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create environment file:

```bash
cp .env.example .env
```

Generate a secure secret key:

```bash
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

Add the generated value to:

```env
SECRET_KEY=your-secret-key
```

Create the development administrator:

```bash
python seed.py
```

> **Note:** `seed.py` creates a default development administrator account. Change all credentials before deploying to production.

Run backend:

```bash
uvicorn main:app --reload
```

Available endpoints:

| Service | URL |
|---------|-----|
| Backend | http://localhost:8000 |
| Swagger | http://localhost:8000/docs |
| ReDoc | http://localhost:8000/redoc |

---

## Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

# Docker Deployment

```bash
cp backend/.env.example backend/.env
docker compose up --build
```

Services:

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend | http://localhost:8000 |
| Swagger | http://localhost:8000/docs |
| PostgreSQL | localhost:5432 |

---

# Database Migrations

Create migration:

```bash
alembic revision --autogenerate -m "migration"
```

Apply migration:

```bash
alembic upgrade head
```

Rollback migration:

```bash
alembic downgrade -1
```

---

# Running Tests

```bash
cd backend
pytest
```

Verbose mode:

```bash
pytest -v
```

---

# API Modules

| Endpoint | Description |
|----------|-------------|
| `/auth` | Authentication and authorization |
| `/users` | User management |
| `/documents` | Document operations |
| `/verifier` | Verification workflow |
| `/admin` | Administrative operations |

---

# OCR Support

Supported file types:

- PDF
- PNG
- JPG
- JPEG

OCR Engine:

- Tesseract OCR

Extracted text can be used for:

- Verification
- Search
- Analytics
- Validation

---

# Screenshots

> Add screenshots after deployment.

### Login Page

![Login](screenshots/login.png)

### OTP Verification

![OTP](screenshots/otp.png)

### Dashboard

![Dashboard](screenshots/dashboard.png)

### Document Upload

![Upload](screenshots/upload.png)

### Verification Panel

![Verifier](screenshots/verifier.png)

### Admin Dashboard

![Admin](screenshots/admin.png)

### Audit Logs

![Audit](screenshots/audit.png)

---

# Future Improvements

- Multi-factor authentication
- Redis caching
- Elasticsearch integration
- Document watermarking
- Virus scanning
- Kubernetes deployment
- CI/CD pipeline
- WebSocket notifications
- AI-powered document validation
- Blockchain-based verification

---

# Production Recommendations

- Enable HTTPS
- Configure secure cookies
- Use managed PostgreSQL
- Enable automated backups
- Configure production SMTP
- Rotate secrets regularly
- Enable centralized logging
- Add monitoring and alerting

---

# Author

## Hafiz Muhammad Huzaifa

**Bachelor of Science in Artificial Intelligence**

- GitHub: https://github.com/HuzaifaAIDev

---

# License

This project is licensed under the MIT License.

See the [LICENSE](LICENSE) file for details.

---

# Support

If you found this project useful, consider giving it a ⭐ on GitHub.
