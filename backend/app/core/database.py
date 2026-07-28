from pymongo import MongoClient
from app.core.config import MONGODB_URI

# Create MongoDB client
client = MongoClient(MONGODB_URI)

# Select database
db = client["mindwell_ai"]

# Collections

users_collection = db["users"]
history_collection = db["prediction_history"]
mood_collection = db["mood_history"]
otp_collection = db["otp"]
predictions_collection = db["predictions"]
reports_collection = db["reports"]