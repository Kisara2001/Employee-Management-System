
# EMS Quickstart

Separate folders for backend and frontend.

## 1) Prereqs
- Node.js 18+
- MongoDB (local or Atlas)
- Two terminals

## 2) Backend Setup
```bash
cd backend
cp .env.example .env
# edit .env if needed (MONGO_URI, JWT_SECRET, CLIENT_ORIGIN)
npm i
# Seed first admin (only once)
ALLOW_SEED=true node src/server.js & # run server temporarily if needed
# or use script with env:
SEED_ADMIN_EMAIL=admin@ems.local SEED_ADMIN_PASSWORD=admin123 npm run seed:admin
npm run dev
```
Backend will run at http://localhost:3001

## 3) Frontend Setup
```bash
cd frontend
cp .env.example .env
npm i
npm run dev
```
Frontend will run at http://localhost:5173

## 4) Login
Use:
- Email: admin@ems.local
- Password: admin123

## 5) Flow (Finish fast)
1. Create 2-3 Departments.
2. Create Employees (code, name, email) — minimal fields.
3. Copy an employee's `_id` (from network response using DevTools) and use Attendance tab to check-in/out.
4. Search employees from Employees tab.

## 6) Production tips
- Host frontend: Vercel/Netlify.
- Host backend: Render/Railway.
- Database: MongoDB Atlas.
- Set `CLIENT_ORIGIN` to deployed frontend domain.
- Set secure `JWT_SECRET`.

## 7) Notes for your report/viva (map to rubric)
- SDLC: Git commits + ClickUp screenshots.
- Testing: capture 5 cases (auth, employee CRUD, dept CRUD, attendance check-in/out, search).
- Deployment: mention Vercel + Render or local simulation.
- Team contribution: screenshot commits.

Good luck!
