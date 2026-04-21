import enum
from datetime import datetime
from sqlalchemy import String, Boolean, DateTime, func, Enum as SQLEnum
from sqlalchemy.orm import  Mapped, mapped_column, relationship
from typing import TYPE_CHECKING
from app.core.database import Base

if TYPE_CHECKING:
    from app.models.moc import ManagementOfChange

class UserRole(str, enum.Enum):
    SYSTEM_ADMIN = "System Admin"
    PLANT_MANAGER = "Plant Manager"
    RELIABILITY_ENGINEER = "Reliability Engineer"
    TECHNICIAN = "Technician"
    OPERATOR = "Operator"

class UserDepartment(str, enum.Enum):
    FATTY_ACID_PLANT = "Fatty Acid Plant"
    FATTY_ALCOHOL_PLANT = "Fatty Alcohol Plant"
    REFINERY_PLANT = "Refinery Plant"
    PRODUCTION = "Production"
    ELECTRICAL = "Electrical"
    MECHANICAL = "Mechanical"
    UTILITIES = "Utilities"
    INSTRUMENTATION = "Instrumentation"
    WAREHOUSE = "Warehouse"
    LOGISTICS = "Logistics"
    CIVIL = "Civil"
    HR_ADMIN = "Human Resources and Admin"
    HSSE = "Health, Safety, Security and Environment"
    QA = "Quality Assurance"
    ACCOUNTING = "Accounting"
    LEGAL = "Legal"
    IT = "IT"

class User(Base):
    __tablename__ = "users"

    # Primary Key
    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    # Core Information (Strictly typed with String limits for PostgreSQL)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    
    # Security
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)

    role: Mapped[UserRole] = mapped_column(
        SQLEnum(UserRole, name="user_role_enum", create_constraint=True),
        default=UserRole.TECHNICIAN,
        nullable=False
    )

    department: Mapped[UserDepartment] = mapped_column(
        SQLEnum(UserDepartment, name="user_department_enum", create_constraint=True),
        default=UserDepartment.MECHANICAL,
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

    initiated_mocs: Mapped[list["ManagementOfChange"]] = relationship(
        "ManagementOfChange", 
        foreign_keys="[ManagementOfChange.initiator_id]", 
        back_populates="initiator"
    )

    def __repr__(self) -> str:
        return f"<User(email='{self.email}', role='{self.role.value}')>"