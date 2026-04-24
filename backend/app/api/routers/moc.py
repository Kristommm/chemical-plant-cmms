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

@router.get("/{moc_id}", response_model=MOCRead)
def get_single_moc(
    moc_id: int, 
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """Fetch all details for a single MOC."""
    # Note: If you added the initiator relationship, you can joinedload it here just like PTW!
    moc = db.query(ManagementOfChange).filter(ManagementOfChange.id == moc_id).first()
    
    if not moc:
        raise HTTPException(status_code=404, detail="MOC not found")
    return moc

@router.patch("/{moc_id}/stage", response_model=MOCRead)
def update_moc_stage(
    moc_id: int, 
    stage_update: MOCUpdate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """Advance the MOC to the next stage of review."""
    moc = db.query(ManagementOfChange).filter(ManagementOfChange.id == moc_id).first()
    
    if not moc:
        raise HTTPException(status_code=404, detail="MOC not found")
    
    moc.stage = stage_update.stage
    
    # In a full app, you might also record current_user.id as the reviewer here!
    
    db.commit()
    db.refresh(moc)
    return moc