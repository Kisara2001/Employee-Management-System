# EMS Requirements Specification (Summary)

This document captures the core business, functional, and non-functional requirements guiding the EMS implementation.

## 1. Vision & Goals
- Provide a modern, responsive Employee Management System with end-to-end HR workflows: organization, employees, attendance, shifts, payroll, and reporting.
- Support quick demos with public read endpoints while enforcing auth for mutations.
- Export reports to Excel for analysis and sharing.

## 2. Actors
- Admin: full control over master data and payroll actions.
- Employee: limited self-service (profile, attendance check-in/out, view payslips).

## 3. Functional Requirements
### 3.1 Authentication
- Login with email + password → JWT.
- Session restore via `/auth/me`.

### 3.2 Organization Setup
- Departments: CRUD.
- Designations: CRUD, linked to departments.

### 3.3 Employees
- Create/Update/Delete employee records with department/designation assignment.
- Soft delete policy by setting employment status to `INACTIVE`.
- List + filtering + search.

### 3.4 Shifts & Assignments
- Shifts: name, start/end times, break minutes.
- Employee shift assignments with date ranges.

### 3.5 Attendance
- Daily attendance with status `P|A|L|H`.
- Optional timestamps: check-in, check-out; hours computed.
- Filters by user and date range.
- Self-service endpoints for check-in/out.

### 3.6 Salary Templates & Payroll
- One salary template per user with fixed/percent allowances and deductions.
- Generate monthly payroll for all users or a specific user.
- List, view, update, and delete payroll runs.

### 3.7 Reports
- Attendance (daily, range, summary), shifts (coverage, roster), payroll (summary, payslip, department cost), headcount, employee profile.
- All reports export as Excel by default; JSON with `?format=json`.

### 3.8 Dashboard
- KPIs: active employees, present today.
- Attendance trend (last 30 days), department payroll breakdown, monthly payroll total.

## 4. Non-Functional Requirements
- Usability: responsive, accessible UI.
- Security: JWT auth, server-side validation, no sensitive data in logs.
- Performance: paginated lists, indexed queries, aggregation pipelines.
- Maintainability: TypeScript on frontend/backend, modular code structure, Swagger docs.
- Portability: ENV-driven configuration; Docker-ready.

## 5. Data & Integrations
- MongoDB schemas capture organization hierarchy, users, attendance, shifts, templates, and payroll.
- Excel exports powered by ExcelJS in the backend.

## 6. Constraints
- For demo, reads are public; writes require JWT.
- Overtime/late logic is placeholder; can be extended.

## 7. Acceptance Criteria (Samples)
- Admin can log in, create a department and designation, create an employee, assign a shift, record attendance, and generate payroll.
- Reports endpoints download an `.xlsx` file with correct headers and row counts.
- Dashboard displays non-zero values after running the bulk seeder.

