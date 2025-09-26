import { Router } from 'express';
import {
  createAttendance,
  listAttendance,
  getAttendance,
  updateAttendance,
  deleteAttendance,
  checkIn,
  checkOut,
} from '../controllers/attendanceController';
import { authRequired } from '../middleware/auth';

const router = Router();

router.get('/', listAttendance);
router.get('/:id', getAttendance);
router.post('/', authRequired, createAttendance);
router.put('/:id', authRequired, updateAttendance);
router.delete('/:id', authRequired, deleteAttendance);
router.post('/check-in', authRequired, checkIn);
router.post('/check-out', authRequired, checkOut);

export default router;
