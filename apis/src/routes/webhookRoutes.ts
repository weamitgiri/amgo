import { Router } from 'express';
import { handleRazorpayWebhook } from '../controllers/razorpayWebhookController';

const router = Router();

/**
 * Gateway callbacks. Mounted outside the authenticated organizer routes because
 * the caller is Razorpay, not a logged-in user — authenticity comes from the
 * X-Razorpay-Signature HMAC, verified in the handler against the raw body.
 *
 * Configure as: POST https://<host>/v1/webhooks/razorpay
 * Active events: payment.captured, payment.failed, order.paid
 * (refund.created / refund.processed / refund.failed are handled if enabled.)
 */
router.post('/razorpay', handleRazorpayWebhook);

export default router;
