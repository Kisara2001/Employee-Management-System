# Database Structure (MongoDB + Mongoose)

This document outlines the EMS data model using MongoDB collections (Mongoose schemas) and references.

## Collections

1) departments
- Fields: `name` (unique), `description`, `createdAt`, `updatedAt`
- Indexes: unique index on `{ name: 1 }`

2) designations
- Fields: `department` (ObjectId -> departments), `title`, `level?`, `createdAt`, `updatedAt`
- Indexes: unique compound `{ department: 1, title: 1 }`
- ER: `designation.department -> departments._id`

3) users
- Fields: `employee_code` (unique), `first_name`, `last_name`, `email` (unique), `phone?`, `department` (ref), `designation` (ref), `hire_date?`, `employment_status` ('ACTIVE'|'INACTIVE'|'ON_LEAVE'|'TERMINATED'), `password_hash`, `role` ('ADMIN'|'EMPLOYEE'), timestamps
- Indexes: unique `{ employee_code: 1 }`, unique `{ email: 1 }`
- Notes: pre-save hashes the virtual `password` field into `password_hash` if provided
- ER: `users.department -> departments._id`, `users.designation -> designations._id`

4) shifts
- Fields: `name` (unique), `start_time` ('HH:mm'), `end_time` ('HH:mm'), `break_minutes` (Number), timestamps
- Indexes: unique `{ name: 1 }`

5) employee_shifts
- Fields: `user` (ref), `shift` (ref), `start_date`, `end_date?`, timestamps
- Indexes: compound `{ user: 1, start_date: 1, end_date: 1 }`
- ER: `employee_shifts.user -> users._id`, `employee_shifts.shift -> shifts._id`

6) attendance
- Fields: `user` (ref), `att_date` (Date-only), `status` ('P'|'A'|'L'|'H'), `check_in?` (Date), `check_out?` (Date), `hours_worked` (Number), timestamps
- Indexes: unique compound `{ user: 1, att_date: 1 }`
- ER: `attendance.user -> users._id`

7) salary_templates
- Fields: `user` (ref, unique), `basic_salary` (Number), `allowance_fixed` (Number), `allowance_percent` (Number), `deduction_fixed` (Number), `deduction_percent` (Number), `effective_from` (Date), timestamps
- Indexes: unique `{ user: 1 }`
- ER: `salary_templates.user -> users._id`

8) payroll_runs
- Fields: `user` (ref), `period_year` (Number), `period_month` (1..12), `working_days` (Number), `present_days` (Number), `overtime_hours` (Number), `basic_salary` (Number), `total_allowances` (Number), `total_deductions` (Number), `gross_pay` (Number), `net_pay` (Number), `generated_at` (Date default now), `notes?` (String), timestamps
- Indexes: unique compound `{ user: 1, period_year: 1, period_month: 1 }`
- ER: `payroll_runs.user -> users._id`

## Relationships Summary
- departments 1..* designations (via `designation.department`)
- departments 1..* users (via `users.department`)
- designations 1..* users (via `users.designation`)
- users 1..* employee_shifts (via `employee_shifts.user`)
- shifts 1..* employee_shifts (via `employee_shifts.shift`)
- users 1..* attendance (via `attendance.user`)
- users 1..1 salary_templates (via `salary_templates.user`)
- users 1..* payroll_runs (via `payroll_runs.user`)

## Notes
- All schemas include `timestamps: true` for `createdAt` and `updatedAt`.
- Unique and compound indexes are declared as per above.

## How to test quickly
- Example: list departments
```
curl http://localhost:3000/api/departments
```
- Example: get user by id
```
curl http://localhost:3000/api/users/<userId>
```

