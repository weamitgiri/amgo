import { Router } from 'express';
import * as publicController from '../controllers/publicController';
import * as paymentController from '../controllers/paymentController';
import * as activityMusicController from '../controllers/activityMusicController';

const router = Router();

// Packages API
router.get('/packages', publicController.getPackages);

// CMS Pages API
router.get('/cms', publicController.getCmsPages);
router.get('/cms/:slug', publicController.getCmsPageBySlug);

// Settings API
router.get('/settings', publicController.getSettings);

// Which payment methods checkout may offer, and the public Razorpay key id.
// Pass ?amount= to have COD limits applied to the result.
router.get('/payment-methods', paymentController.getPaymentMethods);

// Games/Activities API
router.get('/games', publicController.getGames);
router.get('/games/:id', publicController.getGameDetails);

// Background music (admin Music Manager): the activity's active track, or null.
router.get('/activities/:activity/music', activityMusicController.getActivityMusic);
router.get('/groups/:group_id/music', activityMusicController.getGroupMusic);

export default router;
