# EMS Frontend Architecture

## Overview
A modern React + TypeScript + Vite frontend with TailwindCSS and shadcn/ui components. It implements authentication, dashboard, employees, departments, designations, shifts, shift assignments, attendance, salary templates, payroll, and reports (Excel download) views.

## Tech Stack
- React 18 + TypeScript
- Vite 5
- TailwindCSS + shadcn/ui (Radix primitives)
- React Router v6
- Axios for API client
- TanStack Query client is configured but not heavily used (available for future data fetching)
- Icons: lucide-react

## Structure
```
src/
  app/                 # AppShell layout & navigation
  components/ui        # shadcn/ui components (inputs, table, select, etc.)
  hooks/               # auth guard & toasts
  lib/                 # api client, auth utils, queryClient
  pages/               # feature pages (Dashboard, Employees, etc.)
  store/               # theme init
```

## Routing
- Public `/login` (redirects to `/` if authenticated)
- Protected `/` (AppShell) and child routes:
  - `/` Dashboard
  - `/employees`, `/employees/new`, `/employees/:id`, `/employees/:id/edit`
  - `/departments`
  - `/designations`
  - `/shifts`
  - `/shift-assignments`
  - `/attendance`
  - `/salary-templates`
  - `/payroll`
  - `/reports`

## Authentication
- Login Page submits `POST /auth/login`.
- On success: token + user stored in `localStorage` via `setAuth`.
- App init: calls `GET /auth/me`; invalid tokens are cleared (forces real login for writes).
- Axios interceptor attaches `Authorization: Bearer <token>` for all requests.
- Demo login is disabled by default (`VITE_ENABLE_DEMO_LOGIN=false`).

## API Client
- `src/lib/api.ts` sets `baseURL` (default `http://localhost:3000/api`).
- Interceptors: attach token; on 401 clear auth and redirect to `/login`.

## Styling System
- TailwindCSS theme with glassmorphism accents.
- Components from shadcn/ui adapted to project tokens.
- Select overlays adjusted to solid background for readability.

## Feature Wiring (Highlights)
- Employees: List (GET /users), Create (POST /users), Detail (GET /users/:id), Edit (PUT /users/:id), Delete (DELETE /users/:id soft-deactivate).
- Departments/Designations/Shifts: full CRUD with lookups and filters.
- Shift Assignments: CRUD with user/shift lookups.
- Attendance: filters + CRUD + self-service check-in/out.
- Salary Templates: upsert and list.
- Payroll: list + generate + delete.
- Reports: guided selector, downloads Excel files via `responseType: 'blob'`.
- Dashboard: KPIs (GET /dashboard/kpis), attendance trend (GET /dashboard/attendance/trend), department payroll (GET /dashboard/payroll/department), monthly payroll total (GET /reports/payroll/summary?format=json).

## State & Data
- Local state per page with React hooks.
- Toast notifications on success/failure.
- Query client available for future caching and invalidation patterns.

## Error Handling
- Toasts display backend `{ message }` where available.
- On 401, auth cleared globally and user is redirected to `/login`.

## Environment
- `.env` variables (Vite):
  - `VITE_API_BASE_URL=http://localhost:3000/api`
  - `VITE_APP_NAME=EMS`
  - `VITE_ENABLE_DEMO_LOGIN=false`

## Extensibility Notes
- Charts: Recharts is installed; lists can be replaced with charts.
- Forms: React Hook Form + Zod validators used for auth and employee forms; extend as needed.
- Role-based UI: can hide actions based on `user.role` in AppShell.

