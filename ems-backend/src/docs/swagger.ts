import swaggerUi from 'swagger-ui-express';
import { Router } from 'express';

const openapi: any = {
  openapi: '3.0.3',
  info: {
    title: 'EMS Quickstart API',
    version: '1.0.0',
    description: 'Employee Management System API (Express + Mongoose)'
  },
  servers: [
    { url: '/api', description: 'API base' },
    { url: '/', description: 'Root (health)' }
  ],
  tags: [
    { name: 'Auth' },
    { name: 'Users' },
    { name: 'Departments' },
    { name: 'Designations' },
    { name: 'Shifts' },
    { name: 'EmployeeShifts' },
    { name: 'Attendance' },
    { name: 'SalaryTemplates' },
    { name: 'Payroll' },
    { name: 'Reports' },
    { name: 'Dashboard' },
    { name: 'Health' }
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
    },
    schemas: {
      PaginationMeta: {
        type: 'object',
        properties: { total: { type: 'integer' }, page: { type: 'integer' }, limit: { type: 'integer' }, pages: { type: 'integer' } }
      },
      ErrorResponse: {
        type: 'object',
        properties: { message: { type: 'string' }, details: { nullable: true } }
      },
      Department: {
        type: 'object',
        properties: { _id: { type: 'string' }, name: { type: 'string' }, description: { type: 'string' } }
      },
      Designation: {
        type: 'object',
        properties: { _id: { type: 'string' }, department: { type: 'string' }, title: { type: 'string' }, level: { type: 'string' } }
      },
      User: {
        type: 'object',
        properties: {
          _id: { type: 'string' }, employee_code: { type: 'string' }, first_name: { type: 'string' }, last_name: { type: 'string' },
          email: { type: 'string' }, phone: { type: 'string' }, department: { type: 'string' }, designation: { type: 'string' },
          hire_date: { type: 'string', format: 'date-time' }, employment_status: { type: 'string' }, role: { type: 'string' }
        }
      },
      Shift: {
        type: 'object',
        properties: { _id: { type: 'string' }, name: { type: 'string' }, start_time: { type: 'string' }, end_time: { type: 'string' }, break_minutes: { type: 'integer' } }
      },
      EmployeeShift: {
        type: 'object',
        properties: { _id: { type: 'string' }, user: { type: 'string' }, shift: { type: 'string' }, start_date: { type: 'string', format: 'date-time' }, end_date: { type: 'string', format: 'date-time' } }
      },
      Attendance: {
        type: 'object',
        properties: { _id: { type: 'string' }, user: { type: 'string' }, att_date: { type: 'string', format: 'date-time' }, status: { type: 'string' }, check_in: { type: 'string', format: 'date-time' }, check_out: { type: 'string', format: 'date-time' }, hours_worked: { type: 'number' } }
      },
      SalaryTemplate: {
        type: 'object',
        properties: { _id: { type: 'string' }, user: { type: 'string' }, basic_salary: { type: 'number' }, allowance_fixed: { type: 'number' }, allowance_percent: { type: 'number' }, deduction_fixed: { type: 'number' }, deduction_percent: { type: 'number' }, effective_from: { type: 'string', format: 'date-time' } }
      },
      PayrollRun: {
        type: 'object',
        properties: { _id: { type: 'string' }, user: { type: 'string' }, period_year: { type: 'integer' }, period_month: { type: 'integer' }, working_days: { type: 'integer' }, present_days: { type: 'integer' }, overtime_hours: { type: 'number' }, basic_salary: { type: 'number' }, total_allowances: { type: 'number' }, total_deductions: { type: 'number' }, gross_pay: { type: 'number' }, net_pay: { type: 'number' }, generated_at: { type: 'string', format: 'date-time' }, notes: { type: 'string' } }
      },
      LoginRequest: { type: 'object', required: ['email', 'password'], properties: { email: { type: 'string' }, password: { type: 'string' } } },
      TokenResponse: { type: 'object', properties: { token: { type: 'string' }, user: { $ref: '#/components/schemas/User' } } }
    }
  },
  paths: {
    // Health
    '/health': {
      get: { tags: ['Health'], summary: 'Health check', responses: { '200': { description: 'OK' } } }
    },

    // Auth
    '/auth/login': {
      post: {
        tags: ['Auth'], summary: 'Login',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } } } },
        responses: { '200': { description: 'JWT token', content: { 'application/json': { schema: { $ref: '#/components/schemas/TokenResponse' } } } } }
      }
    },
    '/auth/me': {
      get: { tags: ['Auth'], summary: 'Current user', security: [{ bearerAuth: [] }], responses: { '200': { description: 'User' } } }
    },

    // Users
    '/users': {
      get: { tags: ['Users'], summary: 'List users', parameters: [
        { name: 'page', in: 'query', schema: { type: 'integer' } },
        { name: 'limit', in: 'query', schema: { type: 'integer' } },
        { name: 'departmentId', in: 'query', schema: { type: 'string' } },
        { name: 'designationId', in: 'query', schema: { type: 'string' } },
        { name: 'status', in: 'query', schema: { type: 'string' } },
        { name: 'q', in: 'query', schema: { type: 'string' } }
      ], responses: { '200': { description: 'List' } } },
      post: { tags: ['Users'], summary: 'Create user', security: [{ bearerAuth: [] }], requestBody: { required: true }, responses: { '201': { description: 'Created' } } }
    },
    '/users/{id}': {
      get: { tags: ['Users'], summary: 'Get user', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'User' }, '404': { description: 'Not found' } } },
      put: { tags: ['Users'], summary: 'Update user', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], requestBody: { required: true }, responses: { '200': { description: 'Updated' } } },
      delete: { tags: ['Users'], summary: 'Soft delete user', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Inactivated' } } }
    },

    // Departments
    '/departments': {
      get: { tags: ['Departments'], summary: 'List departments', responses: { '200': { description: 'List' } } },
      post: { tags: ['Departments'], summary: 'Create department', security: [{ bearerAuth: [] }], requestBody: { required: true }, responses: { '201': { description: 'Created' } } }
    },
    '/departments/{id}': {
      get: { tags: ['Departments'], summary: 'Get department', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Item' } } },
      put: { tags: ['Departments'], summary: 'Update department', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], requestBody: { required: true }, responses: { '200': { description: 'Updated' } } },
      delete: { tags: ['Departments'], summary: 'Delete department', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Deleted' } } }
    },

    // Designations
    '/designations': {
      get: { tags: ['Designations'], summary: 'List designations', parameters: [{ name: 'departmentId', in: 'query', schema: { type: 'string' } }], responses: { '200': { description: 'List' } } },
      post: { tags: ['Designations'], summary: 'Create designation', security: [{ bearerAuth: [] }], requestBody: { required: true }, responses: { '201': { description: 'Created' } } }
    },
    '/designations/{id}': {
      get: { tags: ['Designations'], summary: 'Get designation', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Item' } } },
      put: { tags: ['Designations'], summary: 'Update designation', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], requestBody: { required: true }, responses: { '200': { description: 'Updated' } } },
      delete: { tags: ['Designations'], summary: 'Delete designation', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Deleted' } } }
    },

    // Shifts
    '/shifts': {
      get: { tags: ['Shifts'], summary: 'List shifts', responses: { '200': { description: 'List' } } },
      post: { tags: ['Shifts'], summary: 'Create shift', security: [{ bearerAuth: [] }], requestBody: { required: true }, responses: { '201': { description: 'Created' } } }
    },
    '/shifts/{id}': {
      get: { tags: ['Shifts'], summary: 'Get shift', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Item' } } },
      put: { tags: ['Shifts'], summary: 'Update shift', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], requestBody: { required: true }, responses: { '200': { description: 'Updated' } } },
      delete: { tags: ['Shifts'], summary: 'Delete shift', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Deleted' } } }
    },

    // Employee Shifts
    '/employee-shifts': {
      get: { tags: ['EmployeeShifts'], summary: 'List employee shifts', responses: { '200': { description: 'List' } } },
      post: { tags: ['EmployeeShifts'], summary: 'Create employee shift', security: [{ bearerAuth: [] }], requestBody: { required: true }, responses: { '201': { description: 'Created' } } }
    },
    '/employee-shifts/{id}': {
      get: { tags: ['EmployeeShifts'], summary: 'Get employee shift', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Item' } } },
      put: { tags: ['EmployeeShifts'], summary: 'Update employee shift', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], requestBody: { required: true }, responses: { '200': { description: 'Updated' } } },
      delete: { tags: ['EmployeeShifts'], summary: 'Delete employee shift', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Deleted' } } }
    },

    // Attendance
    '/attendance': {
      get: { tags: ['Attendance'], summary: 'List attendance', parameters: [
        { name: 'userId', in: 'query', schema: { type: 'string' } },
        { name: 'from', in: 'query', schema: { type: 'string' } },
        { name: 'to', in: 'query', schema: { type: 'string' } }
      ], responses: { '200': { description: 'List' } } },
      post: { tags: ['Attendance'], summary: 'Create attendance', security: [{ bearerAuth: [] }], requestBody: { required: true }, responses: { '201': { description: 'Created' } } }
    },
    '/attendance/{id}': {
      get: { tags: ['Attendance'], summary: 'Get attendance', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Item' } } },
      put: { tags: ['Attendance'], summary: 'Update attendance', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], requestBody: { required: true }, responses: { '200': { description: 'Updated' } } },
      delete: { tags: ['Attendance'], summary: 'Delete attendance', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Deleted' } } }
    },
    '/attendance/check-in': { post: { tags: ['Attendance'], summary: 'Check in', security: [{ bearerAuth: [] }], requestBody: { required: true }, responses: { '200': { description: 'OK' } } } },
    '/attendance/check-out': { post: { tags: ['Attendance'], summary: 'Check out', security: [{ bearerAuth: [] }], requestBody: { required: true }, responses: { '200': { description: 'OK' } } } },

    // Salary Templates
    '/salary-templates': {
      get: { tags: ['SalaryTemplates'], summary: 'List salary templates', parameters: [{ name: 'userId', in: 'query', schema: { type: 'string' } }], responses: { '200': { description: 'List' } } },
      post: { tags: ['SalaryTemplates'], summary: 'Upsert salary template', security: [{ bearerAuth: [] }], requestBody: { required: true }, responses: { '200': { description: 'Upserted' } } },
      put: { tags: ['SalaryTemplates'], summary: 'Upsert salary template', security: [{ bearerAuth: [] }], requestBody: { required: true }, responses: { '200': { description: 'Upserted' } } }
    },
    '/salary-templates/{userId}': {
      get: { tags: ['SalaryTemplates'], summary: 'Get by user', parameters: [{ name: 'userId', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Item' } } },
      delete: { tags: ['SalaryTemplates'], summary: 'Delete by user', security: [{ bearerAuth: [] }], parameters: [{ name: 'userId', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Deleted' } } }
    },

    // Payroll
    '/payroll': {
      get: { tags: ['Payroll'], summary: 'List payroll runs', parameters: [
        { name: 'userId', in: 'query', schema: { type: 'string' } },
        { name: 'year', in: 'query', schema: { type: 'integer' } },
        { name: 'month', in: 'query', schema: { type: 'integer' } }
      ], responses: { '200': { description: 'List' } } }
    },
    '/payroll/{id}': {
      get: { tags: ['Payroll'], summary: 'Get payroll run', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Item' } } },
      put: { tags: ['Payroll'], summary: 'Update payroll run', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], requestBody: { required: true }, responses: { '200': { description: 'Updated' } } },
      delete: { tags: ['Payroll'], summary: 'Delete payroll run', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Deleted' } } }
    },
    '/payroll/generate': {
      post: { tags: ['Payroll'], summary: 'Generate payroll', security: [{ bearerAuth: [] }], requestBody: { required: true }, responses: { '200': { description: 'Generated' } } }
    },

    // Reports
    '/reports/attendance/daily': {
      get: { tags: ['Reports'], summary: 'Attendance daily', parameters: [
        { name: 'date', in: 'query', required: true, schema: { type: 'string' } },
        { name: 'departmentId', in: 'query', schema: { type: 'string' } },
        { name: 'designationId', in: 'query', schema: { type: 'string' } },
        { name: 'format', in: 'query', schema: { type: 'string', enum: ['json', 'csv', 'pdf'] } }
      ], responses: { '200': { description: 'Report' } } }
    },
    '/reports/attendance/range': {
      get: { tags: ['Reports'], summary: 'Attendance range', parameters: [
        { name: 'userId', in: 'query', schema: { type: 'string' } },
        { name: 'departmentId', in: 'query', schema: { type: 'string' } },
        { name: 'from', in: 'query', required: true, schema: { type: 'string' } },
        { name: 'to', in: 'query', required: true, schema: { type: 'string' } },
        { name: 'format', in: 'query', schema: { type: 'string', enum: ['json', 'csv', 'pdf'] } }
      ], responses: { '200': { description: 'Report' } } }
    },
    '/reports/attendance/summary': {
      get: { tags: ['Reports'], summary: 'Attendance summary', parameters: [
        { name: 'year', in: 'query', required: true, schema: { type: 'integer' } },
        { name: 'month', in: 'query', required: true, schema: { type: 'integer' } },
        { name: 'departmentId', in: 'query', schema: { type: 'string' } },
        { name: 'format', in: 'query', schema: { type: 'string', enum: ['json', 'csv', 'pdf'] } }
      ], responses: { '200': { description: 'Report' } } }
    },
    '/reports/attendance/late': {
      get: { tags: ['Reports'], summary: 'Late arrivals', parameters: [
        { name: 'year', in: 'query', required: true, schema: { type: 'integer' } },
        { name: 'month', in: 'query', required: true, schema: { type: 'integer' } },
        { name: 'graceMinutes', in: 'query', schema: { type: 'integer' } },
        { name: 'departmentId', in: 'query', schema: { type: 'string' } },
        { name: 'format', in: 'query', schema: { type: 'string', enum: ['json', 'csv', 'pdf'] } }
      ], responses: { '200': { description: 'Report' } } }
    },
    '/reports/shifts/coverage': {
      get: { tags: ['Reports'], summary: 'Shift coverage', parameters: [
        { name: 'date', in: 'query', required: true, schema: { type: 'string' } },
        { name: 'departmentId', in: 'query', schema: { type: 'string' } },
        { name: 'format', in: 'query', schema: { type: 'string', enum: ['json', 'csv', 'pdf'] } }
      ], responses: { '200': { description: 'Report' } } }
    },
    '/reports/shifts/roster': {
      get: { tags: ['Reports'], summary: 'Shift roster', parameters: [
        { name: 'from', in: 'query', required: true, schema: { type: 'string' } },
        { name: 'to', in: 'query', required: true, schema: { type: 'string' } },
        { name: 'departmentId', in: 'query', schema: { type: 'string' } },
        { name: 'format', in: 'query', schema: { type: 'string', enum: ['json', 'csv', 'pdf'] } }
      ], responses: { '200': { description: 'Report' } } }
    },
    '/reports/payroll/summary': {
      get: { tags: ['Reports'], summary: 'Payroll summary', parameters: [
        { name: 'year', in: 'query', required: true, schema: { type: 'integer' } },
        { name: 'month', in: 'query', required: true, schema: { type: 'integer' } },
        { name: 'departmentId', in: 'query', schema: { type: 'string' } },
        { name: 'format', in: 'query', schema: { type: 'string', enum: ['json', 'csv', 'pdf'] } }
      ], responses: { '200': { description: 'Report' } } }
    },
    '/reports/payroll/payslip': {
      get: { tags: ['Reports'], summary: 'Payslip', parameters: [
        { name: 'userId', in: 'query', required: true, schema: { type: 'string' } },
        { name: 'year', in: 'query', required: true, schema: { type: 'integer' } },
        { name: 'month', in: 'query', required: true, schema: { type: 'integer' } },
        { name: 'format', in: 'query', schema: { type: 'string', enum: ['json', 'csv', 'pdf'] } }
      ], responses: { '200': { description: 'Report' } } }
    },
    '/reports/salary/department-cost': {
      get: { tags: ['Reports'], summary: 'Department salary cost', parameters: [
        { name: 'year', in: 'query', required: true, schema: { type: 'integer' } },
        { name: 'month', in: 'query', required: true, schema: { type: 'integer' } },
        { name: 'format', in: 'query', schema: { type: 'string', enum: ['json', 'csv', 'pdf'] } }
      ], responses: { '200': { description: 'Report' } } }
    },
    '/reports/overtime': {
      get: { tags: ['Reports'], summary: 'Overtime report', parameters: [
        { name: 'year', in: 'query', schema: { type: 'integer' } },
        { name: 'month', in: 'query', schema: { type: 'integer' } },
        { name: 'departmentId', in: 'query', schema: { type: 'string' } },
        { name: 'format', in: 'query', schema: { type: 'string', enum: ['json', 'csv', 'pdf'] } }
      ], responses: { '200': { description: 'Report' } } }
    },
    '/reports/headcount': {
      get: { tags: ['Reports'], summary: 'Headcount', parameters: [
        { name: 'departmentId', in: 'query', schema: { type: 'string' } },
        { name: 'format', in: 'query', schema: { type: 'string', enum: ['json', 'csv', 'pdf'] } }
      ], responses: { '200': { description: 'Report' } } }
    },
    '/reports/employees/profile': {
      get: { tags: ['Reports'], summary: 'Employee profile', parameters: [
        { name: 'userId', in: 'query', required: true, schema: { type: 'string' } },
        { name: 'format', in: 'query', schema: { type: 'string', enum: ['json', 'csv', 'pdf'] } }
      ], responses: { '200': { description: 'Profile' } } }
    },

    // Dashboard
    '/dashboard/kpis': {
      get: { tags: ['Dashboard'], summary: 'KPIs', parameters: [
        { name: 'date', in: 'query', schema: { type: 'string' } },
        { name: 'departmentId', in: 'query', schema: { type: 'string' } },
        { name: 'designationId', in: 'query', schema: { type: 'string' } }
      ], responses: { '200': { description: 'KPIs' } } }
    },
    '/dashboard/attendance/trend': {
      get: { tags: ['Dashboard'], summary: 'Attendance trend', parameters: [
        { name: 'from', in: 'query', required: true, schema: { type: 'string' } },
        { name: 'to', in: 'query', required: true, schema: { type: 'string' } },
        { name: 'departmentId', in: 'query', schema: { type: 'string' } }
      ], responses: { '200': { description: 'Series' } } }
    },
    '/dashboard/attendance/breakdown': {
      get: { tags: ['Dashboard'], summary: 'Attendance breakdown', parameters: [
        { name: 'date', in: 'query', required: true, schema: { type: 'string' } },
        { name: 'departmentId', in: 'query', schema: { type: 'string' } }
      ], responses: { '200': { description: 'Breakdown' } } }
    },
    '/dashboard/shifts/coverage': {
      get: { tags: ['Dashboard'], summary: 'Shift coverage', parameters: [
        { name: 'date', in: 'query', required: true, schema: { type: 'string' } },
        { name: 'departmentId', in: 'query', schema: { type: 'string' } }
      ], responses: { '200': { description: 'Coverage' } } }
    },
    '/dashboard/departments/headcount': {
      get: { tags: ['Dashboard'], summary: 'Departments headcount', responses: { '200': { description: 'Breakdown' } } }
    },
    '/dashboard/overtime/top': {
      get: { tags: ['Dashboard'], summary: 'Top overtime', parameters: [
        { name: 'year', in: 'query', schema: { type: 'integer' } },
        { name: 'month', in: 'query', schema: { type: 'integer' } },
        { name: 'limit', in: 'query', schema: { type: 'integer' } },
        { name: 'departmentId', in: 'query', schema: { type: 'string' } }
      ], responses: { '200': { description: 'List' } } }
    },
    '/dashboard/attendance/late': {
      get: { tags: ['Dashboard'], summary: 'Late attendance', parameters: [
        { name: 'year', in: 'query', schema: { type: 'integer' } },
        { name: 'month', in: 'query', schema: { type: 'integer' } },
        { name: 'graceMinutes', in: 'query', schema: { type: 'integer' } },
        { name: 'departmentId', in: 'query', schema: { type: 'string' } }
      ], responses: { '200': { description: 'List' } } }
    },
    '/dashboard/payroll/trend': {
      get: { tags: ['Dashboard'], summary: 'Payroll trend', parameters: [
        { name: 'year', in: 'query', required: true, schema: { type: 'integer' } },
        { name: 'departmentId', in: 'query', schema: { type: 'string' } }
      ], responses: { '200': { description: 'Series' } } }
    },
    '/dashboard/payroll/department': {
      get: { tags: ['Dashboard'], summary: 'Payroll by department', parameters: [
        { name: 'year', in: 'query', required: true, schema: { type: 'integer' } },
        { name: 'month', in: 'query', required: true, schema: { type: 'integer' } }
      ], responses: { '200': { description: 'Breakdown' } } }
    },
    '/dashboard/payroll/coverage': {
      get: { tags: ['Dashboard'], summary: 'Payroll coverage', parameters: [
        { name: 'year', in: 'query', required: true, schema: { type: 'integer' } },
        { name: 'month', in: 'query', required: true, schema: { type: 'integer' } }
      ], responses: { '200': { description: 'Coverage' } } }
    },
    '/dashboard/employee/{userId}/snapshot': {
      get: { tags: ['Dashboard'], summary: 'Employee snapshot', parameters: [
        { name: 'userId', in: 'path', required: true, schema: { type: 'string' } },
        { name: 'from', in: 'query', required: true, schema: { type: 'string' } },
        { name: 'to', in: 'query', required: true, schema: { type: 'string' } }
      ], responses: { '200': { description: 'Snapshot' } } }
    }
  }
};

export function mountSwagger(router: Router) {
  router.use('/docs', swaggerUi.serve, swaggerUi.setup(openapi));
}
