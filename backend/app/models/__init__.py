# Import the Base so Alembic can access Base.metadata
from app.models.user import Base

# Import all models here so they are registered with the Base
from app.models.user import User
from app.models.work_order import WorkOrder
from app.models.ptw import PermitToWork
from app.models.moc import ManagementOfChange