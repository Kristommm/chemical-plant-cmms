from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.api import deps
from app.schemas.moc import MOCCreate, MOCRead, MOCUpdate
from app.models.moc import ManagementOfChange
from app.models.user import User

router = APIRouter(prefix="/moc", tags=["Management of Change"])

@router.post("/", response_model=MOCRead, status_code=status.HTTP_201_CREATED)
def create_moc(
    moc_in: MOCCreate, 
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)  # The Auth Bouncer!
):
    """
    Initiate a new Management of Change (MOC) request. 
    Automatically assigns the logged-in user as the initiator.
    """
    # Map the validated Pydantic data to the SQLAlchemy model
    new_moc = ManagementOfChange(
        **moc_in.model_dump(),
        initiator_id=current_user.id
    )
    
    db.add(new_moc)
    db.commit()
    db.refresh(new_moc)
    
    return new_moc


@router.get("/", response_model=List[MOCRead])
def read_mocs(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user) # Secure the read endpoint too
):
    """
    Retrieve a list of all MOCs.
    """
    mocs = db.query(ManagementOfChange).offset(skip).limit(limit).all()
    return mocs