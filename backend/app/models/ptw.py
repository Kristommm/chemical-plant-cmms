import enum
from typing import Optional, TYPE_CHECKING
from datetime import datetime
from sqlalchemy import ForeignKey, DateTime, Enum, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.user import User

from app.core.database import Base 

if TYPE_CHECKING:
    from app.models.work_order import WorkOrder

class PermitType(str, enum.Enum):
    GENERAL = "General"
    HOT_WORK = "Hot Work"
    CONFINED_SPACE = "Confined Space"
    LOTO = "Lockout/Tagout"
    LINE_BREAKING = "Line Breaking"
    WORKING_AT_HEIGHTS = "Working at Heights"

class PermitStatus(str, enum.Enum):
    DRAFT = "Draft"
    REQUESTED = "Requested"
    APPROVED = "Approved"
    ACTIVE = "Active"
    SUSPENDED = "Suspended"
    CLOSED = "Closed"

class PermitToWork(Base):
    __tablename__ = "permits_to_work"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    work_order_id: Mapped[int] = mapped_column(ForeignKey("work_orders.id"))
    
    permit_type: Mapped[PermitType] = mapped_column(Enum(PermitType))
    status: Mapped[PermitStatus] = mapped_column(Enum(PermitStatus), default=PermitStatus.DRAFT)
    
    # Core safety checks
    requires_loto: Mapped[bool] = mapped_column(default=False)
    requires_gas_testing: Mapped[bool] = mapped_column(default=False)
    equipment_isolated: Mapped[bool] = mapped_column(default=False)
    
    # Timestamps (Timezone aware for accurate safety logs)
    valid_from: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    valid_until: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    
    # Signatures / Approval chain
    requested_by_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    approved_by_id: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"), nullable=True)
    
    # Relationships
    work_order: Mapped["WorkOrder"] = relationship(back_populates="permits")
    requested_by: Mapped["User"] = relationship(foreign_keys=[requested_by_id])
    approved_by: Mapped["User"] = relationship(foreign_keys=[approved_by_id])