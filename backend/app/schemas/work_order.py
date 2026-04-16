from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

from app.models.work_order import WOPriority, WOStatus, WOType
from app.models.user import UserDepartment

# --- NEW: Add this tiny schema to format the creator's data ---
class WorkOrderCreator(BaseModel):
    id: int
    full_name: str
    role: str
    department: UserDepartment
    
    model_config = ConfigDict(from_attributes=True)


class WorkOrderBase(BaseModel):
    title: str
    description: str
    target_asset: str
    priority: WOPriority = WOPriority.MEDIUM
    status: WOStatus = WOStatus.OPEN
    maintenance_type: WOType = WOType.CORRECTIVE

class WorkOrderCreate(WorkOrderBase):
    assigned_department: Optional[UserDepartment] = None

class WorkOrderUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    target_asset: Optional[str] = None
    priority: Optional[WOPriority] = None
    status: Optional[WOStatus] = None
    maintenance_type: Optional[WOType] = None
    assigned_department: Optional[UserDepartment] = None

class WorkOrderRead(WorkOrderBase):
    id: int
    created_by_id: int
    assigned_department: Optional[UserDepartment]
    created_at: datetime
    updated_at: datetime
    creator: WorkOrderCreator

    model_config = ConfigDict(from_attributes=True)