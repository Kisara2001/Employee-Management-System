# API Endpoints

Authentication: reads are public; write routes (POST/PUT/DELETE) require Bearer JWT.
Base path: `/api`

## Auth
- POST `/auth/login` – body `{ email, password }` → returns `{ token, user }`
- GET `/auth/me` – current user (requires JWT)

## Health
- GET `/health` – `{ status:'ok', time }`

## Users / Employees
- POST `/users` – create user (JWT)
- GET `/users` – list users; filters: `departmentId`, `designationId`, `status`, `q`; pagination: `page`, `limit`;
- GET `/users/:id` – get by id
- PUT `/users/:id` – update (JWT)
- DELETE `/users/:id` – soft delete (set `employment_status='INACTIVE'`) (JWT)

## Departments
- POST `/departments` (JWT)
- GET `/departments`
- GET `/departments/:id`
- PUT `/departments/:id` (JWT)
- DELETE `/departments/:id` (JWT)

## Designations
- POST `/designations` (JWT)
- GET `/designations` – filter by `departmentId`
- GET `/designations/:id`
- PUT `/designations/:id` (JWT)
- DELETE `/designations/:id` (JWT)

## Shifts
- POST `/shifts` (JWT)
- GET `/shifts`
- GET `/shifts/:id`
- PUT `/shifts/:id` (JWT)
- DELETE `/shifts/:id` (JWT)

## Employee Shifts
- POST `/employee-shifts` (JWT)
- GET `/employee-shifts`
- GET `/employee-shifts/:id`
- PUT `/employee-shifts/:id` (JWT)
- DELETE `/employee-shifts/:id` (JWT)

## Attendance
- POST `/attendance` (JWT)
- GET `/attendance` – filters: `userId`, `from`, `to`
- GET `/attendance/:id`
- PUT `/attendance/:id` (JWT)
- DELETE `/attendance/:id` (JWT)
- POST `/attendance/check-in` – `{ userId, timestamp? }` (JWT)
- POST `/attendance/check-out` – `{ userId, timestamp? }` (JWT)

## Salary Templates
- POST `/salary-templates` – upsert (JWT)
- PUT `/salary-templates` – upsert (JWT)
- GET `/salary-templates` – filter: `userId`
- GET `/salary-templates/:userId`
- DELETE `/salary-templates/:userId` (JWT)

## Payroll
- POST `/payroll/generate` – `{ year, month, userId? }` (JWT)
  - Calculation: `gross = basic + (basic*allowance_percent/100) + allowance_fixed`
  - `deductions = deduction_fixed + (basic*deduction_percent/100)`
  - `net = gross - deductions`
- GET `/payroll` – filters: `userId`, `year`, `month`
- GET `/payroll/:id`
- PUT `/payroll/:id` – adjust and add notes (JWT)
- DELETE `/payroll/:id` (JWT)

## Reports
- GET `/reports/attendance/daily?date=YYYY-MM-DD&departmentId?&designationId?&format=json|csv|pdf`
- GET `/reports/attendance/range?userId?&departmentId?&from=&to=&format=json|csv|pdf`
- GET `/reports/attendance/summary?year=&month=&departmentId?&format=json|csv|pdf`
- GET `/reports/attendance/late?year=&month=&graceMinutes=&departmentId?&format=json|csv|pdf`
- GET `/reports/shifts/coverage?date=&departmentId?&format=json|csv|pdf`
- GET `/reports/shifts/roster?from=&to=&departmentId?&format=json|csv|pdf`
- GET `/reports/payroll/summary?year=&month=&departmentId?&format=json|csv|pdf`
- GET `/reports/payroll/payslip?userId=&year=&month=&format=json|csv|pdf`
- GET `/reports/salary/department-cost?year=&month=&format=json|csv|pdf`
- GET `/reports/overtime?year=&month=&departmentId?&format=json|csv|pdf`
- GET `/reports/headcount?departmentId?&format=json|csv|pdf`
- GET `/reports/employees/profile?userId=&format=json|csv|pdf`

Note: CSV/PDF are stubbed; JSON is returned.

## Dashboard
- GET `/dashboard/kpis?date=&departmentId?&designationId?` – KPIs object
- GET `/dashboard/attendance/trend?from=&to=&departmentId?` – line series `{x,y}`
- GET `/dashboard/attendance/breakdown?date=&departmentId?` – breakdown `{label,value}`
- GET `/dashboard/shifts/coverage?date=&departmentId?` – coverage list
- GET `/dashboard/departments/headcount` – breakdown `{label,value}`
- GET `/dashboard/overtime/top?year=&month=&limit=&departmentId?` – list
- GET `/dashboard/attendance/late?year=&month=&graceMinutes=&departmentId?` – list
- GET `/dashboard/payroll/trend?year=&departmentId?` – line series
- GET `/dashboard/payroll/department?year=&month=` – breakdown
- GET `/dashboard/payroll/coverage?year=&month=` – coverage summary
- GET `/dashboard/employee/:userId/snapshot?from=&to=` – user snapshot

## How to test quickly
- Login and call protected route
```
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login -H 'Content-Type: application/json' -d '{"email":"admin@example.com","password":"Admin@12345"}' | jq -r .token)
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/departments
```

