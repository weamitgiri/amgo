import { Router } from 'express';
import * as publicController from '../controllers/publicController';
import * as paymentController from '../controllers/paymentController';

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

export default router;
