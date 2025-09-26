import { Router } from 'express';
import {
  createDesignation,
  listDesignations,
  getDesignation,
  updateDesignation,
  deleteDesignation,
} from '../controllers/designationController';
import { authRequired } from '../middleware/auth';

const router = Router();

router.get('/', listDesignations);
router.get('/:id', getDesignation);
router.post('/', authRequired, createDesignation);
router.put('/:id', authRequired, updateDesignation);
router.delete('/:id', authRequired, deleteDesignation);

export default router;
