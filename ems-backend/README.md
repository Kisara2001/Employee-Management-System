# EMS Backend (Node.js + Express + TypeScript + MongoDB)

A clean, production-ready Employee Management System (EMS) backend suitable for a university assignment. Uses Express, TypeScript, Mongoose, Zod, JWT auth, Swagger docs, and seed scripts.

## Quick Start

- Clone repo and open `ems-backend/`
- Install deps: `npm install`
- Create `.env` (copy from `.env.example`) or rely on defaults
- Run dev server: `npm run dev`
- Health check: `GET http://localhost:3000/health`
- Swagger: `http://localhost:3000/docs`

On startup you should see:
- `Server listening on http://localhost:3000`
- `CORS allowed origin: http://localhost:5173`

To permit multiple front-end domains in production, set `CORS_ORIGINS` (or `CORS_ORIGIN`) to a
comma-separated list, e.g. `CORS_ORIGINS="https://app.example.com,https://admin.example.com"`.

## Seeding

- Seed initial admin only: `npm run seed`
- Seed demo data (small, a few users): `npm run seed:demo`
- Seed bulk data (DESTRUCTIVE: clears all EMS data first), then creates:
  - 3 departments, 6 designations, 3 shifts
  - 20 employees with assignments and salary templates
  - Attendance for date range (default `2025-08-01` → `2025-09-26`) with varied times/status
  - Payroll generated for all months in the range
  - Run: `npm run seed:bulk`
  - Override range: `SEED_FROM=YYYY-MM-DD SEED_TO=YYYY-MM-DD npm run seed:bulk`
  
- Seed attendance for a specific date range (varied times/status):
  - Defaults to `2025-08-01` → `2025-09-26`:
    - `npm run seed:attendance:range`
  - Or override via environment variables:
    - `SEED_FROM=2025-08-01 SEED_TO=2025-09-26 npm run seed:attendance:range`

Admin credentials (from `.env`):
- Email: `ADMIN_EMAIL` (default `admin@example.com`)
- Password: `ADMIN_PASSWORD` (default `Admin@12345`)

## Scripts

- `npm run dev` – ts-node-dev for live reload
- `npm run build` – compile TypeScript to `dist/`
- `npm start` – run compiled server
- `npm run seed` – seed exactly one admin
- `npm run seed:demo` – seed demo data (idempotent)
- `npm run lint` / `npm run format` – linting & formatting helpers

## Folder Structure

- `src/`
  - `config/` – env & db
  - `models/` – Mongoose schemas
  - `controllers/` – REST handlers
  - `services/` – business logic (payroll, attendance)
  - `routes/` – Express routers
  - `middleware/` – error handling, auth, validation
  - `utils/` – helpers (date, calc, paginate)
  - `docs/` – Swagger setup
  - `seed/` – seed helpers
  - `app.ts` – app wiring
  - `server.ts` – startup
- `scripts/` – seed scripts entrypoints
- `public/` – static assets (empty)

## Sample curl

- Health: `curl http://localhost:3000/health`
- Login: `curl -X POST http://localhost:3000/api/auth/login -H 'Content-Type: application/json' -d '{"email":"admin@example.com","password":"Admin@12345"}'`
- List users: `curl http://localhost:3000/api/users`

## Deploy

- Docker build: `docker build -t ems-backend .`
- Docker run: `docker run -p 3000:3000 --env-file .env ems-backend`

## Notes

- Reads are public for demo; write routes require Bearer JWT.
- Reports return Excel (.xlsx) by default. Append `?format=json` to get JSON.
- See `database_structure.md`, `api.md`, and `dashboard.md` for more details.
