from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.api import deps
from app.crud import work_order as crud_work_order
from app.schemas.work_order import WorkOrderCreate, WorkOrderRead, WorkOrderUpdate
from app.models.user import User, UserRole

router = APIRouter(prefix="/work-orders", tags=["Work Orders"])

@router.get("/", response_model=List[WorkOrderRead])
def read_work_orders(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(deps.get_db),
    # By adding this, the route is now protected!
    current_user: User = Depends(deps.get_current_user) 
):
    """
    Retrieve all work orders. Requires a valid JWT token.
    """
    work_orders = crud_work_order.get_work_orders(db, skip=skip, limit=limit)
    return work_orders

@router.post("/", response_model=WorkOrderRead, status_code=status.HTTP_201_CREATED)
def create_work_order(
    wo_in: WorkOrderCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """
    Create a new work order. The created_by_id is securely extracted from the token.
    """
    return crud_work_order.create_work_order(db=db, wo=wo_in, user_id=current_user.id)

@router.get("/{wo_id}", response_model=WorkOrderRead)
def read_work_order_by_id(
    wo_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """
    Retrieve a specific work order by ID.
    """
    wo = crud_work_order.get_work_order(db, wo_id=wo_id)
    if not wo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Work order not found"
        )
    return wo

@router.patch("/{wo_id}", response_model=WorkOrderRead)
def update_work_order(
    wo_id: int,
    wo_in: WorkOrderUpdate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """
    Update a work order (e.g., change status or priority).
    """
    wo = crud_work_order.get_work_order(db, wo_id=wo_id)
    if not wo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Work order not found"
        )
    
    # --- NEW: Department Authorization Check ---
    # Allow if the user is in the same department as the creator, OR if they are a System Admin
    if current_user.department != wo.creator.department and current_user.role != UserRole.SYSTEM_ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Only the originating department ({wo.creator.department}) can modify this work order."
        )
    
    return crud_work_order.update_work_order(db=db, db_wo=wo, wo_update=wo_in)