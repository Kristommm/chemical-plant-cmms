from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserCreate
from app.core.security import get_password_hash
from app.core.security import verify_password

def get_user(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(User).offset(skip).limit(limit).all()

def create_user(db: Session, user: UserCreate):
    # Hash the password before saving!
    hashed_password = get_password_hash(user.password)
    
    # Create the SQLAlchemy model instance
    db_user = User(
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        hashed_password=hashed_password,
        department=user.department,
        is_active=user.is_active
    )
    
    # Add to session, commit to database, and refresh to get the generated ID
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user

def authenticate_user(db: Session, email: str, password: str):
    """
    Checks if a user exists and verifies their password.
    Returns the User object if successful, or False if it fails.
    """
    user = get_user_by_email(db, email=email)
    if not user:
        return None
    
    if not verify_password(plain_password=password, hashed_password=user.hashed_password):
        return None
        
    return user