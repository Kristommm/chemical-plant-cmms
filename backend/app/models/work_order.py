import enum
from datetime import datetime
from typing import Optional
from sqlalchemy import String, Text, ForeignKey, DateTime, func, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.user import Base, User, UserDepartment

# --- 1. The Work Order Enums ---
class WOPriority(str, enum.Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    URGENT = "Urgent"

class WOStatus(str, enum.Enum):
    OPEN = "Open"
    IN_PROGRESS = "In Progress"
    PENDING_APPROVAL = "Pending Approval"
    SUSPENDED = "Suspended"
    CLOSED = "Closed"

class WOType(str, enum.Enum):
    CORRECTIVE = "Corrective"
    PREVENTIVE = "Preventive"
    MODIFICATION = "Modification"

# --- 2. The Work Order Model ---
class WorkOrder(Base):
    __tablename__ = "work_orders"

    # Primary Key
    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    # Core Details
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    
    # We will keep the asset as a string identifier for now until the Asset model is built
    target_asset: Mapped[str] = mapped_column(String(100), nullable=False)

    # Standardized Categorization
    priority: Mapped[WOPriority] = mapped_column(
        SQLEnum(WOPriority, name="wo_priority_enum", create_constraint=True),
        default=WOPriority.MEDIUM,
        nullable=False
    )
    status: Mapped[WOStatus] = mapped_column(
        SQLEnum(WOStatus, name="wo_status_enum", create_constraint=True),
        default=WOStatus.OPEN,
        nullable=False
    )
    maintenance_type: Mapped[WOType] = mapped_column(
        SQLEnum(WOType, name="wo_type_enum", create_constraint=True),
        default=WOType.CORRECTIVE,
        nullable=False
    )

    # --- Foreign Keys (The Relational Links) ---
    # Who reported/created the issue? (Required)
    created_by_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    
    assigned_department: Mapped[Optional[UserDepartment]] = mapped_column(
        SQLEnum(UserDepartment, name="wo_assigned_dept_enum", create_constraint=True),
        nullable=True
    )

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

    # --- ORM Relationships ---
    # These allow us to easily access the full User object from a Work Order instance (e.g., wo.creator.full_name)
    creator: Mapped["User"] = relationship("User", foreign_keys=[created_by_id])
    

    def __repr__(self) -> str:
        return f"<WorkOrder(id={self.id}, title='{self.title}', status='{self.status.value}')>"