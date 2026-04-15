from datetime import datetime, timedelta, timezone
from typing import Any, Union
from jose import jwt
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
def create_access_token(
    subject: Union[str, Any], expires_delta: timedelta = None
) -> str:
    """
    Generates a secure JSON Web Token (JWT) when a user logs in.
    The 'subject' (sub) is usually the user's ID or email.
    """
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    
    # The payload contains the data we want to embed in the token
    to_encode = {"exp": expire, "sub": str(subject)}
    
    # We sign the token using our SECRET_KEY. If a malicious actor intercepts 
    # the token and tries to change their ID to an Admin ID, the signature will break,
    # and FastAPI will reject the request.
    encoded_jwt = jwt.encode(
        to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM
    )
    
    return encoded_jwt