import { Router } from 'express';
import { generate, list, getOne, update, remove } from '../controllers/payrollController';
import { authRequired } from '../middleware/auth';

const router = Router();

router.get('/', list);
router.get('/:id', getOne);
router.post('/generate', authRequired, generate);
router.put('/:id', authRequired, update);
router.delete('/:id', authRequired, remove);

export default router;
