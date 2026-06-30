"""Seed initial admin users. Run with: python seed.py"""

import os, sys
from datetime import date

sys.path.insert(0, os.path.dirname(__file__))

from database import Base, SessionLocal, engine
from models import PasswordHistory, User
from auth import hash_password, hash_security_answer

Base.metadata.create_all(bind=engine)

ADMIN_PASSWORD = os.getenv("SEED_ADMIN_PASSWORD", "Admin@2026")

ADMINS = [
    "admin@dvs.local",
    "ali@dvs.local",
    "hassan@dvs.local",
    "rabeet@dvs.local",
    "hamza@dvs.local",
]

db = SessionLocal()

try:
    for email in ADMINS:
        existing_user = db.query(User).filter(User.email == email).first()

        if existing_user:
            print(f"User already exists: {email}")
            continue

        admin = User(
            first_name="System",
            last_name="Admin",
            username=email.split("@")[0],
            email=email,
            phone="0000000000",
            date_of_birth=date(1990, 1, 1),
            gender="other",
            country="N/A",
            hashed_password=hash_password(ADMIN_PASSWORD),
            role="admin",
            is_active=True,
            is_verified=True,
            security_question_1="What is your favorite color?",
            security_answer_1_hash=hash_security_answer("blue"),
            security_question_2="What was your first school?",
            security_answer_2_hash=hash_security_answer("central"),
        )

        db.add(admin)
        db.flush()

        db.add(
            PasswordHistory(
                user_id=admin.id,
                hashed_password=admin.hashed_password
            )
        )

        print(f"Created admin: {email}")

    db.commit()

finally:
    db.close()