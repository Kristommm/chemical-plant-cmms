from app.core.security import get_password_hash, verify_password

def test_password_hashing():
    """Test that passwords are hashed and verified correctly without a database."""
    plain_password = "SecurePassword123!"
    
    # Generate the hash
    hashed_password = get_password_hash(plain_password)
    
    # Ensure the hash is not just the plain password
    assert hashed_password != plain_password
    
    # Ensure the verification succeeds with the correct password
    assert verify_password(plain_password, hashed_password) is True
    
    # Ensure the verification fails with a bad password
    assert verify_password("WrongPassword!", hashed_password) is False