from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.api import deps
from app.schemas.ptw import PTWCreate, PTWRead, PTWUpdate
from app.models.ptw import PermitToWork
from app.models.user import User

router = APIRouter(prefix="/ptw", tags=["Permits to Work"])

@router.post("/", response_model=PTWRead, status_code=status.HTTP_201_CREATED)
def create_permit(
    ptw_in: PTWCreate, 
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)  # The Auth Bouncer
):
    """
    Request a new Permit to Work. Automatically assigns the logged-in user as the requester.
    """
    # Create the SQLAlchemy model using the validated Pydantic data
    new_permit = PermitToWork(
        **ptw_in.model_dump(),
        requested_by_id=current_user.id
    )
    
    db.add(new_permit)
    db.commit()
    db.refresh(new_permit)
    
    return new_permit


@router.get("/", response_model=List[PTWRead])
def read_permits(
    skip: int = 0,
    limit: int = 100,
    work_order_id: int | None = None,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """
    Retrieve all permits. Pass a work_order_id to filter by a specific work order.
    """
    query = db.query(PermitToWork)
    
    if work_order_id:
        query = query.filter(PermitToWork.work_order_id == work_order_id)
        
    permits = query.offset(skip).limit(limit).all()
    return permits