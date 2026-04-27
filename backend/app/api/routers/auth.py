from fastapi import APIRouter, Depends, HTTPException, Response, Cookie
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
import jwt

from app.api.deps import get_db
from app.crud.user import authenticate_user
from app.core.security import create_access_token
from app.core.security import settings

router = APIRouter(tags=["Authentication"])

@router.post("/login")
def login(response: Response, form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # Your existing user verification logic goes here...
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    # 1. Create the fast, short-lived Access Token (e.g., 15 minutes)
    access_token = create_access_token(
        data={"sub": str(user.id)}, expires_delta=timedelta(minutes=15)
    )
    
    # 2. Create the long-lived Refresh Token (e.g., 7 days)
    refresh_token = create_access_token(
        data={"sub": str(user.id)}, expires_delta=timedelta(days=7)
    )
    
    # 3. Attach the Refresh Token to the response as an HttpOnly Cookie
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,  # Hides it from JavaScript entirely
        secure=True,    # Ensures it only sends over HTTPS (set to False if testing on localhost HTTP)
        samesite="lax", # Protects against CSRF attacks
        max_age=7 * 24 * 60 * 60 # 7 days in seconds
    )
    
    # We still send the access token back as JSON for React to put in localStorage
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/refresh")
def refresh_access_token(refresh_token: str = Cookie(None)):
    if refresh_token is None:
        raise HTTPException(status_code=401, detail="Refresh token missing. Please log in.")
        
    try:
        # 4. PyJWT handles the decoding and throws specific exceptions
        payload = jwt.decode(refresh_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id = payload.get("sub")
        
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token payload structure")
            
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Refresh token expired. Please log in.")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
        
    # 5. Issue new short-lived Access Token
    new_access_token = create_access_token(
        data={"sub": str(user_id)}, 
        expires_delta=timedelta(minutes=15)
    )
    
    return {"access_token": new_access_token, "token_type": "bearer"}