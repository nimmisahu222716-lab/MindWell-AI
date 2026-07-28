from dotenv import load_dotenv
import os

# Load variables from .env
load_dotenv()

# MongoDB
MONGODB_URI = os.getenv("ATLASDB_URL")

# JWT
JWT_SECRET = os.getenv("JWT_SECRET")
ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60)
)