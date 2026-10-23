import { Router } from 'express';
import * as resultsController from '../controllers/resultsController';
import { participantAuth } from '../middlewares/participantAuth';

const router = Router();

router.get('/:group_id', participantAuth, resultsController.getGameResults);
router.get('/:group_id/pdf', resultsController.downloadResultsPdf);

export default router;
