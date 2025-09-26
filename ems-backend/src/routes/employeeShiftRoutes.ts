import { Router } from 'express';
import {
  createEmployeeShift,
  listEmployeeShifts,
  getEmployeeShift,
  updateEmployeeShift,
  deleteEmployeeShift,
} from '../controllers/employeeShiftController';
import { authRequired } from '../middleware/auth';

const router = Router();

router.get('/', listEmployeeShifts);
router.get('/:id', getEmployeeShift);
router.post('/', authRequired, createEmployeeShift);
router.put('/:id', authRequired, updateEmployeeShift);
router.delete('/:id', authRequired, deleteEmployeeShift);

export default router;
