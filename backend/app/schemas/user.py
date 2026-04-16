from pydantic import BaseModel, EmailStr, ConfigDict
from datetime import datetime
from typing import Optional
from app.models.user import UserRole, UserDepartment

# 1. Properties shared across all user schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: UserRole = UserRole.TECHNICIAN
    department: UserDepartment = UserDepartment.MECHANICAL
    is_active: bool = True

# 2. Properties required to CREATE a user (includes password)
class UserCreate(UserBase):
    password: str

# 3. Properties required to UPDATE a user
class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    password: Optional[str] = None
    role: Optional[UserRole] = None
    department: Optional[UserDepartment] = None
    is_active: Optional[bool] = None

# 4. Properties returned to the frontend (EXCLUDES password)
class UserRead(UserBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    # This allows Pydantic to read data directly from the SQLAlchemy model
    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str