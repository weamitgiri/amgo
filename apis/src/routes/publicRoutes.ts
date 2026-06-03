import { Router } from 'express';
import * as publicController from '../controllers/publicController';

const router = Router();

// Packages API
router.get('/packages', publicController.getPackages);

// CMS Pages API
router.get('/cms', publicController.getCmsPages);
router.get('/cms/:slug', publicController.getCmsPageBySlug);

// Settings API
router.get('/settings', publicController.getSettings);

// Games/Activities API
router.get('/games', publicController.getGames);
router.get('/games/:id', publicController.getGameDetails);

export default router;
