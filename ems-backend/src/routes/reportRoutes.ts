import { Router } from 'express';
import {
  attendanceDaily,
  attendanceRange,
  attendanceSummary,
  attendanceLate,
  shiftsCoverage,
  shiftsRoster,
  payrollSummary,
  payrollPayslip,
  salaryDepartmentCost,
  overtimeReport,
  headcount,
  employeeProfile,
} from '../controllers/reportController';

const router = Router();

router.get('/attendance/daily', attendanceDaily);
router.get('/attendance/range', attendanceRange);
router.get('/attendance/summary', attendanceSummary);
router.get('/attendance/late', attendanceLate);
router.get('/shifts/coverage', shiftsCoverage);
router.get('/shifts/roster', shiftsRoster);
router.get('/payroll/summary', payrollSummary);
router.get('/payroll/payslip', payrollPayslip);
router.get('/salary/department-cost', salaryDepartmentCost);
router.get('/overtime', overtimeReport);
router.get('/headcount', headcount);
router.get('/employees/profile', employeeProfile);

export default router;
