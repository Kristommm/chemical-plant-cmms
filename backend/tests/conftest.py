import pytest
from sqlalchemy import create_engine
from sqlalchemy.pool import StaticPool
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient

from app.main import app
from app.core.database import Base
from app.api.deps import get_db

# 1. Explicitly import all models so they attach to Base
from app.models.user import User
from app.models.work_order import WorkOrder

# 2. Use a true In-Memory SQLite database (No files generated!)
SQLALCHEMY_TEST_DATABASE_URL = "sqlite://" 

engine = create_engine(
    SQLALCHEMY_TEST_DATABASE_URL, 
    connect_args={"check_same_thread": False},
    poolclass=StaticPool  # Keeps the in-memory DB alive across the test
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="function")
def db_session():
    """Creates tables in memory, yields the session, then destroys them."""
    
    # --- DIAGNOSTIC CHECK ---
    # This will print the tables SQLAlchemy is about to create
    print("\n--- DIAGNOSTIC: TABLES REGISTERED ---")
    print(list(Base.metadata.tables.keys()))
    print("-------------------------------------\n")
    
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def client(db_session):
    """Overrides FastAPI's DB dependency to use the in-memory database."""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    
    with TestClient(app) as c:
        yield c