# EMS Backend API – Detailed Reference

Base URL: `/api`

- Reads are public for demo purposes; write routes (POST/PUT/DELETE) require `Authorization: Bearer <JWT>`.
- Health and Swagger docs are exposed at the root: `GET /health`, `GET /docs`.

## Conventions

- Pagination (list endpoints): query `page` (default 1), `limit` (default 10, max 100). Response shape: `{ data: [...], meta: { total, page, limit, pages } }`.
- Sorting (list endpoints): `sortBy` (default `createdAt`), `sortOrder` (`asc`|`desc`, default `desc`).
- Date/time: request bodies accept ISO 8601 Date strings; some fields represent date-only and are normalized to 00:00:00 UTC server-side. Shift times use `HH:mm` strings.
- IDs are MongoDB ObjectId strings unless noted.

## Authentication

### POST `/auth/login`
- Body: `{ email: string (email), password: string (min 6) }`
- 200: `{ token: string, user: { id, email, first_name, last_name, role } }`
- 401: `{ message: 'Invalid credentials' }`

### GET `/auth/me` (JWT)
- Returns the current user (password excluded).
- 200: `User`
- 401/404 on invalid token or missing user

## Health

### GET `/health`
- 200: `{ status: 'ok', time: ISODateString }`

## Entities (Schemas)

- Department: `{ _id, name: string, description?: string, createdAt, updatedAt }`
- Designation: `{ _id, department: Department._id, title: string, level?: string, createdAt, updatedAt }`
- User:
  - Fields: `{ _id, employee_code: string, first_name: string, last_name: string, email: string, phone?: string, department?: Department._id, designation?: Designation._id, hire_date?: Date, employment_status: 'ACTIVE'|'INACTIVE'|'ON_LEAVE'|'TERMINATED', role: 'ADMIN'|'EMPLOYEE', createdAt, updatedAt }`
  - Write-only: `password` (min 6) when creating/updating; stored as `password_hash`.
- Shift: `{ _id, name: string, start_time: 'HH:mm', end_time: 'HH:mm', break_minutes: number, createdAt, updatedAt }`
- EmployeeShift: `{ _id, user: User._id, shift: Shift._id, start_date: Date, end_date?: Date, createdAt, updatedAt }`
- Attendance:
  - `{ _id, user: User._id, att_date: Date (date-only), status: 'P'|'A'|'L'|'H', check_in?: Date, check_out?: Date, hours_worked: number, createdAt, updatedAt }`
  - Unique per `{ user, att_date }`.
- SalaryTemplate:
  - `{ _id, user: User._id (unique), basic_salary: number, allowance_fixed: number=0, allowance_percent: number=0, deduction_fixed: number=0, deduction_percent: number=0, effective_from: Date, createdAt, updatedAt }`
- PayrollRun:
  - `{ _id, user: User._id, period_year: number, period_month: 1..12, working_days: number, present_days: number, overtime_hours: number=0, basic_salary: number, total_allowances: number, total_deductions: number, gross_pay: number, net_pay: number, generated_at: Date, notes?: string, createdAt, updatedAt }`

## Users

### GET `/users`
- Query: `page`, `limit`, `sortBy`, `sortOrder`, filters: `departmentId`, `designationId`, `status`, `q` (matches first/last/email/employee_code, case-insensitive)
- 200: `{ data: User[], meta }`

### GET `/users/:id`
- 200: `User` (with populated `department`, `designation`)
- 404: not found

### POST `/users` (JWT)
- Body (required unless noted):
  - `employee_code` (string, required)
  - `first_name` (string, required)
  - `last_name` (string, required)
  - `email` (email, required)
  - `phone` (string, optional)
  - `department` (string, Department._id, optional)
  - `designation` (string, Designation._id, optional)
  - `hire_date` (ISO date string, optional)
  - `employment_status` ('ACTIVE'|'INACTIVE'|'ON_LEAVE'|'TERMINATED', optional; default 'ACTIVE')
  - `password` (string, min 6, required)
  - `role` ('ADMIN'|'EMPLOYEE', optional; default 'EMPLOYEE')
- 201: created `User`
- 400: validation error

### PUT `/users/:id` (JWT)
- Body: any subset of POST fields; if `password` present it is re-hashed.
- 200: updated `User`
- 404: not found

### DELETE `/users/:id` (JWT)
- Soft-deletes by setting `employment_status='INACTIVE'`.
- 200: `{ message, user }`
- 404: not found

## Departments

### GET `/departments`
- Supports pagination/sort.
- 200: `{ data: Department[], meta }`

### GET `/departments/:id`
- 200: `Department`
- 404: not found

### POST `/departments` (JWT)
- Body: `{ name: string (required, unique), description?: string }`
- 201: `Department`

### PUT `/departments/:id` (JWT)
- Body: partial of POST
- 200: updated `Department`

### DELETE `/departments/:id` (JWT)
- 200: `{ message: 'Deleted' }`

## Designations

### GET `/designations`
- Query: pagination/sort; filter `departmentId`.
- 200: `{ data: Designation[], meta }`

### GET `/designations/:id`
- 200: `Designation`
- 404: not found

### POST `/designations` (JWT)
- Body: `{ department: Department._id (required), title: string (required), level?: string }`
- 201: `Designation`

### PUT `/designations/:id` (JWT)
- Body: partial of POST; 200 updated `Designation`

### DELETE `/designations/:id` (JWT)
- 200: `{ message: 'Deleted' }`

## Shifts

### GET `/shifts`
- Pagination/sort
- 200: `{ data: Shift[], meta }`

### GET `/shifts/:id`
- 200: `Shift`
- 404: not found

### POST `/shifts` (JWT)
- Body: `{ name: string (required, unique), start_time: 'HH:mm', end_time: 'HH:mm', break_minutes: number>=0 }`
- 201: `Shift`

### PUT `/shifts/:id` (JWT)
- Body: partial of POST; 200 updated `Shift`

### DELETE `/shifts/:id` (JWT)
- 200: `{ message: 'Deleted' }`

## Employee Shifts

### GET `/employee-shifts`
- Pagination/sort; returns with populated `user`, `shift`.
- 200: `{ data: EmployeeShift[], meta }`

### GET `/employee-shifts/:id`
- 200: `EmployeeShift`
- 404: not found

### POST `/employee-shifts` (JWT)
- Body: `{ user: User._id (required), shift: Shift._id (required), start_date: Date (required), end_date?: Date }`
- 201: `EmployeeShift`

### PUT `/employee-shifts/:id` (JWT)
- Body: partial of POST; 200 updated `EmployeeShift`

### DELETE `/employee-shifts/:id` (JWT)
- 200: `{ message: 'Deleted' }`

## Attendance

### GET `/attendance`
- Query: `userId?`, `from?`, `to?` (date-only ISO strings allowed); pagination/sort.
- 200: `{ data: Attendance[], meta }`

### GET `/attendance/:id`
- 200: `Attendance`
- 404: not found

### POST `/attendance` (JWT)
- Body: `{ user: User._id, att_date: Date, status: 'P'|'A'|'L'|'H', check_in?: Date, check_out?: Date, hours_worked?: number>=0 }`
- Notes: `att_date` is normalized to date-only UTC; uniqueness enforced per user+date.
- 201: `Attendance`

### PUT `/attendance/:id` (JWT)
- Body: partial of POST; if `att_date` present it is normalized to date-only.
- 200: updated `Attendance`

### DELETE `/attendance/:id` (JWT)
- 200: `{ message: 'Deleted' }`

### POST `/attendance/check-in` (JWT)
- Body: `{ userId: User._id, timestamp?: Date }`
- Behavior: upserts today’s record (status defaults to `'P'`), sets `check_in`.
- 200: `Attendance`

### POST `/attendance/check-out` (JWT)
- Body: `{ userId: User._id, timestamp?: Date }`
- Behavior: finds today’s record, sets `check_out` and computes `hours_worked` from `check_in` if present.
- 200: `Attendance`; 404 if no record exists for today

## Salary Templates

### GET `/salary-templates`
- Query: `userId?`; pagination/sort.
- 200: `{ data: SalaryTemplate[], meta }`

### GET `/salary-templates/:userId`
- 200: `SalaryTemplate`
- 404: not found

### POST `/salary-templates` (JWT)
### PUT `/salary-templates` (JWT)
- Upsert by `user`.
- Body: `{ user: User._id, basic_salary: number, allowance_fixed?: number>=0, allowance_percent?: number>=0, deduction_fixed?: number>=0, deduction_percent?: number>=0, effective_from: Date }`
- 200: upserted `SalaryTemplate`

### DELETE `/salary-templates/:userId` (JWT)
- 200: `{ message: 'Deleted' }`

## Payroll

### POST `/payroll/generate` (JWT)
- Body: `{ year: integer, month: 1..12, userId?: User._id }`
- Response: `{ generated: number, runs: PayrollRun[] }`
- Notes: Calculation follows: `gross = basic + basic*allowance_percent/100 + allowance_fixed`; `deductions = deduction_fixed + basic*deduction_percent/100`; `net = gross - deductions`.

### GET `/payroll`
- Query: `userId?`, `year?`, `month?`; pagination/sort.
- 200: `{ data: PayrollRun[], meta }`

### GET `/payroll/:id`
- 200: `PayrollRun`; 404 if not found

### PUT `/payroll/:id` (JWT)
- Body (all optional): `{ working_days, present_days, overtime_hours, basic_salary, total_allowances, total_deductions, gross_pay, net_pay, notes }`
- 200: updated `PayrollRun`

### DELETE `/payroll/:id` (JWT)
- 200: `{ message: 'Deleted' }`

## Reports

By default, all report endpoints return Excel (.xlsx) downloads with tabular data. Add `?format=json` to receive JSON instead.

- GET `/reports/attendance/daily` – Daily attendance
  - Query: `date` (required), `format?=json`
  - 200: `.xlsx` attachment OR `{ data: Attendance[] }`
- GET `/reports/attendance/range` – Attendance by date range
  - Query: `from` (required), `to` (required), `userId?`, `format?=json`
  - 200: `.xlsx` attachment OR `{ data: Attendance[] }`
- GET `/reports/attendance/summary` – Monthly status summary
  - Query: `year` (required), `month` (required), `format?=json`
  - 200: `.xlsx` attachment OR `{ data: [{ _id: status, count }] }`
- GET `/reports/attendance/late` – Placeholder late report
  - Query: `from?`, `to?`, `format?=json`
  - 200: `.xlsx` attachment (empty) OR `{ data: [], note }`
- GET `/reports/shifts/coverage` – Shift coverage on date
  - Query: `date` (required), `format?=json`
  - 200: `.xlsx` attachment OR `{ data: EmployeeShift[] }`
- GET `/reports/shifts/roster` – Shift roster within range
  - Query: `from` (required), `to` (required), `format?=json`
  - 200: `.xlsx` attachment OR `{ data: EmployeeShift[] }`
- GET `/reports/payroll/summary` – Monthly totals
  - Query: `year` (required), `month` (required), `format?=json`
  - 200: `.xlsx` attachment OR `{ data: { total_net, count } }`
- GET `/reports/payroll/payslip` – Employee payslip for period
  - Query: `userId` (required), `year` (required), `month` (required), `format?=json`
  - 200: `.xlsx` attachment OR `PayrollRun`
- GET `/reports/salary/department-cost` – Totals by department
  - Query: `year` (required), `month` (required), `format?=json`
  - 200: `.xlsx` attachment OR `{ data: [{ _id, total_net }] }`
- GET `/reports/overtime` – Placeholder
  - Query: `year?`, `month?`, `format?=json`
  - 200: `.xlsx` attachment (empty) OR `{ data: [], note }`
- GET `/reports/headcount` – Headcount summary
  - Query: `departmentId?`, `format?=json`
  - 200: `.xlsx` attachment OR `{ count }`
- GET `/reports/employees/profile` – Employee profile
  - Query: `userId` (required), `format?=json`
  - 200: `.xlsx` attachment OR `User` (populated)

## Dashboard

- GET `/dashboard/kpis`
  - Query: `date?`, `departmentId?`, `designationId?`
  - 200: `{ totalActiveEmployees, presentToday }`
- GET `/dashboard/attendance/trend`
  - Query: `from` (required), `to` (required), `departmentId?`
  - 200: `{ series: [{ x: 'YYYY-MM-DD', y: number }] }`
- GET `/dashboard/attendance/breakdown`
  - Query: `date` (required), `departmentId?`
  - 200: `{ breakdown: [{ label: status, value }] }`
- GET `/dashboard/shifts/coverage`
  - Query: `date` (required), `departmentId?`
  - 200: `{ coverage: [] }` (placeholder)
- GET `/dashboard/departments/headcount`
  - 200: `{ breakdown: [{ label: departmentId|"Unassigned", value }] }`
- GET `/dashboard/overtime/top`
  - Query: `year?`, `month?`, `limit?`, `departmentId?`
  - 200: `{ data: [] }` (placeholder)
- GET `/dashboard/attendance/late`
  - Query: `year?`, `month?`, `graceMinutes?`, `departmentId?`
  - 200: `{ data: [] }` (placeholder)
- GET `/dashboard/payroll/trend`
  - Query: `year` (required), `departmentId?`
  - 200: `{ series: [{ x: 'YYYY-MM', y: number }] }`
- GET `/dashboard/payroll/department`
  - Query: `year` (required), `month` (required)
  - 200: `{ breakdown: [{ label: departmentId, value }] }`
- GET `/dashboard/payroll/coverage`
  - Query: `year` (required), `month` (required)
  - 200: `{ totalEmployees, processed, coverage }`
- GET `/dashboard/employee/:userId/snapshot`
  - Params: `userId`
  - Query: `from` (required), `to` (required)
  - 200: `{ userId, range: { from, to }, attendance: Attendance[] }`

## Errors

- Validation errors return 400 with `{ message, details? }`.
- Auth errors return 401 with `{ message }`.
- Not found returns 404 with `{ message }`.

## See Also

- Quick list of routes: `ems-backend/api.md`
- Live interactive docs: `GET /docs` (OpenAPI)
