def test_register_new_user(client):
    """Test the POST /users/ endpoint for creating a new user via API."""
    response = client.post(
        "/users/",
        json={
            "email": "api_charlie@cmms.com",
            "full_name": "Charlie Operator",
            "password": "StrongPassword123!",
            "role": "Operator",
            "department": "Production"
        }
    )
    
    # Check that the request was successful
    assert response.status_code == 201  # Or 201, depending on what you set in the router
    
    data = response.json()
    assert data["email"] == "api_charlie@cmms.com"
    assert data["full_name"] == "Charlie Operator"
    assert data["role"] == "Operator"
    assert data["department"] == "Production"
    
    # SECURITY CHECK: Ensure passwords are NEVER returned in API responses
    assert "password" not in data
    assert "hashed_password" not in data
    
    # Ensure standard response fields are present
    assert "id" in data
    assert "is_active" in data
    assert data["is_active"] is True

def test_register_user_duplicate_email(client):
    """Test that the API rejects a registration if the email already exists."""
    # Register the first user
    client.post(
        "/users/",
        json={
            "email": "duplicate@cmms.com",
            "full_name": "Original User",
            "password": "password123",
            "role": "Technician",
            "department": "Mechanical"
        }
    )
    
    # Attempt to register a second user with the exact same email
    response = client.post(
        "/users/",
        json={
            "email": "duplicate@cmms.com",
            "full_name": "Copycat User",
            "password": "password456",
            "role": "Operator",
            "department": "Production"
        }
    )
    
    # Should throw a 400 Bad Request
    assert response.status_code == 400
    assert response.json()["detail"] == "The user with this email already exists in the system."

def test_read_users(client):
    """Test the GET /users/ endpoint to ensure it returns a list of users without passwords."""
    
    # 1. Create two users via the API
    client.post("/users/", json={
        "email": "list1@cmms.com", 
        "full_name": "User One", 
        "password": "pw1",
        "role": "Technician",
        "department": "Mechanical"
    })
    client.post("/users/", json={
        "email": "list2@cmms.com", 
        "full_name": "User Two", 
        "password": "pw2",
        "role": "Operator",
        "department": "Production"
    })
    
    # 2. Fetch the list of users
    response = client.get("/users/")
    assert response.status_code == 200
    
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 2  # Exactly 2 because the DB resets for every test
    
    # 3. Check the structure and security of the first user in the list
    first_user = data[0]
    assert "email" in first_user
    assert "id" in first_user
    assert "full_name" in first_user
    
    # SECURITY CHECK: Ensure passwords are not leaked in the list view
    assert "password" not in first_user
    assert "hashed_password" not in first_user