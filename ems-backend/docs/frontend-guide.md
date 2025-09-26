# EMS Frontend Integration Guide (Page-by-Page)

Audience: frontend developers wiring the UI to the EMS backend.
- Base URL: `/api`
- Auth: reads are public; writes (POST/PUT/DELETE) require `Authorization: Bearer <JWT>`.
- Formats: JSON only. Dates in ISO 8601; some fields accept date-only or `HH:mm` time strings.
- Pagination: `page` (1), `limit` (10, max 100). Response: `{ data: [...], meta: { total, page, limit, pages } }`.
- Sorting: `sortBy` (default `createdAt`), `sortOrder` (`asc`|`desc`, default `desc`).
- Swagger docs: `GET /docs` for live schema; quick API list in `ems-backend/api.md`. Full details in `ems-backend/docs/api-details.md`.

## Global Application
- Auth flow
  - Login: `POST /auth/login` → `{ token, user }`. Persist token (e.g., localStorage) and set Authorization header globally for write calls.
  - Current user: `GET /auth/me` (JWT) to restore session on app load.
- API client
  - Attach `Authorization: Bearer <token>` for all write mutations.
  - Handle 401 by redirecting to login; show backend `{ message }` for 400/404/409.
- Common selectors
  - Departments: `GET /departments` for dropdowns.
  - Designations: `GET /designations?departmentId=` for cascaded dropdown.
  - Shifts: `GET /shifts` for roster/assignment forms.
- Date utils
  - Date-only fields (e.g., `att_date`): send `YYYY-MM-DD` or ISO string; backend normalizes to 00:00:00 UTC.
  - Shift time inputs use `HH:mm` strings.

## Pages and Required APIs

### 1) Login
Purpose: authenticate and bootstrap the session.
- Form fields: `email` (email), `password` (min 6)
- Submit: `POST /auth/login`
  - On success: store `token` and `user` → redirect to Dashboard.
- Me endpoint: `GET /auth/me` on app init if token exists.

### 2) Dashboard
Overview metrics and mini reports.
- KPIs: `GET /dashboard/kpis?date=` → `{ totalActiveEmployees, presentToday }`
- Attendance trend: `GET /dashboard/attendance/trend?from=&to=` → `{ series: [{ x:'YYYY-MM-DD', y }] }`
- Attendance breakdown: `GET /dashboard/attendance/breakdown?date=` → `{ breakdown: [{ label:'P|A|L|H', value }] }`
- Departments headcount: `GET /dashboard/departments/headcount` → `{ breakdown: [{ label: departmentId|'Unassigned', value }] }`
- Payroll trend: `GET /dashboard/payroll/trend?year=` → `{ series: [{ x:'YYYY-MM', y: totalNet }] }`
- Payroll department split: `GET /dashboard/payroll/department?year=&month=` → `{ breakdown: [{ label: departmentId, value }] }`
- Payroll coverage: `GET /dashboard/payroll/coverage?year=&month=` → `{ totalEmployees, processed, coverage }`
- Employee snapshot (detail widget): `GET /dashboard/employee/:userId/snapshot?from=&to=`

### 3) Employees
CRUD and viewing of employees.
- List page
  - Filters: `departmentId`, `designationId`, `status`, `q`
  - API: `GET /users?page=&limit=&sortBy=&sortOrder=&departmentId=&designationId=&status=&q=` → `{ data: User[], meta }`
- Detail page
  - API: `GET /users/:id` (populates `department`, `designation`)
- Create page (JWT)
  - Fields (required unless noted):
    - `employee_code` (string)
    - `first_name` (string)
    - `last_name` (string)
    - `email` (email)
    - `phone?` (string)
    - `department?` (Department._id)
    - `designation?` (Designation._id)
    - `hire_date?` (ISO date)
    - `employment_status?` ('ACTIVE'|'INACTIVE'|'ON_LEAVE'|'TERMINATED', default 'ACTIVE')
    - `password` (min 6)
    - `role?` ('ADMIN'|'EMPLOYEE', default 'EMPLOYEE')
  - API: `POST /users`
- Edit page (JWT)
  - Same fields as create; `password` optional. API: `PUT /users/:id`
- Soft delete (JWT)
  - API: `DELETE /users/:id` → sets `employment_status='INACTIVE'`

### 4) Departments
- List: `GET /departments?page=&limit=`
- Create (JWT): `POST /departments` with `{ name, description? }`
- Edit (JWT): `PUT /departments/:id` with `{ name?, description? }`
- Delete (JWT): `DELETE /departments/:id`

### 5) Designations
- List: `GET /designations?page=&limit=&departmentId?`
- Create (JWT): `POST /designations` with `{ department, title, level? }`
- Edit (JWT): `PUT /designations/:id` with partial body
- Delete (JWT): `DELETE /designations/:id`

### 6) Shifts
- List: `GET /shifts?page=&limit=`
- Create (JWT): `POST /shifts` with `{ name, start_time:'HH:mm', end_time:'HH:mm', break_minutes:Number }`
- Edit (JWT): `PUT /shifts/:id` with partial body
- Delete (JWT): `DELETE /shifts/:id`

### 7) Employee Shift Assignments
- List: `GET /employee-shifts?page=&limit=` (populates `user`, `shift`)
- Detail: `GET /employee-shifts/:id`
- Assign (JWT): `POST /employee-shifts` with `{ user, shift, start_date, end_date? }`
- Edit (JWT): `PUT /employee-shifts/:id`
- Delete (JWT): `DELETE /employee-shifts/:id`

### 8) Attendance
- List
  - Filters: `userId`, `from`, `to`
  - API: `GET /attendance?page=&limit=&userId=&from=&to=`
- Detail: `GET /attendance/:id`
- Create manual (JWT): `POST /attendance` with `{ user, att_date, status:'P'|'A'|'L'|'H', check_in?, check_out?, hours_worked? }`
- Edit (JWT): `PUT /attendance/:id` (same fields, all optional)
- Delete (JWT): `DELETE /attendance/:id`
- Self-service buttons (JWT):
  - Check-in: `POST /attendance/check-in` with `{ userId, timestamp? }`
  - Check-out: `POST /attendance/check-out` with `{ userId, timestamp? }`

### 9) Salary Templates
Per-employee pay configuration used for payroll generation.
- List: `GET /salary-templates?page=&limit=&userId?`
- Get by user: `GET /salary-templates/:userId`
- Upsert (Create/Update) (JWT): `POST /salary-templates` or `PUT /salary-templates`
  - Body: `{ user, basic_salary, allowance_fixed=0, allowance_percent=0, deduction_fixed=0, deduction_percent=0, effective_from }`
- Delete (JWT): `DELETE /salary-templates/:userId`

### 10) Payroll
Generate and adjust monthly payroll.
- Generate (JWT): `POST /payroll/generate` with `{ year:Number, month:1..12, userId? }`
  - Backend computes: `gross = basic + %allow + fixedAllow`, `deductions = fixedDed + %ded`, `net = gross - deductions`, present days from attendance.
  - Response: `{ generated, runs: PayrollRun[] }`
- List: `GET /payroll?page=&limit=&userId?&year?&month?`
- Detail: `GET /payroll/:id`
- Edit (JWT): `PUT /payroll/:id` with optional fields `{ working_days, present_days, overtime_hours, basic_salary, total_allowances, total_deductions, gross_pay, net_pay, notes }`
- Delete (JWT): `DELETE /payroll/:id`

### 11) Reports
All report endpoints return Excel (.xlsx) files by default. Pass `?format=json` to receive JSON instead.

- Attendance
  - Daily: `GET /reports/attendance/daily?date=YYYY-MM-DD[&format=json]`
  - Range: `GET /reports/attendance/range?from=YYYY-MM-DD&to=YYYY-MM-DD&userId?[&format=json]`
  - Summary: `GET /reports/attendance/summary?year=&month=[&format=json]` → group by status
  - Late: `GET /reports/attendance/late[?from=&to=][&format=json]` → placeholder, returns empty Excel/JSON
- Shifts
  - Coverage (on date): `GET /reports/shifts/coverage?date=YYYY-MM-DD[&format=json]`
  - Roster (range): `GET /reports/shifts/roster?from=&to=[&format=json]`
- Payroll
  - Summary: `GET /reports/payroll/summary?year=&month=[&format=json]`
  - Payslip: `GET /reports/payroll/payslip?userId=&year=&month=[&format=json]`
  - Department cost: `GET /reports/salary/department-cost?year=&month=[&format=json]`
- Headcount: `GET /reports/headcount?departmentId?[&format=json]`
- Employee profile: `GET /reports/employees/profile?userId=[&format=json]`

Frontend: use `axios` with `responseType: 'blob'` to download the Excel file, set `Content-Disposition` filename as the download name.

### 12) User Self Service (Employee Portal)
- My profile: `GET /auth/me` (basic) or `GET /reports/employees/profile?userId=<me>` for expanded view.
- My attendance: `GET /attendance?userId=<me>&from=&to=`
- My payslips: `GET /payroll?userId=<me>&year?&month?` or `GET /reports/payroll/payslip?userId=<me>&year=&month=`
- My shift assignments: `GET /employee-shifts?page=&limit=` then filter client-side by `user._id === me` or request server support if needed.
- Actions: check-in/out endpoints under Attendance.

## Forms: Field Definitions and Validation
- Employee
  - Required: `employee_code`, `first_name`, `last_name`, `email`, `password`
  - Optional: `phone`, `department`, `designation`, `hire_date`, `employment_status`, `role`
- Department: `name` (required), `description?`
- Designation: `department` (ref) and `title` (required), `level?`
- Shift: `name` (required), `start_time` (`HH:mm`), `end_time` (`HH:mm`), `break_minutes` (>=0)
- Employee Shift: `user` (ref), `shift` (ref), `start_date`, `end_date?`
- Attendance: `user`, `att_date`, `status ('P'|'A'|'L'|'H')`, `check_in?`, `check_out?`, `hours_worked?`
- Salary Template: `user`, `basic_salary`, `allowance_fixed?`, `allowance_percent?`, `deduction_fixed?`, `deduction_percent?`, `effective_from`
- Payroll adjustments: see Payroll Edit above; all optional

## UI Wiring Checklist
- Token management
  - Save token after login; set `Authorization` header for mutations.
  - On 401, clear token and route to login.
- Lists
  - Respect `page`, `limit`, `sortBy`, `sortOrder`; render `meta` pagination.
  - Use server filters to minimize payloads.
- Lookups
  - Preload departments/designations/shifts for forms; cascade designations by department.
- Date/time
  - Use ISO strings; for date-only fields you can send `YYYY-MM-DD`.
  - Shift times are `HH:mm` strings.
- Error UX
  - Show backend `message` for 400/401/404; surface Zod validation errors as form messages.

## Example API Client Snippets
- Axios setup
```ts
import axios from 'axios';

export const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

- Login
```ts
const { data } = await api.post('/auth/login', { email, password });
localStorage.setItem('token', data.token);
```

- Paginated list example
```ts
const { data } = await api.get('/users', { params: { page, limit, q, sortBy: 'createdAt', sortOrder: 'desc' } });
setRows(data.data);
setMeta(data.meta);
```

## Navigation Blueprint (Suggested)
- `/login`
- `/dashboard`
- `/employees` (list) → `/employees/:id` (view) → `/employees/:id/edit` | `/employees/new`
- `/departments` (list/new/edit)
- `/designations` (list/new/edit)
- `/shifts` (list/new/edit)
- `/roster` (employee-shifts list/new/edit)
- `/attendance` (list/view/new/edit)
- `/payroll` (list) → `/payroll/generate` (wizard) → `/payroll/:id` (view/edit)
- `/reports`
  - `attendance/daily`, `attendance/range`, `attendance/summary`, `shifts/coverage`, `shifts/roster`, `payroll/summary`, `payroll/department-cost`, `payslip`, `headcount`
- `/me` (profile) → `my/attendance`, `my/payslips`

## Notes and Limitations
- Some dashboard/report endpoints return placeholders for demo (`overtime`, `late`, `shifts/coverage`). Build UI that tolerates empty datasets.
- Reads are intentionally public to simplify demos; production apps should enforce auth on reads as needed.
- Use `api-details.md` for exact response shapes and parameter names while implementing forms and tables.
