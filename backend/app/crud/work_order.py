from sqlalchemy.orm import Session
from app.models.work_order import WorkOrder
from app.schemas.work_order import WorkOrderCreate, WorkOrderUpdate

def get_work_order(db: Session, wo_id: int):
    """Fetch a single work order by its ID."""
    return db.query(WorkOrder).filter(WorkOrder.id == wo_id).first()

def get_work_orders(db: Session, skip: int = 0, limit: int = 100):
    """Fetch a list of work orders with pagination."""
    return db.query(WorkOrder).offset(skip).limit(limit).all()

def create_work_order(db: Session, wo: WorkOrderCreate, user_id: int):
    """
    Create a new work order. 
    Notice how 'user_id' is passed in separately to ensure security.
    """
    # model_dump() converts the Pydantic object into a Python dictionary
    db_wo = WorkOrder(
        **wo.model_dump(),
        created_by_id=user_id 
    )
    
    db.add(db_wo)
    db.commit()
    db.refresh(db_wo)
    
    return db_wo

def update_work_order(db: Session, db_wo: WorkOrder, wo_update: WorkOrderUpdate):
    """
    Update an existing work order.
    """
    # exclude_unset=True ensures we only update fields the user actually sent
    update_data = wo_update.model_dump(exclude_unset=True)
    
    for key, value in update_data.items():
        setattr(db_wo, key, value)
        
    db.commit()
    db.refresh(db_wo)
    
    return db_wo