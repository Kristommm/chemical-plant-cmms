from app.crud.user import create_user
from app.crud.work_order import create_work_order
from app.schemas.user import UserCreate
from app.schemas.work_order import WorkOrderCreate
from app.models.user import UserRole, UserDepartment

def test_create_work_order(db_session):
    """Test creating a work order and ensuring it links to the creator."""
    user_in = UserCreate(
        email="creator@cmms.com",
        full_name="System Admin",
        password="password123",
        role=UserRole.SYSTEM_ADMIN,
        department=UserDepartment.IT
    )
    user = create_user(db=db_session, user=user_in)
    
    wo_in = WorkOrderCreate(
        title="Update Server Racks",
        description="Install new switch in Rack B.",
        target_asset="Network Switch 02",
        priority="High",
        maintenance_type="Preventive",
        assigned_department="IT"
    )
    
    work_order = create_work_order(db=db_session, wo=wo_in, user_id=user.id)
    
    assert work_order.id is not None
    assert work_order.title == "Update Server Racks"
    assert work_order.id == user.id