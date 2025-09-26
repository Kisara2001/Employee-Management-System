# Software Requirements Specification (SRS)

## 1. Introduction
### 1.1 Purpose
Define the functional and non-functional requirements for the EMS application.

### 1.2 Scope
A full-featured Employee Management System with authentication, organizational management, attendance tracking, shift scheduling, payroll, and reporting.

### 1.3 Definitions
- EMS: Employee Management System
- JWT: JSON Web Token
- CRUD: Create, Read, Update, Delete

## 2. Overall Description
### 2.1 Product Perspective
- Frontend SPA (React) consumes REST API (Express).
- MongoDB stores core domain entities.

### 2.2 Product Functions
- Authentication (login, session restore)
- Departments & Designations management
- Employees CRUD with soft-deletion
- Shifts & Employee shift assignments
- Attendance tracking (status + timestamps)
- Salary templates & Payroll generation
- Reports (Excel)
- Dashboard analytics

### 2.3 User Classes
- Admin, Employee

### 2.4 Operating Environment
- Node.js 18+, MongoDB 6+, modern browsers

### 2.5 Design & Implementation Constraints
- ENV-driven configuration; CORS constraints
- Public reads in demo; writes protected

## 3. External Interface Requirements
### 3.1 User Interface
- Responsive web UI; shadcn/ui components
- Navigation sidebar + dashboard widgets

### 3.2 API Interfaces
- Base URL: `/api`
- Swagger UI at `/docs`
- Auth: Bearer JWT

### 3.3 Hardware
- Commodity server; scale horizontally with stateless API

## 4. System Features (Selected)
### 4.1 Authentication
- Login: `POST /auth/login` → `{ token, user }`
- Session: `GET /auth/me` (JWT)

### 4.2 Employees
- List: `GET /users?page&limit&q&...`
- Create: `POST /users` (JWT)
- View: `GET /users/:id`
- Update: `PUT /users/:id` (JWT)
- Delete: `DELETE /users/:id` (JWT) → INACTIVE

### 4.3 Attendance
- List: `GET /attendance?userId&from&to`
- Create: `POST /attendance` (JWT)
- Update: `PUT /attendance/:id` (JWT)
- Delete: `DELETE /attendance/:id` (JWT)
- Check-in/out: `POST /attendance/check-in|check-out` (JWT)

### 4.4 Payroll
- Generate: `POST /payroll/generate` (JWT)
- List: `GET /payroll?year&month&userId`
- Update: `PUT /payroll/:id` (JWT)
- Delete: `DELETE /payroll/:id` (JWT)

### 4.5 Reports
- Excel by default; JSON via `?format=json`
- Attendance, Shifts, Payroll, Headcount, Profile

## 5. Nonfunctional Requirements
- Security: JWT, input validation, sanitized responses
- Performance: pagination, indexes, aggregation pipelines
- Reliability: idempotent seeds; error handling
- Maintainability: modular TS code; linting; docs
- Portability: Docker support

## 6. Data Requirements
- See `database.md` for collection schemas and indexes.
- Data integrity constraints around attendance uniqueness and payroll period uniqueness.

## 7. Other Requirements
- Seed scripts for demo and bulk datasets
- Environment-specific CORS origins

