# 🚀 Chunk Stream Upload Engine

A scalable and efficient file upload system that splits files into chunks, uploads them sequentially, and merges them on the backend.

Designed to handle **large file uploads**, with a future-ready architecture for **multi-file uploads, resumability, and retry mechanisms**.

---

## 📌 Features

### ✅ Implemented
- File splitting into chunks (client-side)
- Sequential chunk upload to backend
- Backend storage of chunks on disk
- Unique file identification using UUID
- Type-safe implementation (TypeScript)
- API integration for chunk upload
- Support for single file upload (structured for extensibility)

### 🚧 In Progress / Planned
- Chunk merging on backend
- Multiple file upload support
- Folder upload support
- Resumable uploads
- Retry mechanism for failed chunks
- Upload progress tracking
- Parallel chunk uploads (optimization)

---

## 🏗️ Architecture Overview
Client (React + TS) -> Split file into chunks -> Send chunks via API (one-by-one / stream) -> Backend (Node.js + TS) -> Store chunks on disk -> (Merge - upcoming)

---
## 🚀 Getting Started

### 1. Clone Repo
```bash
git clone https://github.com/your-username/chunk-stream-upload-engine.git
cd chunk-stream-upload-engine
```
### 2. Install Dependenices

#### client
- cd client
- npm install
- npm run dev

#### server
- cd server
- npm install
- npm run dev

---

🤝 Contribution
- Feel free to open issues or submit PRs to improve this project.
