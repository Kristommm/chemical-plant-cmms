from app.core.database import SessionLocal

def get_db():
    """
    Dependency function that yields a database session for a single request,
    and ensures the session is cleanly closed after the request is finished.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()