# EMS Database Design (MongoDB)

## Collections & Schemas

### Department
- Fields:
  - `_id: ObjectId`
  - `name: string` (unique)
  - `description?: string`
  - `createdAt, updatedAt`
- Usage: reference on `User.department`.

### Designation
- Fields:
  - `_id: ObjectId`
  - `department: ObjectId (Department)`
  - `title: string`
  - `level?: string`
  - `createdAt, updatedAt`
- Usage: reference on `User.designation`.

### User (Employee)
- Fields:
  - `_id: ObjectId`
  - `employee_code: string` (unique)
  - `first_name, last_name: string`
  - `email: string` (unique)
  - `phone?: string`
  - `department?: ObjectId (Department)`
  - `designation?: ObjectId (Designation)`
  - `hire_date?: Date`
  - `employment_status: 'ACTIVE'|'INACTIVE'|'ON_LEAVE'|'TERMINATED'` (default `ACTIVE`)
  - `role: 'ADMIN'|'EMPLOYEE'` (default `EMPLOYEE`)
  - `password_hash: string`
  - `createdAt, updatedAt`
- Indexes:
  - Unique on `employee_code`, `email`
- Notes: `password` is virtual for hashing.

### Shift
- Fields:
  - `_id: ObjectId`
  - `name: string` (unique)
  - `start_time: 'HH:mm'`
  - `end_time: 'HH:mm'`
  - `break_minutes: number`
  - `createdAt, updatedAt`

### EmployeeShift
- Fields:
  - `_id: ObjectId`
  - `user: ObjectId (User)`
  - `shift: ObjectId (Shift)`
  - `start_date: Date`
  - `end_date?: Date`
  - `createdAt, updatedAt`
- Notes: represents shift assignment periods.

### Attendance
- Fields:
  - `_id: ObjectId`
  - `user: ObjectId (User)`
  - `att_date: Date` (normalized to 00:00:00 UTC)
  - `status: 'P'|'A'|'L'|'H'`
  - `check_in?: Date`
  - `check_out?: Date`
  - `hours_worked?: number`
  - `createdAt, updatedAt`
- Indexes:
  - Unique compound `{ user, att_date }`
- Notes: Hours auto-computed during check-out where both timestamps exist.

### SalaryTemplate
- Fields:
  - `_id: ObjectId`
  - `user: ObjectId (User)` UNIQUE
  - `basic_salary: number`
  - `allowance_fixed?: number` (default 0)
  - `allowance_percent?: number` (default 0)
  - `deduction_fixed?: number` (default 0)
  - `deduction_percent?: number` (default 0)
  - `effective_from: Date`
  - `createdAt, updatedAt`

### PayrollRun
- Fields:
  - `_id: ObjectId`
  - `user: ObjectId (User)`
  - `period_year: number`
  - `period_month: number` (1–12)
  - `working_days: number`
  - `present_days: number`
  - `overtime_hours: number`
  - `basic_salary: number`
  - `total_allowances: number`
  - `total_deductions: number`
  - `gross_pay: number`
  - `net_pay: number`
  - `generated_at: Date`
  - `notes?: string`
  - `createdAt, updatedAt`
- Indexes:
  - Unique compound `{ user, period_year, period_month }`

## Relationships
- User → Department (many-to-one)
- User → Designation (many-to-one)
- User → SalaryTemplate (one-to-one)
- User → EmployeeShift (one-to-many over time)
- User → Attendance (one-to-many, unique per day)
- User → PayrollRun (one-to-many per month)

## Data Constraints & Integrity
- Keep `employment_status` consistent; DELETE is soft via status.
- Attendance uniqueness enforced; updates are idempotent for a given date.
- Shift times are strings in `HH:mm`; business logic interprets them for attendance jitter and coverage.

## Reporting & Aggregations
- Department headcount via `$group` on `User.department`.
- Attendance summary by status via `$match` + `$group` over date ranges.
- Payroll department breakdown joins `users` then groups by `department` and looks up department names.
- Excel exports map aggregated rows to column definitions in the backend.

