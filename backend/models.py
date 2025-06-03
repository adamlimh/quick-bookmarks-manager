from pydantic import BaseModel, HttpUrl
from typing import List, Optional
from bson import ObjectId

class Bookmark(BaseModel):
    title: str
    url: HttpUrl
    tags: Optional[List[str]] = []

class BookmarkUpdate(BaseModel):
    title: Optional[str]
    url: Optional[HttpUrl]
    tags: Optional[List[str]]

class BookmarkOut(Bookmark):
    id: str
