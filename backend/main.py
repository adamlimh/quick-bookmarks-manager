from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from bson import ObjectId
from typing import List
from database import bookmarks_collection
from models import Bookmark, BookmarkUpdate, BookmarkOut

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Convert ObjectId to string
def serialize(bookmark) -> dict:
    return {
        "id": str(bookmark["_id"]),
        "title": bookmark["title"],
        "url": bookmark["url"],
        "tags": bookmark.get("tags", [])
    }

@app.post("/bookmarks", response_model=BookmarkOut)
async def create_bookmark(bookmark: Bookmark):
    doc = bookmark.model_dump()
    doc["url"] = str(doc["url"])

    # 找到目前最細的 order（最前面）並 -1
    first = await bookmarks_collection.find_one(sort=[("order", 1)])
    doc["order"] = (first["order"] - 1) if first and "order" in first else 0

    result = await bookmarks_collection.insert_one(doc)
    doc["_id"] = result.inserted_id
    return serialize(doc)


@app.get("/bookmarks", response_model=List[BookmarkOut])
async def list_bookmarks(skip: int = 0, limit: int = 10):
    cursor = bookmarks_collection.find().sort("order", 1).skip(skip).limit(limit)
    return [serialize(doc) async for doc in cursor]

@app.get("/bookmarks/tag/{tag}", response_model=List[BookmarkOut])
async def filter_by_tag(tag: str):
    cursor = bookmarks_collection.find({"tags": tag})
    return [serialize(doc) async for doc in cursor]

@app.put("/bookmarks/{id}", response_model=BookmarkOut)
async def update_bookmark(id: str, update: BookmarkUpdate):
    update_data = update.dict(exclude_unset=True)
    if "url" in update_data:
        update_data["url"] = str(update_data["url"])  # 🛠️ fix: convert HttpUrl to str
    result = await bookmarks_collection.update_one({"_id": ObjectId(id)}, {"$set": update_data})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Bookmark not found")
    updated = await bookmarks_collection.find_one({"_id": ObjectId(id)})
    return serialize(updated)

@app.delete("/bookmarks/{id}")
async def delete_bookmark(id: str):
    result = await bookmarks_collection.delete_one({"_id": ObjectId(id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Bookmark not found")
    return {"status": "deleted"}

from fastapi import Body

@app.patch("/bookmarks/reorder")
async def reorder_bookmarks(order_list: List[dict] = Body(...)):
    for item in order_list:
        await bookmarks_collection.update_one(
            {"_id": ObjectId(item["id"])},
            {"$set": {"order": item["order"]}}
        )
    return {"status": "ok"}

@app.get("/bookmarks/tags", response_model=List[str])
async def get_all_tags():
    pipeline = [
        {"$unwind": "$tags"},
        {"$group": {"_id": "$tags"}},
        {"$sort": {"_id": 1}}
    ]
    tags = await bookmarks_collection.aggregate(pipeline).to_list(length=100)
    return [tag["_id"] for tag in tags]

