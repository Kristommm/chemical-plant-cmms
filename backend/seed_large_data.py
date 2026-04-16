import random
from app.core.database import SessionLocal
from app.crud.user import create_user, get_user_by_email
from app.schemas.user import UserCreate
from app.models.user import UserRole, UserDepartment # <-- Import UserDepartment
from app.crud.work_order import create_work_order
from app.schemas.work_order import WorkOrderCreate
from app.models.work_order import WOPriority, WOStatus, WOType

def seed_robust_data():
    db = SessionLocal()
    
    try:
        # 1. Ensure our Admin User exists
        email = "admin@cmms.com"
        admin_user = get_user_by_email(db, email)
        
        if not admin_user:
            admin_in = UserCreate(
                email=email,
                full_name="System Administrator",
                password="Password123!", 
                role=UserRole.SYSTEM_ADMIN,
                department=UserDepartment.PRODUCTION, # Admin gets assigned to HR
                is_active=True
            )
            admin_user = create_user(db, admin_in)
            print(f"Created Admin User: {admin_user.email}")
        else:
            print(f"Admin User already exists (ID: {admin_user.id}).")

        # 2. Plant Equipment & Typical Issues mapped to logical Departments
        assets = [
            "Reactor R-101", "Feed Pump P-205A", "Cooling Tower CT-01", 
            "DCS Controller Node 3", "Heat Exchanger E-112", "Storage Tank T-400"
        ]
        
        issues = [
            # Tuple format: (Issue Description, Type, Priority, Assigned Department)
            ("Vibration warning on bearing", WOType.PREVENTIVE, WOPriority.MEDIUM, UserDepartment.MECHANICAL),
            ("Seal leak observed during rounds", WOType.CORRECTIVE, WOPriority.HIGH, UserDepartment.MECHANICAL),
            ("Quarterly calibration required", WOType.PREVENTIVE, WOPriority.LOW, UserDepartment.INSTRUMENTATION),
            ("Control valve fails to close completely", WOType.CORRECTIVE, WOPriority.URGENT, UserDepartment.INSTRUMENTATION),
            ("Replace filter media", WOType.PREVENTIVE, WOPriority.MEDIUM, UserDepartment.UTILITIES),
            ("Upgrade firmware for communication module", WOType.MODIFICATION, WOPriority.LOW, UserDepartment.ELECTRICAL),
            ("Scaffolding required for overhead pipe inspection", WOType.PREVENTIVE, WOPriority.LOW, UserDepartment.CIVIL)
        ]

        # 3. Generate 25 Work Orders
        print("Generating 25 work orders with department assignments...")
        for i in range(1, 26):
            asset = random.choice(assets)
            
            # Unpack the 4 values from our new issues list
            issue, wo_type, priority, department = random.choice(issues) 
            status = random.choice(list(WOStatus))
            
            wo_in = WorkOrderCreate(
                title=f"{asset} - {issue[0:20]}...",
                description=f"Detailed report: {issue}. Please inspect and resolve.",
                target_asset=asset,
                priority=priority,
                status=status,
                maintenance_type=wo_type,
                assigned_department=department # <-- Assign the logical department here
            )
            
            create_work_order(db=db, wo=wo_in, user_id=admin_user.id)
            
        print("Successfully seeded the database with robust work order data!")

    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_robust_data()