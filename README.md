# ChunkStream Upload Engine

A full-stack file upload system that splits files into chunks on the client, uploads them concurrently with retry support, merges them on the server, and streams the merged media back — all with session persistence and cancellation.

---

## Features

### Upload
- Client-side file splitting into 1 MB chunks
- Single file, multiple file, and entire folder upload
- Concurrent chunk upload (3 in-flight requests at a time) via a sliding window
- Per-chunk retry — up to 3 attempts with exponential back-off (300 ms, 600 ms)
- File-level AbortController — cancelling one file instantly kills all its in-flight requests
- Session-level cancellation — Cancel button aborts all uploads and deletes server-side data
- Upload progress tracking per file (% and chunk counter)
- Real-time status badges: `PENDING` → `UPLOADING` → `COMPLETED` / `FAILED`

### Resumability
- `uploadId` persisted to `localStorage` on session start
- Server reconstructs the in-memory session from MongoDB on restart — chunks that already arrived are not re-uploaded

### Merging & Streaming
- Server merges chunks sequentially using Node.js `ReadStream` + `WriteStream` with backpressure via `pipe`
- Merged files served via HTTP range requests (`Accept-Ranges: bytes`, `206 Partial Content`) — enables native video/audio scrubbing in the browser
- Global media library listing all completed uploads

### Reliability
- Idempotency guard — duplicate chunk arrivals (retry after lost response) are silently skipped, merge never fires twice
- Error propagation from DB layer up through service → controller → client retry loop
- DB connection failure stops the server immediately at startup (no silent broken state)

---

## Tech Stack

| Layer | Stack |
|---|---|
| Frontend | React 19, TypeScript, Vite, TailwindCSS v4 |
| State | Zustand |
| HTTP client | Axios (shared instance, env-based baseURL) |
| Backend | Node.js, Express 5, TypeScript |
| Database | MongoDB + Mongoose |
| File handling | Node.js Streams (`fs`, `stream/promises`) |
| Chunk parsing | Multer (memory storage, 2 MiB limit per chunk) |

---

## Architecture

```
Client
  └─ File selected
       └─ Split into 1 MiB chunks  (helper.ts)
            └─ POST /api/upload/init  →  receive uploadId
                 └─ Zustand store initialised with per-file state
                      └─ Sliding window (CONCURRENCY=3)
                           ├─ POST /api/upload/chunk  (chunk 0)
                           ├─ POST /api/upload/chunk  (chunk 1)
                           └─ POST /api/upload/chunk  (chunk 2)
                                └─ when all chunks received on server
                                     └─ merge chunks → final file on disk
                                          └─ GET /api/upload/stream/:uploadId/:fileId
```

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/upload/init` | Initialise session, create directories, insert DB records |
| `POST` | `/api/upload/chunk` | Receive a single chunk, write to disk, trigger merge when last chunk arrives |
| `POST` | `/api/upload/status` | Get per-file chunk progress for a session |
| `POST` | `/api/upload/clear` | Cancel a session — deletes all disk data for the uploadId |
| `GET` | `/api/upload/library` | List all completed uploads |
| `GET` | `/api/upload/stream/:uploadId/:fileId` | Stream the merged file with HTTP range request support |

---

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB running locally or a connection URI

### 1. Clone

```bash
git clone https://github.com/your-username/chunkstream-upload-engine.git
cd chunkstream-upload-engine
```

### 2. Server

```bash
cd server
npm install
```

Create `server/.env`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/chunkstream
NODE_ENV=development
```

```bash
npm run dev
```

### 3. Client

```bash
cd client
npm install
```

Create `client/.env` (optional — defaults to `http://localhost:5000`):

```env
VITE_API_URL=http://localhost:5000
```

```bash
npm run dev
```

Open `http://localhost:5173`.

---

## Project Structure

```
├── client/
│   └── src/
│       ├── lib/axiosInstance.ts          # shared axios instance
│       ├── store/uploadStore.ts          # Zustand store
│       └── modules/upload/
│           ├── api/uploadApi.ts          # chunk upload, init, stream URL
│           ├── hooks/useUpload.ts        # file selection, upload, cancel
│           ├── utils/helper.ts           # createChunks
│           ├── utils/uploadSession.ts    # localStorage session persistence
│           └── types/upload.types.ts
└── server/
    ├── config/
    │   ├── db.ts                         # MongoDB connection
    │   └── env.ts                        # env validation
    ├── multer.ts                         # memory storage, 2 MiB limit
    └── modules/upload/
        ├── upload.controller.ts
        ├── upload.service.ts             # session management, merge, streaming
        ├── upload.repository.ts          # Mongoose DB layer
        ├── upload.model.ts               # schema with Map-based chunk tracking
        ├── upload.routes.ts
        └── upload.types.ts
```

---

🤝 Contribution
- Feel free to open issues or submit PRs to improve this project.
