from pydantic import BaseModel, EmailStr, ConfigDict
from datetime import datetime
from typing import Optional
from app.models.user import UserRole, UserDepartment

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: UserRole = UserRole.TECHNICIAN
    department: UserDepartment = UserDepartment.MECHANICAL
    is_active: bool = True

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    password: Optional[str] = None
    role: Optional[UserRole] = None
    department: Optional[UserDepartment] = None
    is_active: Optional[bool] = None

class UserRead(UserBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str