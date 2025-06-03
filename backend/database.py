from motor.motor_asyncio import AsyncIOMotorClient
import os

# Use Docker hostname 'mongo', or fallback to localhost for dev
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = "bookmarks_db"

client = AsyncIOMotorClient(MONGO_URI)
db = client[DB_NAME]
bookmarks_collection = db["bookmarks"]
