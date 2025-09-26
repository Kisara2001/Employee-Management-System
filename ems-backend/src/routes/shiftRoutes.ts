import { Router } from 'express';
import { createShift, listShifts, getShift, updateShift, deleteShift } from '../controllers/shiftController';
import { authRequired } from '../middleware/auth';

const router = Router();

router.get('/', listShifts);
router.get('/:id', getShift);
router.post('/', authRequired, createShift);
router.put('/:id', authRequired, updateShift);
router.delete('/:id', authRequired, deleteShift);

export default router;
