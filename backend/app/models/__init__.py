# Import the Base so Alembic can access Base.metadata
from app.models.user import Base

# Import all models here so they are registered with the Base
from app.models.user import User

# As you build them, add:
# from app.models.asset import Asset
# from app.models.work_order import WorkOrder