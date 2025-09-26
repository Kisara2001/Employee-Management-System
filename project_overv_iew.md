# EMS – Project Overview

## Purpose
EMS (Employee Management System) centralizes core HR workflows — organization setup, employee records, attendance tracking, shift scheduling, payroll, analytics, and exportable reporting — into a modern, responsive web app.

## Scope
- Admin-facing management console (web) for HR operations
- Backend REST API with auth, validation, and reporting
- MongoDB datastore modeling org, people, time, and payroll
- Seed data for demos and bulk simulation

## Feature Set
- Authentication: JWT login, session validation (`/auth/login`, `/auth/me`)
- Organization: Departments, Designations (CRUD)
- Employees: CRUD with soft delete, search, filtering, detail and edit views
- Shifts & Assignments: shift catalog + user assignment windows
- Attendance: daily status (P/A/L/H), timestamps (check-in/out), hours, filters
- Salary Templates: single template per user (fixed/percent allowances & deductions)
- Payroll: monthly generation, list, update, delete; per-user and global
- Reports: Attendance (daily/range/summary), Shifts (coverage/roster), Payroll (summary/payslip/department cost), Headcount, Employee profile — Excel (.xlsx) by default
- Dashboard: KPIs, attendance trend (30 days), department payroll breakdown, monthly payroll total

## Architecture Summary
- Frontend: React + TypeScript + Vite, TailwindCSS + shadcn/ui, Axios, React Router
- Backend: Express + TypeScript, Mongoose, Zod, JWT, ExcelJS
- Database: MongoDB with well-defined collections, references, and indexes
- Docs: Swagger UI (`/docs`) for API exploration
- Exports: Excel by default with optional `?format=json`

## Module Map
- Users (Employees)
- Departments, Designations
- Shifts, Employee Shifts
- Attendance
- Salary Templates
- Payroll
- Dashboard
- Reports

## API & Integration Patterns
- Base URL: `/api`
- Reads are public for demo; write operations require `Authorization: Bearer <JWT>`
- Pagination: `page`, `limit` (max 100); Sorting: `sortBy`, `sortOrder`
- Errors: 400 (validation), 401 (auth), 404 (not found)
- Reports: return `.xlsx` (set `responseType: 'blob'` on client)

## Data Model Snapshot
- Department: `{ _id, name, description? }`
- Designation: `{ _id, department, title, level? }`
- User: `{ _id, employee_code, first_name, last_name, email, phone?, department?, designation?, employment_status, role, password_hash }`
- Shift: `{ _id, name, start_time, end_time, break_minutes }`
- EmployeeShift: `{ _id, user, shift, start_date, end_date? }`
- Attendance: `{ _id, user, att_date(date-only), status, check_in?, check_out?, hours_worked? }`
- SalaryTemplate: `{ _id, user(unique), basic_salary, allowance_fixed/percent, deduction_fixed/percent, effective_from }`
- PayrollRun: `{ _id, user, period_year, period_month, working_days, present_days, overtime_hours, basic_salary, total_allowances, total_deductions, gross_pay, net_pay, generated_at, notes? }`

## Environments & Config
- Frontend `.env`:
  - `VITE_API_BASE_URL=http://localhost:3000/api`
  - `VITE_APP_NAME=EMS`
  - `VITE_ENABLE_DEMO_LOGIN=false`
- Backend `.env`:
  - `PORT`, `MONGO_URI`, `JWT_SECRET`, `CORS_ORIGIN`, admin seed fields

## Seeding & Demo Data
- Admin only: `npm run seed`
- Bulk (DESTRUCTIVE — clears all data): `npm run seed:bulk`
  - 3 departments, 6 designations, 3 shifts, 20 employees
  - Salary templates for all
  - Attendance for date range (default 2025-08-01 → 2025-09-26)
  - Payroll generated for all months in range
  - Override: `SEED_FROM=YYYY-MM-DD SEED_TO=YYYY-MM-DD`
- Range attendance: `npm run seed:attendance:range` (same overrides)

## Security & Privacy
- JWT authentication with 7d expiry; tokens stored in localStorage
- Input validation (Zod) on write routes
- CORS locked to configured origin
- Minimal PII; logs do not include secrets

## Performance & Scaling
- Pagination on lists; compound indexes on hot paths (e.g., Attendance `{ user, att_date }`)
- Aggregations optimized with `$match` first; lookups where needed (e.g., department names)
- Heavy reports can be moved to async jobs if necessary

## Testing & Quality
- Linting and type checks in both frontend/backend
- Swagger for contract verification
- Seed datasets for reproducible demos and manual testing

## Deployment
- Node service + MongoDB (Docker-ready)
- ENV-driven configuration for portability
- Reverse proxy (e.g., Nginx) recommended for TLS and caching

## Roadmap (Suggested)
- Charts on dashboard (Recharts) and visual report outputs
- Role-based UI and API authorization beyond simple roles
- Advanced attendance analytics (late, overtime)
- SSO integration (OIDC/SAML)
- Background jobs for report generation at scale

## References
- backend_architecture.md
- frontend_architecture.md
- database.md
- requirements.md (high-level)
- srs.md (formal)
- feasibility_study.md
- project_flow.md
