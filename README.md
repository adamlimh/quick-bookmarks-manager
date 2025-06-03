# 📚 Quick Bookmarks Manager

A responsive full-stack web app to manage your bookmarks — add, edit, delete, categorize, filter, and drag-and-drop sort them. Built with FastAPI, MongoDB, and vanilla HTML/JS/CSS. Fully containerized with Docker.

---

## 🛠️ Tech Stack

| Layer     | Technology                   | Reason                                  |
|-----------|------------------------------|------------------------------------------|
| Frontend  | HTML, Bootstrap 5, JavaScript | Simple, responsive UI, zero build tools |
| Backend   | FastAPI (Python)              | Modern async web API framework           |
| Database  | MongoDB                       | Flexible schema for bookmarks + tags     |
| Container | Docker + Docker Compose       | Reproducible, one-command deployment     |

---

## 🚀 Features

✅ Add bookmarks (with title, valid URL, tags)  
✅ Edit or delete any bookmark  
✅ Tag input with comma separation  
✅ Filter bookmarks by tags (multi-tag support)  
✅ Drag-and-drop to reorder (with backend sync)  
✅ Pagination (10 per page, supports up to 1,000)  
✅ Responsive layout for desktop & mobile  
✅ Data persists after restart (MongoDB volume)

---

## 📦 Project Structure

```
Quick-Bookmarks-Manager/
├── backend/
│   ├── main.py              # FastAPI backend
│   ├── models.py            # Pydantic models
│   ├── database.py          # MongoDB connection
│   └── requirements.txt     # Python dependencies
├── frontend/
│   ├── index.html           # UI layout
│   ├── script.js            # Bookmark logic + API calls
│   └── style.css            # Styling and responsive layout
├── Dockerfile.backend       # Backend Dockerfile
├── Dockerfile.frontend      # Frontend Dockerfile
├── docker-compose.yml       # Compose setup for all services
└── README.md                # This file
```

---

## ▶️ Getting Started

### 1. Clone this project

```bash
git clone https://github.com/yourname/Quick-Bookmarks-Manager.git
cd Quick-Bookmarks-Manager
```

### 2. Start the App

```bash
docker-compose up --build
```

- 🌍 Frontend: [http://localhost:3000](http://localhost:3000)  
- ⚙️ Backend API: [http://localhost:8000](http://localhost:8000/docs)  
- 🧱 MongoDB: persists automatically in Docker volume

---

## 🔍 UI Behavior Summary

| Function       | Behavior                                                                                                                                  |
|----------------|-------------------------------------------------------------------------------------------------------------------------------------------|
| Create         | Input title, valid URL, and optional comma-separated tags                                                                                 |
| Edit           | Update any bookmark info from modal                                                                                                       |
| Delete         | Remove bookmark with confirmation                                                                                                         |
| Tags           | Displayed as clickable badges; can filter by one or multiple                                                                              |
| Filter Reset   | Select "All" to reset all tag filters                                                                                                     |
| Drag & Drop    | Use handle ☰ to rearrange order; syncs with backend                                                                                       |
| Pagination     | 10 bookmarks per page; Previous/Next buttons are auto-disabled when at limit                                                              |
| Responsiveness | Bootstrap layout adjusts to mobile/tablet/desktop with clear layout, touchable controls, and consistent modal/dialog interactions         |

---

## 📦 Docker Notes

All services (backend, frontend, db) run in isolated containers.

### Stop & clean

```bash
docker-compose down
```

MongoDB volume persists as `mongo_data`. You can wipe it manually:

```bash
docker volume rm quick-bookmarks-manager_mongo_data
```

---

## 📌 Assumptions & Constraints

- Max 1,000 bookmarks with pagination
- URLs must follow `http(s)` format
- Tags are free text, no predefined options
- Backend uses `order` field to maintain sorting
- All code is self-contained with no external build step (e.g. no Webpack or Node)

---

## 🧪 Optional Ideas for Future

- Search bar for titles or URLs
- Export/import bookmarks (JSON or CSV)
- User authentication
- Dark mode toggle
- Bookmark thumbnails using OpenGraph

---

Made by Adam Li