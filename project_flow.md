# EMS Project Flow

This document outlines core flows in the EMS application. Diagrams use Mermaid syntax.

## High-Level User Flow
```mermaid
flowchart TD
    A[Login] -->|POST /auth/login| B{Authenticated?}
    B -- Yes --> C[Dashboard]
    B -- No --> A

    C --> D[Employees]
    C --> E[Departments]
    C --> F[Designations]
    C --> G[Shifts]
    C --> H[Shift Assignments]
    C --> I[Attendance]
    C --> J[Salary Templates]
    C --> K[Payroll]
    C --> L[Reports]

    D --> D1[List GET /users]
    D --> D2[View GET /users/:id]
    D --> D3[Create POST /users]
    D --> D4[Edit PUT /users/:id]
    D --> D5[Delete DELETE /users/:id]

    I --> I1[List GET /attendance]
    I --> I2[Create POST /attendance]
    I --> I3[Edit PUT /attendance/:id]
    I --> I4[Delete DELETE /attendance/:id]
    I --> I5[Check-in/out]

    K --> K1[List GET /payroll]
    K --> K2[Generate POST /payroll/generate]

    L --> L1[Run report -> Download Excel]
```

## Authentication Sequence
```mermaid
sequenceDiagram
    actor U as User
    participant FE as Frontend (React)
    participant BE as Backend (Express)

    U->>FE: Submit email + password
    FE->>BE: POST /api/auth/login
    BE-->>FE: 200 { token, user }
    FE->>FE: save token to localStorage
    FE->>BE: GET /api/auth/me (on app init)
    BE-->>FE: 200 user | 401 invalid
```

## Create Employee Sequence
```mermaid
sequenceDiagram
    actor U as Admin
    participant FE as Frontend
    participant BE as Backend
    participant DB as MongoDB

    U->>FE: Fill new employee form
    FE->>BE: POST /api/users (Authorization: Bearer)
    BE->>DB: insert user (hash password)
    DB-->>BE: created user
    BE-->>FE: 201 user
    FE->>FE: toast + navigate to Employees
```

## Attendance Flow (Range & Check-in/Out)
```mermaid
sequenceDiagram
    participant FE
    participant BE
    participant DB

    FE->>BE: GET /api/attendance?from&to&userId
    BE->>DB: Find attendance by filters
    DB-->>BE: rows + count
    BE-->>FE: { data, meta }

    FE->>BE: POST /api/attendance/check-in { userId }
    BE->>DB: Upsert today record (status 'P', set check_in)
    DB-->>BE: record
    BE-->>FE: record

    FE->>BE: POST /api/attendance/check-out { userId }
    BE->>DB: Update today record (set check_out, compute hours)
    DB-->>BE: record
    BE-->>FE: record
```

## Reports Flow
```mermaid
sequenceDiagram
    participant FE
    participant BE

    FE->>BE: GET /api/reports/<path>?params (responseType: blob)
    BE-->>FE: 200 .xlsx (Content-Disposition filename)
    FE->>FE: trigger browser download
```

