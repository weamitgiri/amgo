import { Router } from 'express';
import * as resultsController from '../controllers/resultsController';

const router = Router();

router.get('/:group_id', resultsController.getGameResults);
router.get('/:group_id/pdf', resultsController.downloadResultsPdf);

export default router;
