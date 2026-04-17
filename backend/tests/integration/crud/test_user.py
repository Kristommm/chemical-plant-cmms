from app.crud.user import create_user, get_user_by_email, get_user, authenticate_user
from app.schemas.user import UserCreate
from app.models.user import UserRole, UserDepartment

def test_create_user(db_session):
    """Test that the CRUD function properly hashes the password and saves the user."""
    user_in = UserCreate(
        email="crud_alice@cmms.com",
        full_name="Alice Engineer",
        password="SuperSecretPassword123!",
        role=UserRole.RELIABILITY_ENGINEER,
        department=UserDepartment.MECHANICAL
    )
    
    user = create_user(db=db_session, user=user_in)
    
    assert user.id is not None
    assert user.email == "crud_alice@cmms.com"
    assert user.full_name == "Alice Engineer"
    assert user.department == UserDepartment.MECHANICAL
    assert hasattr(user, "hashed_password")
    assert user.hashed_password != "SuperSecretPassword123!"

def test_get_user_by_email(db_session):
    """Test fetching a user by their exact email string."""
    user_in = UserCreate(
        email="crud_bob@cmms.com",
        full_name="Bob Technician",
        password="password123",
        role=UserRole.TECHNICIAN,
        department=UserDepartment.ELECTRICAL
    )
    create_user(db=db_session, user=user_in)
    
    fetched_user = get_user_by_email(db=db_session, email="crud_bob@cmms.com")
    
    assert fetched_user is not None
    assert fetched_user.email == "crud_bob@cmms.com"
    assert fetched_user.full_name == "Bob Technician"

def test_authenticate_user(db_session):
    """Test that the authentication function properly verifies passwords."""
    
    user_in = UserCreate(
        email="auth_test@cmms.com",
        full_name="Auth Tester",
        password="CorrectPassword123!",
        role=UserRole.TECHNICIAN,
        department=UserDepartment.MECHANICAL
    )
    create_user(db=db_session, user=user_in)
    
    authenticated_user = authenticate_user(
        db=db_session, email="auth_test@cmms.com", password="CorrectPassword123!"
    )
    assert authenticated_user is not None
    assert authenticated_user.email == "auth_test@cmms.com"
    
    wrong_password_user = authenticate_user(
        db=db_session, email="auth_test@cmms.com", password="WrongPassword!"
    )
    assert wrong_password_user is None
    
    wrong_email_user = authenticate_user(
        db=db_session, email="nobody@cmms.com", password="CorrectPassword123!"
    )
    assert wrong_email_user is None
