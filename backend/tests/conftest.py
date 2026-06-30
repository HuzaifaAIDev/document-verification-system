import os, sys, pytest
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault("SECRET_KEY", "test_secret_key_for_pytest_only_xxxxxxxxxxxxxxxxxxxx")
os.environ.setdefault("DATABASE_URL", "sqlite:///./test_dvs.db")
os.environ.setdefault("SMTP_DEV_MODE", "True")

from fastapi.testclient import TestClient
from database import Base, engine
from main import app


@pytest.fixture(autouse=True)
def _fresh_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def client():
    return TestClient(app)
