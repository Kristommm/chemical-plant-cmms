import enum
from typing import TYPE_CHECKING, Optional
from datetime import datetime, timezone
from sqlalchemy import ForeignKey, DateTime, Enum, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.user import User

class MOCStage(str, enum.Enum):
    DRAFT = "Draft"
    ENGINEERING_REVIEW = "Engineering Review"
    SAFETY_REVIEW = "Safety Review"
    APPROVED = "Approved"
    IMPLEMENTED = "Implemented"
    CLOSED = "Closed"

class MOCPriority(str, enum.Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    EMERGENCY = "Emergency"

class MOCCategory(str, enum.Enum):
    MECHANICAL = "Mechanical"
    ELECTRICAL = "Electrical"
    INSTRUMENTATION_DCS = "Instrumentation/DCS"
    PROCESS_CHEMICAL = "Process/Chemical"
    PROCEDURE = "Procedure"

class ManagementOfChange(Base):
    __tablename__ = "management_of_change"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(255), index=True)
    description: Mapped[str] = mapped_column(Text)
    
    category: Mapped[MOCCategory] = mapped_column(Enum(MOCCategory))
    stage: Mapped[MOCStage] = mapped_column(Enum(MOCStage), default=MOCStage.DRAFT)
    priority: Mapped[MOCPriority] = mapped_column(Enum(MOCPriority), default=MOCPriority.MEDIUM)
    
    # Critical compliance checks for industrial modifications
    requires_pid_update: Mapped[bool] = mapped_column(default=False)
    requires_dcs_update: Mapped[bool] = mapped_column(default=False)
    requires_training: Mapped[bool] = mapped_column(default=False)
    
    # Timestamps
    target_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    
    # Ownership and Approval Chain
    initiator_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    reviewer_id: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"), nullable=True)
    
    # Relationships
    initiator: Mapped["User"] = relationship(foreign_keys=[initiator_id])
    reviewer: Mapped["User"] = relationship(foreign_keys=[reviewer_id])