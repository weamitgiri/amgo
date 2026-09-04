# Payments — Razorpay + Cash on Delivery

Production-oriented notes for the payment module. Architecture first, then the
steps needed to go live.

## Where things live

Checkout runs in the **Node API**, because that is where the booking flow
already lives (`organizerController.completeBooking`). The **Laravel admin**
owns reporting and settlement. Both read the same MySQL database.

```
React checkout ──▶ Node API ──▶ Razorpay
                      │
                      ▼
                 payments table  ◀── Laravel admin (dashboard, reports, COD settlement)
                      ▲
Razorpay webhook ─────┘
```

| Concern | Lives in |
| --- | --- |
| Payment method catalogue | `apis/src/services/paymentService.ts` |
| Razorpay REST + HMAC | `apis/src/config/razorpay.ts` |
| Order creation / checkout | `apis/src/controllers/organizerController.ts` |
| Signature verification | `apis/src/controllers/paymentController.ts` |
| Webhook receiver | `apis/src/controllers/razorpayWebhookController.ts` |
| Admin ledger + reports | `app/Http/Controllers/Admin/Payment*Controller.php` |
| Schema | `database/migrations/2026_08_19_0000*` |

## Configuration

Credentials come from the environment only — never the database, never the
browser.

> **Checkout runs in the Node API, so `apis/.env` is the file that matters.**
> Putting credentials only in the root `.env` leaves checkout showing
> "Online payment is currently unavailable" — Laravel never sees a checkout
> request. Keep both in sync; the root copy is what the admin Settings screen
> reads to display the active mode.

Two styles are supported. **Mode switch** (recommended — going live is a
one-word change):

```env
RAZORPAY_MODE=TEST            # TEST / LIVE
RAZORPAY_TEST_KEY=rzp_test_xxxxxxxxxxxx
RAZORPAY_TEST_SECRET=xxxxxxxxxxxxxxxx
RAZORPAY_LIVE_KEY=rzp_live_xxxxxxxxxxxx
RAZORPAY_LIVE_SECRET=xxxxxxxxxxxxxxxx
RAZORPAY_TEST_WEBHOOK_SECRET=xxxxxxxxxxxxxxxx
RAZORPAY_LIVE_WEBHOOK_SECRET=xxxxxxxxxxxxxxxx
```

Or the **single pair**, where the mode is inferred from the key prefix:

```env
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=xxxxxxxxxxxxxxxx
```

When `RAZORPAY_MODE` is set, the matching pair wins and the single pair is the
fallback. If the resolved key's prefix contradicts `RAZORPAY_MODE` — say
`MODE=LIVE` but only test keys are populated — checkout refuses to transact
rather than quietly charging on the wrong account.

Razorpay issues a **separate webhook secret per mode**. The mode-specific
variables take precedence; `RAZORPAY_WEBHOOK_SECRET` is the fallback.

`RAZORPAY_WEBHOOK_SECRET` is the secret shown when you create the webhook in the
Razorpay Dashboard. It is **not** the API key secret — reusing the key secret
makes every webhook signature check fail.

Leaving `RAZORPAY_KEY_ID`/`RAZORPAY_KEY_SECRET` blank disables Razorpay at
checkout rather than rendering a button that errors on click.

Going live is an env change only: swap `rzp_test_*` for `rzp_live_*`, set the
live webhook secret, restart the API. No code changes.

## Webhook

Register in Razorpay Dashboard → Settings → Webhooks:

```
URL:    https://<api-host>/v1/webhooks/razorpay
Events: payment.captured, payment.failed, order.paid
```

`refund.created`, `refund.processed` and `refund.failed` are already handled if
you enable them later.

The webhook — not the browser callback — is the authoritative completion
signal, since a customer can close the tab before the callback fires. It is
idempotent: every delivery's `x-razorpay-event-id` is claimed under a unique key
in `payment_webhook_events` before any work happens, so redeliveries are no-ops.

## Admin

`Payments` in the sidebar (seeded by `PaymentMenuSeeder`):

- **Dashboard** — revenue, gateway split, 14-day trend, recent payments
- **All / Razorpay / COD / Failed / Refunded** — the same ledger under presets
- **Payment Reports** — grouped by day, month, gateway or status, with CSV export

Filters are server-side and live in the URL, so a filtered view is shareable and
Export CSV returns exactly what is on screen.

**COD settlement** is the only write: Payments → open a pending COD payment →
*Mark COD Payment as Paid*. Razorpay payments cannot be edited by hand — their
state belongs to the gateway.

`Settings → Payment` controls whether each method is offered, the COD floor and
ceiling, and which Razorpay instruments to advertise. Credentials are shown
masked and read-only.

## Deploying

```bash
php artisan migrate
php artisan db:seed --class=PaymentMenuSeeder   # idempotent
cd apis && npm run build && <restart the API>
```

## Money-safety properties

These are the invariants the implementation is built around:

- The payable amount is always recomputed from the package price. Nothing about
  pricing is read from the request.
- Signature verification is followed by re-fetching the payment from Razorpay
  and checking its amount and order linkage. A valid signature alone is not
  treated as proof of payment.
- Settlement is idempotent under a row lock. The checkout callback, the webhook
  and an admin settling COD all funnel through `settlePayment`, so a booking is
  activated — and its invitation link generated — exactly once. Regenerating the
  link would invalidate invitations already sent to participants.
- A capture whose amount does not match the local record is recorded as failed
  and activates nothing.
- A late `payment.failed` cannot un-pay an already-captured payment.
- Only the Razorpay key id ever reaches the browser.

## Security note — rotate the old credentials

`GET /v1/public/settings` previously returned every row of the `settings` table
with no filter, and that table held `razorpay_key_secret`, `smtp_password` and
`smtp_username`. The endpoint is now allowlisted and the gateway credentials
have been removed from the table, but anything that was stored there should be
considered exposed:

- **Rotate the Razorpay key** that was in the database (`rzp_test_kiOtejPbRZU90E`)
  and set the new one in `apis/.env`.
- **Rotate the SMTP password**, which was served by the same endpoint.
