REG = {
    "first_name": "Test", "last_name": "User", "username": "testuser",
    "email": "test@example.com", "phone": "1234567890",
    "date_of_birth": "1995-05-15", "gender": "male", "country": "Pakistan",
    "password": "Strong@2026", "confirm_password": "Strong@2026",
    "security_question_1": "Pet?", "security_answer_1": "Rex",
    "security_question_2": "City?", "security_answer_2": "Lahore",
    "role": "employee",
}


def _verified_login(client):
    client.post("/auth/register", json=REG)
    # Pull OTP from DB and verify
    from database import SessionLocal
    from models import User
    db = SessionLocal()
    user = db.query(User).filter(User.email == REG["email"]).first()
    user.is_verified = True
    db.commit()
    db.close()
    res = client.post("/auth/login", json={"email": REG["email"], "password": REG["password"]})
    return res.json()


def test_register_returns_user(client):
    r = client.post("/auth/register", json=REG)
    assert r.status_code == 201, r.text
    body = r.json()
    assert body["email"] == REG["email"]
    assert body["is_verified"] is False


def test_login_blocked_until_verified(client):
    client.post("/auth/register", json=REG)
    r = client.post("/auth/login", json={"email": REG["email"], "password": REG["password"]})
    assert r.status_code == 403


def test_login_succeeds_after_verification(client):
    tok = _verified_login(client)
    assert "access_token" in tok and "refresh_token" in tok


def test_me_requires_auth(client):
    assert client.get("/auth/me").status_code == 401


def test_me_returns_profile(client):
    tok = _verified_login(client)
    r = client.get("/auth/me", headers={"Authorization": f"Bearer {tok['access_token']}"})
    assert r.status_code == 200
    assert r.json()["email"] == REG["email"]


def test_refresh_rotates_token(client):
    tok = _verified_login(client)
    r = client.post("/auth/refresh", json={"refresh_token": tok["refresh_token"]})
    assert r.status_code == 200
    # old refresh token should now be revoked
    r2 = client.post("/auth/refresh", json={"refresh_token": tok["refresh_token"]})
    assert r2.status_code == 401


def test_password_policy_rejects_weak(client):
    bad = {**REG, "password": "weakpass", "confirm_password": "weakpass"}
    r = client.post("/auth/register", json=bad)
    assert r.status_code == 422
