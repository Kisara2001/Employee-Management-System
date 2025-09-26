import { Router } from 'express';
import departmentRoutes from './departmentRoutes';
import designationRoutes from './designationRoutes';
import userRoutes from './userRoutes';
import shiftRoutes from './shiftRoutes';
import employeeShiftRoutes from './employeeShiftRoutes';
import attendanceRoutes from './attendanceRoutes';
import salaryTemplateRoutes from './salaryTemplateRoutes';
import payrollRoutes from './payrollRoutes';
import reportRoutes from './reportRoutes';
import dashboardRoutes from './dashboardRoutes';
import authRoutes from './authRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/departments', departmentRoutes);
router.use('/designations', designationRoutes);
router.use('/users', userRoutes);
router.use('/shifts', shiftRoutes);
router.use('/employee-shifts', employeeShiftRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/salary-templates', salaryTemplateRoutes);
router.use('/payroll', payrollRoutes);
router.use('/reports', reportRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;
