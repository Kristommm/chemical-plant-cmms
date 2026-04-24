from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime
from app.models.moc import MOCStage, MOCPriority, MOCCategory

class MOCStageUpdate(BaseModel):
    """Payload for advancing an MOC through its review lifecycle."""
    stage: MOCStage

class MOCBase(BaseModel):
    title: str
    description: str
    category: MOCCategory
    priority: MOCPriority = MOCPriority.MEDIUM
    requires_pid_update: bool = False
    requires_dcs_update: bool = False
    requires_training: bool = False
    target_date: Optional[datetime] = None

class MOCCreate(MOCBase):
    """Payload expected when an engineer initiates a new MOC."""
    pass

class MOCUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[MOCCategory] = None
    priority: Optional[MOCPriority] = None
    stage: Optional[MOCStage] = None
    requires_pid_update: Optional[bool] = None
    requires_dcs_update: Optional[bool] = None
    requires_training: Optional[bool] = None
    target_date: Optional[datetime] = None
    reviewer_id: Optional[int] = None

class MOCRead(MOCBase):
    id: int
    stage: MOCStage
    created_at: datetime
    initiator_id: int
    reviewer_id: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)