# Dashboard Endpoints

Purpose: provide lightweight analytics views for attendance, payroll, and headcount.

Response shapes:
- KPIs: `{ totalActiveEmployees, presentToday }`
- Line series: `{ series: [{ x, y }, ...] }`
- Breakdown: `{ breakdown: [{ label, value }, ...] }`
- Coverage summary: `{ totalEmployees, processed, coverage }`

## Endpoints

- GET `/dashboard/kpis?date=&departmentId?&designationId?`
  - Returns daily KPIs.

- GET `/dashboard/attendance/trend?from=&to=&departmentId?`
  - Returns `{ series: [{ x: 'YYYY-MM-DD', y: presentCount }, ...] }`.

- GET `/dashboard/attendance/breakdown?date=&departmentId?`
  - Returns `{ breakdown: [{ label: 'P'|'A'|'L'|'H', value }, ...] }`.

- GET `/dashboard/shifts/coverage?date=&departmentId?`
  - Returns `{ coverage: [] }` placeholder for now.

- GET `/dashboard/departments/headcount`
  - Returns `{ breakdown: [{ label: '<departmentId>', value }, ...] }`.

- GET `/dashboard/overtime/top?year=&month=&limit=&departmentId?`
  - Returns `{ data: [] }` placeholder for now.

- GET `/dashboard/attendance/late?year=&month=&graceMinutes=&departmentId?`
  - Returns `{ data: [] }` placeholder for now.

- GET `/dashboard/payroll/trend?year=&departmentId?`
  - Returns `{ series: [{ x: 'YYYY-MM', y: totalNet }, ...] }`.

- GET `/dashboard/payroll/department?year=&month=`
  - Returns `{ breakdown: [{ label: '<departmentId>', value }, ...] }`.

- GET `/dashboard/payroll/coverage?year=&month=`
  - Returns coverage summary `{ totalEmployees, processed, coverage }`.

- GET `/dashboard/employee/:userId/snapshot?from=&to=`
  - Returns user attendance snapshot in the date range.

## How to test quickly

```
curl http://localhost:3000/api/dashboard/kpis
curl "http://localhost:3000/api/dashboard/attendance/trend?from=2024-01-01&to=2024-01-07"
curl "http://localhost:3000/api/dashboard/payroll/trend?year=2024"
```

