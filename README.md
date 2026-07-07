# 📄 Document Verification System (DVS)

![Python](https://img.shields.io/badge/Python-3.11-blue?style=for-the-badge\&logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge\&logo=fastapi)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge\&logo=react)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge\&logo=postgresql)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge\&logo=docker)
![JWT](https://img.shields.io/badge/JWT-Authentication-orange?style=for-the-badge)
![MIT License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

An **enterprise-grade full-stack Document Verification System** built with **FastAPI**, **React**, **PostgreSQL**, and **Docker**.

The application enables organizations to securely manage document verification workflows through **Role-Based Access Control (RBAC)**, **JWT Authentication**, **Email OTP Verification**, **OCR-powered document processing**, **Audit Logging**, and a modern responsive dashboard for **Employees**, **Verifiers**, and **Administrators**.

Designed with scalability, maintainability, and security in mind, this project demonstrates industry-standard backend architecture and modern frontend development practices.

---

# 🖼️ Application Preview

![Admin Dashboard](images_folder/admin_dashboard.jpg)

---

# ✨ Table of Contents

* Overview
* Key Features
* Role-Based Access Control
* Technology Stack
* System Architecture
* Project Structure
* Installation
* Backend Setup
* Frontend Setup
* Docker Deployment
* Database Migration
* API Documentation
* OCR Support
* Screenshots
* Security Features
* Future Improvements
* Contributing
* License
* Author

---

# 🚀 Overview

The **Document Verification System** simplifies and secures document verification processes by providing separate dashboards for different user roles.

Employees can upload and manage their documents, Verifiers can review and approve submitted files, while Administrators have complete control over users, verification workflows, audit logs, and system monitoring.

The application follows modern software engineering practices including:

* Clean architecture
* RESTful APIs
* Secure authentication
* Token-based authorization
* OCR document extraction
* Comprehensive audit logging
* Responsive React frontend
* Docker containerization

---

# ⭐ Key Features

## 🔐 Authentication & Security

* Email Registration
* Secure Login
* Strong Password Policy
* Email OTP Verification
* JWT Authentication
* Refresh Token Rotation
* Token Revocation
* Account Lockout Protection
* Password History Validation
* Forgot Password Workflow
* Security Questions Verification
* Date of Birth Verification
* BCrypt Password Hashing
* Security Headers Middleware
* Rate Limiting
* CORS Protection

---

## 👥 Role-Based Access Control (RBAC)

Three independent roles are supported throughout the application.

| Role             | Responsibilities                               |
| ---------------- | ---------------------------------------------- |
| 👤 Employee      | Upload and manage personal documents           |
| ✅ Verifier       | Review, approve and reject submitted documents |
| 👑 Administrator | Complete system administration and monitoring  |

Administrators can promote users, manage permissions, monitor verification activities, and oversee the entire platform.

---

## 📂 Document Management

* Secure File Upload
* PDF Support
* Image Support
* File Type Validation
* MIME Validation
* File Size Validation
* Filename Sanitization
* OCR Text Extraction
* Document Preview
* Download Documents
* Delete Documents
* Verification Status Tracking

---

## ✅ Verification Workflow

The verification lifecycle includes:

* Pending Queue
* Review Requests
* Document Approval
* Document Rejection
* Verification Remarks
* Verification History
* Audit Trail

---

## 👨‍💼 Administration

Administrators have access to:

* User Management
* Role Management
* Account Activation
* Account Deactivation
* User Profiles
* Verification Statistics
* Document Oversight
* Audit Log Viewer
* Security Monitoring

---

## 📊 Audit Logging

Every important activity is securely recorded, including:

* User Login
* Logout
* Registration
* Password Changes
* Password Reset Requests
* Document Uploads
* Verification Decisions
* User Management
* Role Changes
* Administrative Operations
* Client IP Address
* Browser Information

---

## 🎨 Frontend Features

* React 18
* Vite
* Tailwind CSS
* Responsive Design
* Dark Mode
* Glassmorphism UI
* Animated Components
* OTP Input Component
* Charts & Analytics
* Drag & Drop Uploads
* Protected Routes
* Role-Based Navigation

---

# 🛠️ Technology Stack

| Category           | Technology     |
| ------------------ | -------------- |
| Backend            | FastAPI        |
| Frontend           | React 18       |
| Styling            | Tailwind CSS   |
| Database           | PostgreSQL     |
| ORM                | SQLAlchemy 2.0 |
| Validation         | Pydantic v2    |
| Authentication     | JWT            |
| Password Hashing   | BCrypt         |
| OCR Engine         | Tesseract OCR  |
| Database Migration | Alembic        |
| Charts             | Recharts       |
| Testing            | Pytest         |
| Containerization   | Docker         |
| Version Control    | Git & GitHub   |

---

# 🏗️ System Architecture

```text
                        React Frontend
                              │
                              │ REST API
                              ▼
                     FastAPI Backend
                              │
     ┌───────────────┬───────────────┬───────────────┐
     ▼               ▼               ▼
 Authentication   Business Logic   OCR Processing
     │               │               │
     └───────────────┼───────────────┘
                     ▼
             SQLAlchemy ORM
                     │
                     ▼
               PostgreSQL
```

---

# 📁 Project Structure

```text
document-verification-system/
│
├── backend/
│   ├── routers/
│   ├── services/
│   ├── middleware/
│   ├── models.py
│   ├── schemas.py
│   ├── database.py
│   ├── config.py
│   ├── auth.py
│   ├── dependencies.py
│   ├── main.py
│   ├── requirements.txt
│   ├── seed.py
│   ├── Dockerfile
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── routes/
│   │   └── services/
│   │
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── Dockerfile
│   └── nginx.conf
│
├── images_folder/
│   ├── admin_dashboard.jpg
│   ├── employee_dashboard.jpg
│   ├── verifier_dashboard.jpg
│   ├── verify_document.jpg
│   ├── upload_document.jpg
│   └── ...
│
├── docker-compose.yml
├── README.md
└── LICENSE
```

---

# 🔒 Security Highlights

* ✅ JWT Authentication
* ✅ Refresh Token Rotation
* ✅ Email OTP Verification
* ✅ BCrypt Password Hashing
* ✅ Secure Password Reset Workflow
* ✅ Password History Validation
* ✅ Account Lockout Protection
* ✅ Role-Based Authorization (RBAC)
* ✅ Audit Logging
* ✅ Security Headers
* ✅ Rate Limiting
* ✅ CORS Protection

# ⚙️ Local Development Setup

## 📋 Prerequisites

Before running the project, ensure the following software is installed:

| Software                    | Recommended Version |
| --------------------------- | ------------------- |
| Python                      | 3.11+               |
| Node.js                     | 18+                 |
| npm                         | Latest              |
| PostgreSQL                  | 15+                 |
| Git                         | Latest              |
| Docker Desktop *(Optional)* | Latest              |
| Tesseract OCR               | Latest              |

---

# 📥 Clone the Repository

```bash
git clone https://github.com/HuzaifaAIDev/document-verification-system.git

cd document-verification-system
```

---

# 🖥️ Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

---

## Create Virtual Environment

### Windows

```bash
python -m venv .venv

.venv\Scripts\activate
```

### Linux / macOS

```bash
python3 -m venv .venv

source .venv/bin/activate
```

---

## Install Dependencies

```bash
pip install --upgrade pip

pip install -r requirements.txt
```

---

## Configure Environment Variables

Create a local environment file:

```bash
cp .env.example .env
```

For Windows (PowerShell), if `cp` is unavailable:

```powershell
copy .env.example .env
```

Open the `.env` file and configure the required values.

Example:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/document_verification

SECRET_KEY=your-generated-secret-key

ACCESS_TOKEN_EXPIRE_MINUTES=30

REFRESH_TOKEN_EXPIRE_DAYS=7

ALGORITHM=HS256

SMTP_SERVER=smtp.gmail.com

SMTP_PORT=587

SMTP_USERNAME=your-email@gmail.com

SMTP_PASSWORD=your-app-password

EMAIL_FROM=your-email@gmail.com

FRONTEND_URL=http://localhost:5173
```

> **Important:** Never commit your `.env` file to GitHub. Only commit `.env.example`.

---

## Generate a Secure Secret Key

Generate a secure secret key:

```bash
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

Copy the generated key into:

```env
SECRET_KEY=
```

---

## Create the Development Administrator

Run:

```bash
python seed.py
```

This script creates the default administrator account for local development.

> Change the default credentials before deploying the application to production.

---

## Run the Backend Server

```bash
uvicorn main:app --reload
```

Backend will be available at:

```text
http://localhost:8000
```

---

# 📚 API Documentation

FastAPI automatically generates interactive API documentation.

| Documentation  | URL                                |
| -------------- | ---------------------------------- |
| Swagger UI     | http://localhost:8000/docs         |
| ReDoc          | http://localhost:8000/redoc        |
| OpenAPI Schema | http://localhost:8000/openapi.json |

---

# 🌐 Frontend Setup

Open a new terminal.

Navigate to the frontend:

```bash
cd frontend
```

---

## Install Dependencies

```bash
npm install
```

---

## Configure Frontend Environment

Create the environment file:

```bash
cp .env.example .env
```

Example:

```env
VITE_API_URL=http://localhost:8000
```

---

## Start Development Server

```bash
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

# 🐳 Docker Deployment

Docker allows the complete application stack to run inside containers.

---

## Configure Backend Environment

```bash
cp backend/.env.example backend/.env
```

Update all required environment variables before deployment.

---

## Build Containers

```bash
docker compose build
```

---

## Start Containers

```bash
docker compose up
```

or

```bash
docker compose up --build
```

---

## Run in Detached Mode

```bash
docker compose up -d
```

---

## Stop Containers

```bash
docker compose down
```

---

# 🗄️ Services

| Service         | URL                        |
| --------------- | -------------------------- |
| React Frontend  | http://localhost:5173      |
| FastAPI Backend | http://localhost:8000      |
| Swagger UI      | http://localhost:8000/docs |
| PostgreSQL      | localhost:5432             |

---

# 🗃️ Database Migration

This project uses **Alembic** for version-controlled database migrations.

---

## Generate Migration

```bash
alembic revision --autogenerate -m "Initial Migration"
```

---

## Apply Migration

```bash
alembic upgrade head
```

---

## Roll Back One Migration

```bash
alembic downgrade -1
```

---

## Show Current Migration

```bash
alembic current
```

---

# 🧪 Running Tests

Navigate to the backend directory:

```bash
cd backend
```

Run all tests:

```bash
pytest
```

Run with verbose output:

```bash
pytest -v
```

Generate a coverage report (if configured):

```bash
pytest --cov=.
```

---

# 📡 API Modules

| Endpoint     | Description                           |
| ------------ | ------------------------------------- |
| `/auth`      | User authentication and authorization |
| `/users`     | User profile management               |
| `/documents` | Upload and document management        |
| `/verifier`  | Document verification workflow        |
| `/admin`     | Administrative operations             |

---

# 🔄 Verification Workflow

```text
Employee
    │
    ▼
Upload Document
    │
    ▼
Pending Verification
    │
    ▼
Verifier Review
    │
 ┌──┴────────────┐
 │               │
 ▼               ▼
Approved      Rejected
 │               │
 ▼               ▼
Visible to User with Status
```

---

# 📁 Supported File Types

The application currently supports:

* PDF (.pdf)
* PNG (.png)
* JPG (.jpg)
* JPEG (.jpeg)

Additional formats can be integrated in future releases.

---

# 🔍 OCR Processing

The system integrates **Tesseract OCR** for extracting text from uploaded documents.

Extracted text can be utilized for:

* Document verification
* Search functionality
* Metadata extraction
* Data validation
* Future AI-powered document analysis

OCR supports both scanned images and PDF documents.


# 📸 Application Screenshots

The following screenshots demonstrate the primary workflows and interfaces available within the Document Verification System.

---

## 🔐 Sign In

![Sign In](images_folder/signin.jpg)

---

## 📝 Sign Up

![Sign Up](images_folder/signup.jpg)

---

## 🔑 Reset Password

![Reset Password](images_folder/reset_password.jpg)

---

## 👤 Employee Dashboard

![Employee Dashboard](images_folder/employee_dashboard.jpg)

---

## 📤 Upload Document

![Upload Document](images_folder/upload_document.jpg)

---

## 📂 My Documents

![My Documents](images_folder/my_documents.jpg)

---

## 👤 Employee Profile

![Employee Profile](images_folder/employee_profile.jpg)

---

## ✅ Verifier Dashboard

![Verifier Dashboard](images_folder/verifier_dashboard.jpg)

---

## 📄 Verify Document

![Verify Document](images_folder/verify_document.jpg)

---

## 📜 Verification History

![Verification History](images_folder/verification_history.jpg)

---

## 👥 Verifier User Details

![Verifier User Details](images_folder/verifier_user_detail.jpg)

---

## 👤 Verifier Profile

![Verifier Profile](images_folder/verifier_profile.jpg)

---

## 👑 Admin Dashboard

![Admin Dashboard](images_folder/admin_dashboard.jpg)

---

## ⚙️ Admin Console

![Admin Console](images_folder/admin_console.jpg)

---

## 👥 User Management

![User Management](images_folder/user_management.jpg)

---

## 📋 Audit Logs

![Audit Logs](images_folder/audit_logs.jpg)

---

## 👤 Admin Profile

![Admin Profile](images_folder/admin_profile.jpg)

---

# 🔒 Security Features

The application has been designed with security as a primary objective.

### Authentication

* JWT Access Tokens
* Refresh Token Rotation
* Secure Logout
* Token Revocation
* Email OTP Verification
* Password Reset Workflow

### Password Protection

* BCrypt Password Hashing
* Password History Validation
* Strong Password Policy
* Account Lockout Protection

### API Security

* Role-Based Access Control (RBAC)
* Security Headers Middleware
* CORS Protection
* Request Validation
* Rate Limiting

### Monitoring

* Audit Logging
* User Activity Tracking
* Login History
* Verification History
* Administrative Action Logging

---

# 🚀 Future Improvements

The project roadmap includes several enhancements aimed at improving scalability, security, and user experience.

## Planned Features

* Multi-Factor Authentication (MFA)
* Redis Caching
* Elasticsearch Integration
* AI-Powered Document Validation
* Automatic Fraud Detection
* Virus & Malware Scanning
* Digital Signatures
* Watermarking
* WebSocket Notifications
* Email Notifications
* SMS Notifications
* Kubernetes Deployment
* CI/CD Pipeline
* Cloud Storage Integration
* Background Task Processing
* Monitoring with Prometheus & Grafana
* API Rate Analytics
* Mobile Application Support

---

# 🌍 Production Deployment Recommendations

Before deploying to production, it is recommended to:

* Enable HTTPS using a trusted SSL certificate.
* Store secrets securely using environment variables or a secrets manager.
* Use a managed PostgreSQL database.
* Configure automated database backups.
* Use a production SMTP provider.
* Enable centralized logging.
* Monitor application health.
* Configure reverse proxy (Nginx or Traefik).
* Enable firewall rules.
* Rotate secrets regularly.
* Restrict CORS origins.
* Configure secure cookies.
* Enable automatic security updates.

---

# 🤝 Contributing

Contributions are welcome and appreciated.

If you would like to contribute:

1. Fork the repository.
2. Create a feature branch.

```bash
git checkout -b feature/your-feature
```

3. Commit your changes.

```bash
git commit -m "Add new feature"
```

4. Push your branch.

```bash
git push origin feature/your-feature
```

5. Open a Pull Request.

Please ensure that:

* Code follows the existing style.
* New functionality includes appropriate tests where applicable.
* Documentation is updated for any new features.

---

# 📜 License

This project is licensed under the **MIT License**.

See the `LICENSE` file for additional details.

---

# 👨‍💻 Author

## Hafiz Muhammad Huzaifa

**Bachelor of Science in Artificial Intelligence**

Passionate about building secure, scalable, and production-ready AI and Full-Stack applications using modern software engineering practices.

### Connect With Me

* **GitHub:** https://github.com/HuzaifaAIDev

---

# ⭐ Acknowledgements

Special thanks to the open-source community and the maintainers of the technologies used in this project.

This project is powered by:

* FastAPI
* React
* PostgreSQL
* SQLAlchemy
* Pydantic
* Docker
* Tesseract OCR
* Tailwind CSS
* Alembic
* Pytest

---

# 💡 Support

If you find this project helpful:

⭐ Star the repository

🍴 Fork the repository

🐞 Report issues

💬 Share suggestions

📢 Share the project with others

Your support helps improve the project and motivates future development.

---

# ❤️ Thank You

Thank you for taking the time to explore the **Document Verification System**.

Feedback, suggestions, and contributions are always welcome.
