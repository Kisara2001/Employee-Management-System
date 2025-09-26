import { Router } from 'express';
import {
  kpis,
  attendanceTrend,
  attendanceBreakdown,
  shiftsCoverage,
  departmentsHeadcount,
  overtimeTop,
  attendanceLate,
  payrollTrend,
  payrollDepartment,
  payrollCoverage,
  employeeSnapshot,
} from '../controllers/dashboardController';

const router = Router();

router.get('/kpis', kpis);
router.get('/attendance/trend', attendanceTrend);
router.get('/attendance/breakdown', attendanceBreakdown);
router.get('/shifts/coverage', shiftsCoverage);
router.get('/departments/headcount', departmentsHeadcount);
router.get('/overtime/top', overtimeTop);
router.get('/attendance/late', attendanceLate);
router.get('/payroll/trend', payrollTrend);
router.get('/payroll/department', payrollDepartment);
router.get('/payroll/coverage', payrollCoverage);
router.get('/employee/:userId/snapshot', employeeSnapshot);

export default router;
