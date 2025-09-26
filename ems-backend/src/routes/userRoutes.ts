import { Router } from 'express';
import { createUser, listUsers, getUser, updateUser, deleteUser } from '../controllers/userController';
import { authRequired } from '../middleware/auth';

const router = Router();

router.get('/', listUsers);
router.get('/:id', getUser);
router.post('/', authRequired, createUser);
router.put('/:id', authRequired, updateUser);
router.delete('/:id', authRequired, deleteUser);

export default router;
