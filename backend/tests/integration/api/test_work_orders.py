import pytest
from app.main import app
from app.api.deps import get_current_user
from app.models.user import User, UserRole, UserDepartment
from app.schemas.user import UserCreate
from app.crud.user import create_user

# --- Fixtures for Authentication ---

@pytest.fixture
def active_user(db_session):
    """Creates a user directly in the database to act as our logged-in user."""
    user = User(
        email="tech@cmms.com",
        full_name="IT Support Specialist",
        hashed_password="fakehashedpassword",
        role=UserRole.TECHNICIAN,
        department=UserDepartment.IT,
        is_active=True
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user

@pytest.fixture
def authorized_client(client, active_user):
    """Overrides the security dependency to simulate being logged in."""
    def override_get_current_user():
        return active_user

    app.dependency_overrides[get_current_user] = override_get_current_user
    yield client
    app.dependency_overrides.pop(get_current_user, None)


@pytest.fixture
def other_user(db_session):
    """Creates a second user in a completely different department."""
    user = User(
        email="operator@cmms.com",
        full_name="Production Operator",
        hashed_password="fakehashedpassword",
        role=UserRole.OPERATOR,
        department=UserDepartment.PRODUCTION, # Different department!
        is_active=True
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user

@pytest.fixture
def unauthorized_client(client, other_user):
    """Overrides the security dependency to log in as the 'other_user'."""
    def override_get_current_user():
        return other_user

    app.dependency_overrides[get_current_user] = override_get_current_user
    yield client
    app.dependency_overrides.pop(get_current_user, None)


def test_create_work_order_api(authorized_client):
    """Test that an authenticated user can create a work order via API."""
    response = authorized_client.post(
        "/work-orders/",
        json={
            "title": "Database Backup Failing",
            "description": "The automated SQL backup task failed last night.",
            "target_asset": "Database Server 1",
            "priority": "Urgent",
            "maintenance_type": "Corrective",
            "assigned_department": "IT"
        }
    )
    
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Database Backup Failing"
    assert "id" in data

def test_read_work_orders_api(authorized_client):
    """Test fetching the list of work orders."""
    # Create one first so the list isn't empty
    authorized_client.post(
        "/work-orders/",
        json={
            "title": "Routine Inspection",
            "description": "Check cooling fans.",
            "target_asset": "Server Rack A",
            "priority": "Low",
            "maintenance_type": "Preventive",
            "assigned_department": "IT"
        }
    )
    
    response = authorized_client.get("/work-orders/")
    assert response.status_code == 200
    
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 1
    assert data[0]["title"] == "Routine Inspection"

def test_work_order_status_authorization_real_auth(client, db_session):
    """
    Tests authorization by fetching real JWT tokens and passing them in HTTP headers,
    simulating exact frontend behavior.
    """
    # --- 1. SETUP: Create the Users ---
    it_user_in = UserCreate(
        email="tech@cmms.com", full_name="IT Tech", password="password123",
        role=UserRole.TECHNICIAN, department=UserDepartment.IT
    )
    prod_user_in = UserCreate(
        email="operator@cmms.com", full_name="Prod Operator", password="password123",
        role=UserRole.OPERATOR, department=UserDepartment.PRODUCTION
    )
    create_user(db=db_session, user=it_user_in)
    create_user(db=db_session, user=prod_user_in)

    # --- 2. GET REAL TOKENS ---
    # Log in as the IT User (Standard OAuth2 expects 'username' instead of 'email' in the form data)
    it_login = client.post("/login", data={"username": "tech@cmms.com", "password": "password123"})
    it_token = it_login.json()["access_token"]
    it_headers = {"Authorization": f"Bearer {it_token}"}

    # Log in as the Production User
    prod_login = client.post("/login", data={"username": "operator@cmms.com", "password": "password123"})
    prod_token = prod_login.json()["access_token"]
    prod_headers = {"Authorization": f"Bearer {prod_token}"}

    # --- 3. EXECUTE THE TESTS ---
    
    # IT User creates the Work Order (Passing their specific headers)
    create_response = client.post(
        "/work-orders/",
        headers=it_headers,
        json={
            "title": "Fix Network Switch",
            "description": "Switch dropping packets.",
            "target_asset": "Switch B",
            "priority": "High",
            "maintenance_type": "Corrective",
            "assigned_department": "IT"
        }
    )
    assert create_response.status_code == 201
    wo_id = create_response.json()["id"]

    # IT User updates the status (Success)
    creator_update = client.patch(
        f"/work-orders/{wo_id}",
        headers=it_headers,
        json={"status": "In Progress"} 
    )
    assert creator_update.status_code == 200 

    # Imposter (Production User) tries to close out the ticket (Failure)
    imposter_update = client.patch(
        f"/work-orders/{wo_id}",
        headers=prod_headers, # Notice we use the PROD headers here!
        json={"status": "Closed"}
    )
    
    # This should now flawlessly trigger the 403!
    assert imposter_update.status_code == 403