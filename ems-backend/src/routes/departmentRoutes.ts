import { Router } from 'express';
import {
  createDepartment,
  listDepartments,
  getDepartment,
  updateDepartment,
  deleteDepartment,
} from '../controllers/departmentController';
import { authRequired } from '../middleware/auth';

const router = Router();

router.get('/', listDepartments);
router.get('/:id', getDepartment);
router.post('/', authRequired, createDepartment);
router.put('/:id', authRequired, updateDepartment);
router.delete('/:id', authRequired, deleteDepartment);

export default router;
