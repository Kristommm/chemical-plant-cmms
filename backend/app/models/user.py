import enum
from datetime import datetime
from sqlalchemy import String, Boolean, DateTime, func, Enum as SQLEnum
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

# --- Base Class for all models ---
class Base(DeclarativeBase):
    pass

# --- 1. The Role Enum ---
class UserRole(str, enum.Enum):
    """
    Inheriting from 'str' ensures the enum values are serialized as standard 
    strings in JSON responses (crucial for FastAPI/Pydantic compatibility).
    """
    SYSTEM_ADMIN = "System Admin"
    PLANT_MANAGER = "Plant Manager"
    RELIABILITY_ENGINEER = "Reliability Engineer"
    TECHNICIAN = "Technician"
    OPERATOR = "Operator"

# --- 2. The User Model ---
class User(Base):
    __tablename__ = "users"

    # Primary Key
    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    # Core Information (Strictly typed with String limits for PostgreSQL)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    
    # Security
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)

    # --- The Cross-Database Magic for Enums ---
    # In PostgreSQL, this creates a highly efficient native ENUM type.
    # In SQLite, the 'create_constraint=True' creates a strict VARCHAR column 
    # that rejects any string not found in the UserRole class.
    role: Mapped[UserRole] = mapped_column(
        SQLEnum(UserRole, name="user_role_enum", create_constraint=True),
        default=UserRole.TECHNICIAN,
        nullable=False
    )

    # Status Flags
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Audit Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        server_default=func.now(), 
        onupdate=func.now(), 
        nullable=False
    )

    def __repr__(self) -> str:
        return f"<User(email='{self.email}', role='{self.role.value}')>"