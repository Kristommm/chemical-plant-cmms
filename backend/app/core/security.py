from datetime import datetime, timedelta, timezone
from typing import Any, Union
import jwt
from passlib.context import CryptContext
from app.core.config import settings

# --- Password Hashing Setup ---
# We tell passlib to use the bcrypt algorithm. The 'deprecated="auto"' 
# ensures that if bcrypt is ever updated, older hashes are still supported.
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Compares a plaintext password provided during login against 
    the hashed password stored in the PostgreSQL/SQLite database.
    """
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """
    Converts a plaintext password into a secure bcrypt hash 
    before saving it to the database.
    """
    return pwd_context.hash(password)


# --- JWT Token Setup ---
def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    
    # 3. USE modern timezone-aware UTC datetime
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        # Default expiration (e.g., 15 or 30 minutes depending on your setup)
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
        
    to_encode.update({"exp": expire})
    
    # 4. ENCODE the token (The syntax is exactly the same as jose!)
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt