# AskJai Update Server

A simple Node.js server that distributes updates to all AskJai client installations. You deploy this once on **Render.com** or **Railway.app**.

---

## Quick Start (Local)

```bash
cd askjai-update-server
npm install
npm start
# Server runs on http://localhost:3001
```

---

## Deploy to Render.com

1. Push `askjai-update-server/` to a GitHub repo (or a subfolder of your main repo).
2. Go to [render.com](https://render.com) → **New** → **Web Service**.
3. Connect your GitHub repo.
4. Configure:
   - **Root Directory**: `askjai-update-server` (if it's a subfolder)
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: Node
5. Add **Environment Variables**:
   | Key | Value |
   |-----|-------|
   | `PORT` | `3001` (Render overrides this automatically) |
   | `OWNER_SECRET_KEY` | `your-random-secret-here` |
   | `SERVER_URL` | `https://your-app-name.onrender.com` |
6. Click **Deploy**.
7. Once deployed, update `SERVER_URL` to your actual Render URL.

> **Important**: After deploying, update the `manifest.json` download URLs to use your real server URL.

### Persistent Disk (Render)

Render's filesystem is ephemeral. To persist `releases/` and `manifest.json`:

1. In your Render service → **Disks** → Add a disk.
2. Mount path: `/opt/render/project/src/askjai-update-server/releases`
3. For `manifest.json`, consider using a database or S3 in production.

---

## Deploy to Railway.app

1. Push to GitHub.
2. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub**.
3. Set environment variables (same as above).
4. Railway auto-detects Node.js and deploys.

---

## API Reference

### Public Endpoints (no auth)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `GET` | `/manifest.json` | Current release manifest |
| `GET` | `/releases/:version/download` | Download ZIP |
| `GET` | `/releases/:version/changelog` | View changelog |

### Protected Endpoints (require `x-owner-key` header)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/owner/release` | Publish a new release |
| `POST` | `/owner/upload-release` | Upload ZIP + changelog files |
| `GET` | `/owner/stats` | View release statistics |

---

## Usage: Publishing a New Update

### Step 1: Announce the release

```bash
curl -X POST https://your-server.com/owner/release \
  -H "Content-Type: application/json" \
  -H "x-owner-key: your-secret-key" \
  -d '{
    "version": "2.1.0",
    "title": "Theme Engine & Bug Fixes",
    "type": "feature",
    "changelog": [
      "Added custom theme engine",
      "Fixed sidebar navigation bug",
      "Improved AI response speed",
      "Added dark mode toggle"
    ],
    "is_critical": false,
    "size_mb": 4.2,
    "min_app_version": "1.0.0",
    "released_at": "2025-03-08"
  }'
```

### Step 2: Upload the ZIP file

```bash
curl -X POST https://your-server.com/owner/upload-release \
  -H "x-owner-key: your-secret-key" \
  -F "version=2.1.0" \
  -F "zip=@./askjai-v2.1.0.zip" \
  -F "changelog=@./CHANGELOG.md"
```

### Step 3: Verify

```bash
# Check manifest
curl https://your-server.com/manifest.json | jq .

# Check health
curl https://your-server.com/health

# View stats
curl -H "x-owner-key: your-secret-key" https://your-server.com/owner/stats | jq .
```

### Publishing a Critical Security Update

```bash
curl -X POST https://your-server.com/owner/release \
  -H "Content-Type: application/json" \
  -H "x-owner-key: your-secret-key" \
  -d '{
    "version": "2.1.1",
    "title": "Critical Security Patch",
    "type": "security",
    "changelog": ["Fixed authentication bypass vulnerability"],
    "is_critical": true,
    "size_mb": 3.8,
    "min_app_version": "1.0.0"
  }'
```

---

## Folder Structure

```
askjai-update-server/
├── server.js          # Express server
├── package.json       # Dependencies
├── .env               # Environment variables
├── manifest.json      # Current release manifest (auto-updated)
├── README.md          # This file
└── releases/          # Release files
    ├── v1.0.0/
    │   ├── update.zip
    │   └── changelog.md
    └── v2.1.0/
        ├── update.zip
        └── changelog.md
```
