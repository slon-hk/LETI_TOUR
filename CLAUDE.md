# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

LETI Tour — a virtual interactive tour of the LETI (Saint Petersburg Electrotechnical University) campus. Users navigate a campus map (Leaflet), enter buildings, and explore rooms via 360° panoramas (Photo Sphere Viewer / Three.js). Admins manage locations and users through a protected panel.

## Running locally

**Full stack (recommended):**
```bash
cp .env.example .env  # fill in secrets
docker compose up --build
```
The app is served at `http://localhost` (Nginx → frontend SPA, proxies `/api` and `/media` to backend).

**Backend only (needs external Postgres + Redis):**
```bash
cd backend
uvicorn app.main:app --reload --port 8000
```
Set `DATABASE_URL` and `REDIS_URL` in `.env` before starting. On first run, Alembic migrations and superadmin seeding happen automatically via the lifespan hook.

**Frontend only:**
```bash
cd frontend/gg
npm install
npm run dev   # Vite dev server on :5173, proxies /api to localhost:8000
```

**Lint / type-check:**
```bash
cd frontend/gg && npm run lint
cd frontend/gg && npx tsc --noEmit
```

## Database migrations

All migrations live in `backend/alembic/`. Run from the `backend/` directory:
```bash
alembic revision --autogenerate -m "describe change"
alembic upgrade head
```
The Dockerfile runs `alembic upgrade head` before starting uvicorn, so migrations apply automatically in production.

## Architecture

### Backend (`backend/app/`)

The production backend is **fully async** (SQLAlchemy `asyncpg`, FastAPI async routes). The legacy `backend/main.py` (SQLite, sync) is an older prototype — **do not edit it**; the real entrypoint is `app/main.py`.

```
app/
  core/
    config.py       # pydantic-settings: all env vars (DATABASE_URL, SECRET_KEY, etc.)
    security.py     # JWT creation/decoding, bcrypt hashing
    dependencies.py # get_current_user, require_role(*roles) — FastAPI Depends factories
  db/
    session.py      # AsyncSessionLocal, engine, get_db dependency
  models/           # SQLAlchemy ORM (User, Location)
  schemas/          # Pydantic request/response models
  routers/          # auth, locations, users, uploads — each mounted at /api
  services/
    cache.py        # Redis: store/revoke/get refresh tokens (JTI-based)
    upload.py       # File validation + save logic
```

**Auth flow:** `POST /api/auth/login` → returns `{access_token, refresh_token}`. Access token is a short-lived JWT (15 min). Refresh token is a UUID JTI stored in Redis (7 days). `POST /api/auth/refresh` exchanges a valid JTI for a new access token; `POST /api/auth/logout` revokes the JTI.

**RBAC:** Use `require_role(RoleEnum.superadmin)` or `require_role(RoleEnum.superadmin, RoleEnum.editor)` as a FastAPI dependency. `superadmin` can manage users; `editor` can manage locations.

**Uploaded media** is stored in the `uploads/` volume, served at `/media/<filename>` via `StaticFiles`. Max size: 50 MB.

### Frontend (`frontend/gg/src/`)

React 19 + TypeScript, Vite, Tailwind CSS v4.

**State:** Zustand store (`store/tourStore.ts`) owns `currentLocationId`, `viewMode` (`map` | `pano`), `mapType` (`campus` | `indoor`), `theme`, and `activeInfo` (info-sheet content). Nearly all UI decisions derive from this store.

**Data fetching:** TanStack Query via custom hooks in `hooks/`. All API calls go through `api/client.ts` which is an Axios instance at `baseURL: '/api'`. The response interceptor auto-retries on 401 by calling `/api/auth/refresh` once, then clears tokens on failure.

**Routing:**
| Path | Component |
|------|-----------|
| `/` | `Home` — landing |
| `/tour` | `TourPage` — main tour (map + panorama) |
| `/history` | `HistoryPage` |
| `/admin` | `AdminPage` — protected, checks auth client-side |

**Path alias:** `@` → `src/` (configured in `vite.config.ts`).

**Three.js / PSV note:** Photo Sphere Viewer and its markers plugin share a single Three.js instance via Vite `dedupe: ['three', '@photo-sphere-viewer/core']`. Do not add additional Three.js imports that bypass this — it will cause two instances and break rendering.

### Nginx (production)

`frontend/gg/nginx.conf` — HTTP only (port 80). `nginx-ssl.conf` — HTTPS with Let's Encrypt certs managed by the `certbot` container. `/api` and `/media` are proxied to `http://backend:8000`. Everything else serves the SPA `index.html`.

### Environment variables

All required vars are documented in `.env.example`. The backend reads them via `app/core/config.py` (`pydantic-settings`). `SECRET_KEY` must be a random 32-byte hex string (`openssl rand -hex 32`).

## Deployment (Azure VM)

VM: `20.91.196.152` (swedencentral), user `azureuser`, app path `~/gg/`.
```bash
ssh azureuser@20.91.196.152
cd ~/gg && git pull && docker compose up --build -d
```
