from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
from datetime import datetime
from app.models.ptw import PermitType, PermitStatus


class UserCompact(BaseModel):
    full_name: str
    model_config =ConfigDict(from_attributes=True)

class PTWBase(BaseModel):
    work_order_id: int
    permit_type: PermitType
    requires_loto: bool = False
    requires_gas_testing: bool = False

class PTWCreate(PTWBase):
    pass

class PTWUpdate(BaseModel):
    status: Optional[PermitStatus] = None
    equipment_isolated: Optional[bool] = None
    valid_from: Optional[datetime] = None
    valid_until: Optional[datetime] = None
    approved_by_id: Optional[int] = None

class PTWRead(PTWBase):
    id: int
    status: PermitStatus
    equipment_isolated: bool
    valid_from: Optional[datetime] = None
    valid_until: Optional[datetime] = None
    requested_by_id: int
    requested_by: Optional[UserCompact] = None
    approved_by_id: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)