from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List

from app.api import deps
from app.schemas.ptw import PTWCreate, PTWRead, PTWUpdate
from app.models.ptw import PermitToWork
from app.models.user import User
from app.models.work_order import WorkOrder

router = APIRouter(prefix="/ptw", tags=["Permits to Work"])

@router.post("/", response_model=PTWRead, status_code=status.HTTP_201_CREATED)
def create_permit(
    ptw_in: PTWCreate, 
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    # 1. THE GUARDRAIL: Verify the Work Order actually exists
    work_order = db.query(WorkOrder).filter(WorkOrder.id == ptw_in.work_order_id).first()
    
    if not work_order:
        # If it doesn't exist, throw a clean 404 error back to React
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Work Order #{ptw_in.work_order_id} does not exist."
        )

    # 2. Proceed with creating the permit if the guardrail passes
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
    query = db.query(PermitToWork).options(joinedload(PermitToWork.requested_by))
    
    if work_order_id:
        query = query.filter(PermitToWork.work_order_id == work_order_id)
        
    permits = query.offset(skip).limit(limit).all()
    return permits

@router.get("/{permit_id}", response_model=PTWRead)
def get_single_permit(
    permit_id: int, 
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """Fetch all details for a single permit."""
    permit = db.query(PermitToWork).options(joinedload(PermitToWork.requested_by)).filter(PermitToWork.id == permit_id).first()
    
    if not permit:
        raise HTTPException(status_code=404, detail="Permit not found")
    return permit

@router.patch("/{permit_id}/status", response_model=PTWRead)
def update_permit_status(
    permit_id: int, 
    status_update: PTWUpdate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """Approve, Reject, or Suspend a permit."""
    permit = db.query(PermitToWork).filter(PermitToWork.id == permit_id).first()
    
    if not permit:
        raise HTTPException(status_code=404, detail="Permit not found")
    
    permit.status = status_update.status
    
    # If it's being activated, record who approved it!
    if status_update.status == "Active":
        permit.approved_by_id = current_user.id
        
    db.commit()
    db.refresh(permit)
    return permit