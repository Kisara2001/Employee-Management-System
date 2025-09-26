import { Router } from 'express';
import { upsertTemplate, listTemplates, getTemplateByUser, deleteTemplate } from '../controllers/salaryTemplateController';
import { authRequired } from '../middleware/auth';

const router = Router();

router.get('/', listTemplates);
router.get('/:userId', getTemplateByUser);
router.post('/', authRequired, upsertTemplate);
router.put('/', authRequired, upsertTemplate);
router.delete('/:userId', authRequired, deleteTemplate);

export default router;
