import os
from dotenv import load_dotenv

# Load the variables from the .env file into the environment
load_dotenv()

class Settings:
    # Fetch the secret key, with a fallback just in case the .env is missing
    SECRET_KEY: str = os.getenv("SECRET_KEY", "fallback-secret-key-do-not-use-in-prod")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

settings = Settings()