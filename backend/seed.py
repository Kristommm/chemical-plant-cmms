from app.core.database import SessionLocal
from app.crud.user import create_user, get_user_by_email
from app.schemas.user import UserCreate
from app.models.user import UserRole

def seed_admin():
    # 1. Open a database session
    db = SessionLocal()
    
    try:
        # 2. Check if the admin already exists so we don't duplicate
        email = "admin@cmms.com"
        existing_user = get_user_by_email(db, email)
        
        if existing_user:
            print(f"User {email} already exists. Skipping seed.")
            return

        # 3. Create the payload using our Pydantic schema
        admin_in = UserCreate(
            email=email,
            full_name="System Administrator",
            password="Password123!", # In a real app, don't hardcode this!
            role=UserRole.SYSTEM_ADMIN,
            is_active=True
        )
        
        # 4. Use our CRUD function (which handles the bcrypt hashing)
        user = create_user(db, admin_in)
        print(f"Successfully created admin user: {user.email} (ID: {user.id})")
        
    except Exception as e:
        print(f"An error occurred during seeding: {e}")
    finally:
        # 5. Always close the session
        db.close()

if __name__ == "__main__":
    print("Starting database seed...")
    seed_admin()
    print("Seed complete.")