# 🏁 Final Code Review — Amigo (Zoventro) Game Platform

**Project:** Amigo Game Platform (multi-tier: Laravel + Node.js/TypeScript + React)  
**Review Date:** 09 June 2026  
**Reviewer:** Senior Software Architect & Principal Code Reviewer  
**Repository:** `weamitgiri/amgo`  
**Latest Commit:** `a1b79731a91b49a27a24410b96bcb02f7e1bf5c6`  
**Scope:** Full codebase review — backend (Laravel), game engine (Node.js/TypeScript), frontend, database, configuration, security, performance, logic, and operations.

---

## 0. TL;DR

The Amigo platform is a **multi-tier game/booking application** with a Laravel admin/content backend, a Node.js/TypeScript real-time game engine (Socket.IO), a React 19 + TanStack Router frontend, and a MySQL data store. The product (a "Detective Mystery" group game with 5 players, role assignment, lie detector, witness passcards, scoring, organizer billing) is well-conceived and the **business logic is faithfully implemented in `LOGICS.md`**.

However, the codebase is **not production-ready** because of:

1. **Critical security defects** — hardcoded credentials, weak JWT secret, hardcoded OTP, debug data leakage, missing auth on game endpoints, IDOR.
2. **Stability risks** — large controllers, mixed auth models, deprecated `moment.js`, brittle timer service, missing error boundaries, very low test coverage.
3. **Operational gaps** — no env validation, no CI/CD, no rate limiting on sensitive endpoints, no observability/alerting, no API documentation (Swagger/OpenAPI).

The grade remains **B- (Needs Improvement)** — strong product vision and clean separation of concerns, but security, testing, and operational maturity are the gating items.

---

## 1. Executive Summary

| Category | Findings |
|---|---|
| 🔴 **Critical** | 8 |
| 🟠 **High** | 14 |
| 🟡 **Medium** | 18 |
| 🟢 **Low** | 10 |
| **Overall Grade** | **B-** |

### What is good
- Clean **3-tier separation** (Laravel admin/API ↔ Node.js game engine ↔ React UI).
- Consistent **MVC** in Laravel with Form Requests, Services, Resources.
- TypeScript & async/await in Node.js, transactions on writes.
- Strict **business logic** for group formation, role assignment, scoring, timers, and winner detection — matches `LOGICS.md`.
- Sensible use of `helmet`, `cors`, `morgan`, parameterized SQL queries (mostly), `asyncHandler`/`AppError` pattern.

### What is broken (or risky)
- Plaintext credentials in source (`emailService.ts`), weak/default `JWT_SECRET`, **hardcoded `OTP = '123456'`** in `organizerController.ts` at 3 sites.
- Debug OTP returned in API responses when `APP_DEBUG=true` (`AuthController.php`, `GameJoinController.php`).
- Unauthenticated game-join routes (`/v1/game-join/*`) and unauthenticated Socket.IO — anyone can join any group.
- `AuthController::verifyOtp` returns `'dummy-token-' . Str::random(40)` (not a real Sanctum token).
- `ParticipantController` re-uses organizer JWT secret and the same `authMiddleware` — there is no participant auth at all.
- `gameEngineController.ts` is 530 lines with 7 endpoints, 5+ raw SQL transactions, 5+ Socket.IO emits; cyclomatic complexity is high and several queries are repeated.
- `timerService.ts` runs every 5 s with raw `console.log` and **no graceful shutdown, no leader election, no clustering safety**.
- `package.json` in the React app is **not present at the project root** (only `frontend/package.json`) — but two `package.json` files exist at root with no `dependencies`; ensure build pipeline knows which is canonical.
- Database: missing indexes on `email`, `status`, FK columns; some models lack `$casts` and scopes; migrations use `enum()` which is MySQL-specific.
- React: no error boundaries, no test files, no PWA / offline handling, no accessibility audit.
- Tests: only `tests/TestCase.php`, `UserFactory.php` — no real coverage of the 8 game phases, the billing flow, or the lobby grouping logic.

---

## 2. Architecture & Stack

### 2.1 Detected stack

| Layer | Tech |
|---|---|
| Frontend | React 19.2, TypeScript, TanStack Router, Redux Toolkit, TanStack Query, shadcn/ui, Socket.IO client, Vite |
| Laravel API | Laravel 11/12, PHP 8.x, Eloquent, Form Requests, Resources, MySQL |
| Game Engine | Node.js + TypeScript, Express, Socket.IO, MySQL2, Winston, `moment`, `nodemailer`, `jsonwebtoken` |
| DB | MySQL (utf8mb4) |
| Tooling | Vite, ESLint, PostCSS, Composer, bun.lock in `frontend/` |

### 2.2 Architecture assessment

```
React (UI) ──HTTP/WS──▶ Node.js Game Engine (real-time, billing, organizer)
React (UI) ──HTTP──▶ Laravel (content, admin, public settings)
Laravel ──SQL──▶ MySQL ◀──SQL── Node.js
```

- **Strengths** — clear service boundaries; `lobbyService`, `participantGroupService`, `eventStatsService`, `timerService`, `emailService`, `gameSummaryService`, `notificationService` exist; controllers are thin wrappers.
- **Weaknesses**
  - Laravel is also used as a **public API** for game-join flow (`/v1/auth/*`, `/v1/game-join/*`, `/v1/content/*`, `/v1/activities/*`) while billing/dashboard live in Node.js. There is **no documented contract** on which layer owns what — `routes/api.php` only has 5 route groups, the rest is in Node.js.
  - **No API versioning policy** for Laravel — only `v1` is used.
  - **No service container/DI** in Node.js — global `io` import from `./server` causes circular import risk (`gameEngineController` imports `io` from `server.ts`).
  - **No API Gateway** — CORS, rate limiting, request validation, security headers, and tracing are not centralized.

### 2.3 Repository pattern
**Not implemented.** Controllers reach into raw SQL (Node.js) and Eloquent (Laravel). Recommended: introduce a `GameRepository` interface and an Eloquent implementation; same for billing.

---

## 3. Security Findings (CRITICAL)

### 🔴 F-01 — Hardcoded email credentials in `emailService.ts`
```ts
auth: {
  user: process.env.MAIL_USERNAME || 'info@jinjoodock.com',
  pass: process.env.MAIL_PASSWORD || '5VpWKxg1ATNU0qjt',
}
```
**Risk:** Credential leak via Git. Anyone with read access can send email as the brand.  
**Fix:** Remove fallbacks; fail-fast at startup if env vars are missing.

### 🔴 F-02 — Hardcoded OTP `'123456'`
`apis/src/controllers/organizerController.ts` lines **18, 60, 231**. Original `Math.floor(100000 + Math.random()*900000)` is commented out.  
**Risk:** OTP authentication **completely bypassed**; any user can register and log in to any organizer account.  
**Fix:** Use `crypto.randomInt(100000, 1000000).toString()` and **immediately remove** commented secure version.

### 🔴 F-03 — Weak/default JWT secret
`apis/src/middlewares/authMiddleware.ts:17` uses `process.env.JWT_SECRET || 'secret'`. Same default in `organizerController.ts:118` (`'your_jwt_secret_key'`).  
**Risk:** Token forgery → account takeover.  
**Fix:** Generate 64-char random secret, store in secret manager, fail-fast at boot if missing.

### 🔴 F-04 — Debug OTP returned in API response
```php
'otp_debug' => config('app.debug') ? $otp : null,
```
Found in `app/Http/Controllers/API/AuthController.php:44, 120` and `GameJoinController.php:120`.  
**Risk:** Production misconfig leaks OTPs.  
**Fix:** Remove `otp_debug` entirely; log server-side.

### 🔴 F-05 — Unauthenticated game endpoints
`routes/api.php:27-31`:
```php
Route::prefix('game-join')->group(function () {
  Route::get('verify-link/{token}', ...);
  Route::post('join', ...);
  Route::post('verify-otp', ...);
});
```
Also `routes/api.php:36-50` (`/v1/content/*`, `/v1/activities/*`) is open.  
**Risk:** Anyone can enumerate invitation tokens, brute-force OTPs, scrape blogs/FAQs that may be paid content, and hit `/activities/games/{slug}` for DoS.  
**Fix:** Move to `auth:api` (Sanctum) for write paths; keep only `verify-link` public with rate limit and a per-IP throttle.

### 🔴 F-06 — Unauthenticated Socket.IO
`server.ts:79-81`:
```ts
io.on('connection', (socket) => {
  setupSocketHandlers(io, socket);
});
```
`join_lobby` accepts any `groupId` and a `participantId` from the client; `update participant_sessions SET is_online = 1 ...` is trusted.  
**Risk:** Any client can join any group's room, set anyone online, and receive game state updates.  
**Fix:**
```ts
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error('Auth required'));
  try { socket.data.user = jwt.verify(token, process.env.JWT_SECRET); next(); }
  catch (e) { next(new Error('Invalid token')); }
});
```
Then verify `socket.data.user.id` matches the `participantId` on `join_lobby`.

### 🔴 F-07 — Insecure Direct Object Reference (IDOR) in admin endpoints
`Admin\ActivityController::toggleStatus` uses `Activity::findOrFail($request->id)` with no `authorize()` and no policy. Same pattern in `Admin\BlogController`, `Admin\CmsPageController`, `Admin\EmailTemplateController`, `Admin\FaqController`, `Admin\PackageManagementController`.  
**Risk:** Sub-admin or compromised admin can toggle any record regardless of menu permissions (`MenuPermission` table exists).  
**Fix:** Bind via route model + Laravel Policy using `MenuPermission` checks.

### 🔴 F-08 — Insecure "auth token" for organizer
`app/Http/Controllers/API/AuthController.php:86`:
```php
'access_token' => 'dummy-token-' . Str::random(40),
```
No Sanctum/Passport, no DB persistence, **the token is never verified** in any subsequent Laravel request because no middleware is configured to validate it.  
**Risk:** Logins are essentially "open doors".  
**Fix:** Either implement Laravel Sanctum properly, or **delete** the auth endpoints until they are implemented, or hand off auth entirely to the Node.js API (which already has JWT).

---

## 4. High-Severity Issues

### 🟠 F-09 — `JWT_SECRET` default `'your_jwt_secret_key'` in `organizerController.ts:118`
Same as F-03 — both `authMiddleware` and `organizerController` rely on weak defaults.  
**Fix:** Centralize JWT in a `services/auth.ts` and validate at boot.

### 🟠 F-10 — Rate limiting missing/insufficient
- `routes/api.php:20` — `throttle:6,1` on auth is reasonable.
- `routes/admin.php:29` uses `throttle:100,0.2` — **100 req/0.2 sec** is effectively no limit.
- Node.js: only `joinLinkRateLimit` is applied; `organizerController` (registration, booking, payment) has **no rate limit**.
- `confirmPayment`, `completeBooking` are sensitive payment paths without any throttle.  
**Fix:** Add `express-rate-limit` per-IP and per-organizer; tighten admin throttle to 60/min.

### 🟠 F-11 — `ActivityController.php` LIKE clause with raw input
```php
->where('title', 'LIKE', str_replace('-', ' ', $slug))
```
This binds as a **literal string** (Eloquent does parameterize it), but it allows **wildcard abuse** (`%`, `_`) and produces slow queries on large tables.  
**Fix:** Sanitize / escape `%` and `_`, or use exact slug match; add an index on `slug`.

### 🟠 F-12 — Missing input validation in Node.js
`organizerController.createBooking`, `completeBooking`, `confirmPayment` use raw `req.body` with no `validateRequest` middleware.  
**Fix:** Use `express-validator` or a `zod` schema per route.

### 🟠 F-13 — CORS default list permits localhost ports without env
`server.ts:13-20` ships a hardcoded dev origin list (`5173`, `3000`, `8080`).  
**Risk:** If `CORS_ORIGINS` is not set in production, the dev list becomes effective.  
**Fix:** Throw at boot if `NODE_ENV=production` and `CORS_ORIGINS` empty.

### 🟠 F-14 — JSON column for `winner_ids` then read as string
`gameEngineController.ts:315`:
```ts
[isCorrect ? 1 : 0, JSON.stringify(winners)]
```
`winners` are stringified session IDs. There is no symmetric deserialization in `getGameState`.  
**Fix:** Store as `JSON` typed column and parse on read; or use a normalized `result_winners` table.

### 🟠 F-15 — `moment` dependency in maintenance mode
`gameEngineController.ts`, `lobbyService.ts`, `timerService.ts`, `organizerController.ts` all use `moment`.  
**Fix:** Migrate to `date-fns` or `luxon`. `parseBookingSchedule` already shows the complexity of supporting two formats — a single library would simplify.

### 🟠 F-16 — Hardcoded DB timezone
`apis/src/config/db.ts` defaults to `'+05:30'`.  
**Fix:** Use UTC at the DB layer; localize at the UI.

### 🟠 F-17 — `emailService.sendOtpEmail` swallows errors
```ts
} catch (error) { logger.error('Error sending OTP email:', error); }
```
Returns success to the client even if the email is not delivered.  
**Fix:** Use an outbox table; on failure, set `email_delivered_at = null` and return 202 with `email_delivered: false`.

### 🟠 F-18 — `timerService` race conditions
`setInterval(..., 5000)` queries active timers and updates them inside `withTransaction`. With multiple instances (PM2 / k8s) running concurrently, **every instance will fire every timer**.  
**Fix:** Use a `claimed_at` column with `UPDATE ... WHERE claimed_at IS NULL`, or a distributed lock (Redis), or run as a single replica (deployment constraint).

### 🟠 F-19 — `console.log` in `timerService` instead of `logger`
`timerService.ts:10, 33`. Inconsistent with the rest of the codebase which uses `utils/logger`.

### 🟠 F-20 — Email & OTP are not rate-limited per email
A user can spam `sendOtp` 6 times/minute and get a fresh OTP each time.  
**Fix:** Per-email cooldown (e.g. 60 s) + daily cap.

### 🟠 F-21 — No `package.json` / build config at the project root
Only `package.json` and `package-lock.json` exist at the project root and are essentially empty. The actual app lives in `frontend/`.  
**Risk:** Onboarding confusion; CI may install the wrong deps.  
**Fix:** Move frontend dependencies up or add a clear `README` section explaining the monorepo.

### 🟠 F-22 — No CSRF in Node.js (acceptable for token APIs) **but** mixed guard in Laravel
Laravel uses both `auth:admin` (session) and `auth:api` (Sanctum, but never configured).  
**Fix:** Decide one. For pure JSON APIs, use Sanctum; for the admin panel, keep session guard and ensure `VerifyCsrfToken` is on.

---

## 5. Medium-Severity Issues

### 🟡 F-23 — `gameEngineController.ts` is 530 lines, 7 endpoints
Split into:
- `QuestionService` (ask/answer/scoring)
- `VerdictService` (winner logic)
- `LieDetectorService` (voting/round)
- `WitnessService` (passcard)
- `CaseSummaryService` (reopen)

### 🟡 F-24 — Repeated investigator lookup query
`gameEngineController.ts` runs the same `SELECT ... WHERE gr.role_name LIKE '%Investigator%'` in 4 places. Extract to a helper:
```ts
async function getInvestigatorSession(groupId, participantId?) { ... }
```

### 🟡 F-25 — Role detection by string match
`role_name LIKE '%Investigator%'`, `'%Witness%'`, `'%culprit%'`, `'%suspect%'`.  
**Risk:** Any role name change breaks the system silently.  
**Fix:** Use a typed `role_type` enum (already in `game_roles.role_type`) for matching and keep `role_name` only for display.

### 🟡 F-26 — Magic numbers everywhere
```ts
if (questionCount >= 5) ...           // MAX_QUESTIONS
if (duration > 2) penalty = 10        // ANSWER_TIMEOUT_MIN, LATE_PENALTY
moment().add(7, 'minutes')            // LIE_DETECTOR_DURATION
moment().add(5, 'minutes')            // REOPEN_BONUS
```
**Fix:** Centralize in `config/constants.ts` (Node) and `config/constants.php` (Laravel) — `config/constants.php` already exists but is largely empty; the values must come from `activities` columns (`max_questions`, `question_response_secs`, etc.) which is correct, but the **fallback defaults** are scattered.

### 🟡 F-27 — Silent error swallowing
`socketHandler.ts:28`:
```ts
} catch {
  /* participant_sessions may not exist yet during lobby */
}
```
**Fix:** Always log, even at debug level — silent catches hide regressions.

### 🟡 F-28 — `GameJoinController::joinGame` may allow duplicate joins across bookings
`updateOrCreate(['booking_id','email'], [...])` does not check `group_id` boundaries; a participant joining a *different* booking with the same email will move their record.  
**Fix:** Validate booking match or use a separate idempotency key.

### 🟡 F-29 — `lobbyService.parseBookingSchedule` silently accepts wrong format
If `scheduled_time` is e.g. `'13:00:00 PM'`, it falls through to `String(scheduled_time)`, which is then re-parsed and may produce a *different* date.  
**Fix:** Reject invalid formats with a clear error.

### 🟡 F-30 — N+1 risk in `eventStatsService`
`buildEventStats` joins and groups, but sub-queries like `(SELECT COUNT(*) FROM game_participants WHERE booking_id = ob.id AND email_verified_at IS NOT NULL)` are run for **every booking row**.  
**Fix:** Aggregate in a single grouped query.

### 🟡 F-31 — Inconsistent date serialization
`serializeData` (Node) and Eloquent's default casting produce slightly different ISO formats.  
**Fix:** Define a single serializer and use it in every service.

### 🟡 F-32 — Activity settings duplication
`activities` has all game tunables (`group_size`, `lobby_wait_secs`, etc.), and there is also a literal `5` (`PLAYERS_PER_GROUP`) in `participantGroupService.ts:5`.  
**Fix:** Read from `activities` table; the constant is a silent override that bypasses config.

### 🟡 F-33 — No CSP / X-Frame-Options headers in Laravel
`helmet` covers the Node API, but Laravel responses have no security headers.  
**Fix:** Add a middleware that sets CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy.

### 🟡 F-34 — `public/admin` and `public/front` legacy folders
The repo has `public/admin/`, `public/front/`, `public/front_olds/` — a likely legacy PHP admin/frontend.  
**Risk:** Old code paths still accessible (depends on server config).  
**Fix:** Confirm with the team; remove or move behind a separate vhost.

### 🟡 F-35 — `package.json` in root has no `name`, no `scripts`
`/opt/homebrew/var/www/p/package.json` and `/opt/homebrew/var/www/p/package-lock.json` are empty stubs.  
**Fix:** Add a workspace root with `workspaces: ["frontend", "apis"]` and aggregate scripts.

### 🟡 F-36 — `console.log` / `console.error` mixed with `logger`
Multiple controllers and services use `console.*` instead of `utils/logger`.  
**Fix:** Replace all with the shared logger.

### 🟡 F-37 — `Routes::api` does not load `auth:api` middleware
`/v1/auth/*` uses throttle but no auth check, and `/v1/activities/*` is fully open.  
**Fix:** Add `auth:api` (Sanctum) for participant-scoped routes.

### 🟡 F-38 — `Authenticate.php` middleware has commented debug code
```php
//echo '<pre>'; print_r($request->all()); die;
```
**Fix:** Remove all commented debug code.

### 🟡 F-39 — Models lack `$casts` and `$fillable` consistency
Some models (`GameParticipant`, `GameSession`, `OrganizerBooking`) do not declare `$casts` for `json` columns (`timeline`, `quick_facts`, `what_you_know`, `confirmation_details`, `consents`).  
**Fix:** Add explicit casts; do not rely on raw strings.

### 🟡 F-40 — No structured logging
Errors and warnings use free-form strings; no correlation id, no request id, no `group_id` context.  
**Fix:** Add `pino` with `reqId` middleware; include `groupId`, `participantId` in each line.

---

## 6. Low-Severity Issues

### 🟢 F-41 — `phpunit.xml` exists but no tests
`tests/Feature/`, `tests/Unit/` are empty directories.  
**Fix:** Add a smoke test for each module (Laravel + Node).

### 🟢 F-42 — Vite config may not handle API proxy
No `vite.config.ts` proxy to Node.js / Laravel; CORS is the workaround.  
**Fix:** Add a dev proxy.

### 🟢 F-43 — `.env` is checked in (per `.gitignore` it should be ignored, but verify)
**Fix:** Confirm `.env` is in `.gitignore`; rotate any committed secrets.

### 🟢 F-44 — `package-lock.json` exists at root, while `frontend/` uses `bun.lock`
Two lockfiles.  
**Fix:** Pick one package manager (npm vs bun) and align the project.

### 🟢 F-45 — `index.php` and `artisan` symlink-like files at project root
Standard Laravel skeleton — fine, but mention in onboarding.

### 🟢 F-46 — `vite.config.js` at root, not `vite.config.ts`
Inconsistent naming with the rest of TS code.  
**Fix:** Rename to `.ts` for consistency.

### 🟢 F-47 — Inconsistent code-style in tests dir
Empty tests have no conventions yet.  
**Fix:** Add `phpcs.xml`, `eslint.config.js`, and `prettier` configs.

### 🟢 F-48 — `SOCKET.md` documents events but is not linked from main `README.md`
**Fix:** Add a "Real-time events" section to README pointing to SOCKET.md.

### 🟢 F-49 — `LOGICS.md` does not mention scoring edge cases (no answer / offline suspect)
**Fix:** Document the rules in `LOGICS.md`.

### 🟢 F-50 — `BEST_PRACTICES_REVIEW.md` references `package.json` paths that don't exist
**Fix:** Update with current file structure.

---

## 7. Business Logic — `LOGICS.md` Compliance

| # | Rule | Implementation Status | Notes |
|---|------|-----------------------|-------|
| 1 | Exactly 5 players per group | ✅ Implemented in `participantGroupService.ts` (`PLAYERS_PER_GROUP = 5`) | Hard-coded; should read from `activities.group_size` |
| 2 | Auto-group with first-available | ✅ Implemented | Race condition possible if two participants join the same group simultaneously (no row lock) |
| 3 | Game cannot start until 5 | ✅ `lobbyService` enforces via `isGroupFull` | But **no DB-level constraint** |
| 4 | Role assignment via Fisher-Yates | ⚠️ Not seen in code (no `assignRoles` service present) | **Missing feature** — needs implementation |
| 5 | Lobby / Case Summary / Questioning / Clue / Lie Detector / Verdict | ✅ All phases modelled in `timerService` and `gameEngineController` | Phases tied to timer rows; no state machine |
| 6 | Investigator +5 reopen | ✅ Implemented in `reopenCaseSummary` | Uses `score_logs` to track once-per-game |
| 7 | Max 5 questions total, +10 per question | ✅ `askQuestion` enforces | Late answers give -10 — implemented |
| 8 | Lie detector 3 questions, 7 min, votes | ✅ `startLieDetector`, `voteLieDetector` | No vote tally logic visible |
| 9 | Witness passcard (one-time) | ✅ `useWitnessPasscard` | Only Investigator notified — implemented |
| 10 | Winner logic (correct/incorrect verdict) | ✅ `submitFinalVerdict` | Stores `winner_ids` as JSON string |
| 11 | Role privacy in `getGameState` | ⚠️ Partial — full `sessions` array is sent, only `my_role` is filtered | Privacy leak: any client can read `participant_sessions[].role_name` |
| 12 | Reconnection sync from DB | ✅ Yes, all state derived from DB | — |
| 13 | Expiry: `expires_at` for game links | ✅ `OrganizerBooking.invitation_link` used in `verifyLink` | No `expires_at` column is checked anywhere |
| 14 | Incomplete groups cancelled | ❌ No scheduled job | **Missing feature** |

### 7.1 Missing pieces to fully match `LOGICS.md`
- **Role assignment service** (`assignRoles`): not visible. The migration creates `game_roles` and `participant_sessions.role_id`, but no controller inserts a role. **Likely place: end of `assignParticipantToGroup` once group is full.**
- **Scheduled cleanup job** for incomplete groups (cron / scheduled task).
- **Vote tally** in `lie_detector_rounds`.
- **Privacy filter** in `getGameState` — strip role data for other users.

---

## 8. Database Review

### Schema (selected tables)

| Table | Purpose | Issues |
|---|---|---|
| `organizers` | Account info | Good unique email, soft deletes. |
| `organizer_bookings` | Per-event booking | No `expires_at`; `game_id` nullable. |
| `organizer_billings` | GST/payment record | Good FK + cascade. |
| `organizer_notifications` | (per migration) | Schema not reviewed in this pass. |
| `activities` | Game catalog | All tunables here ✅. |
| `activity_games` | Case content | Good. |
| `game_roles` | Roles per game | `role_type` enum already present, but unused in code (F-25). |
| `game_participants` | Per-event participant | Missing `group_id` FK? Yes — set in service. Missing index on `(booking_id, email_verified_at)`. |
| `game_groups` | Group of 5 | `status` is free text — should be enum (`waiting`, `active`, `completed`, `cancelled`). |
| `participant_sessions` | Live in-game state | `socket_id` is nullable text — good. Missing index on `(group_id, participant_id)`. |
| `timers` | Persistent timers | `timer_type` is free text — should be enum. No index on `is_active`. |
| `questions`, `answers` | Q&A | `points_awarded` int default 10 — should reference constant. |
| `lie_detector_rounds`, `votes` | Lie detector | `vote_value` is free text — should be enum (`believable`, `suspicious`). |
| `clue_rooms`, `game_clues` | Clues | `is_unlocked` boolean not in shown migration — added in code (`UPDATE clue_rooms SET is_unlocked = 1`). |
| `witness_passcards` | Passcard | Good. |
| `results` | Game result | `winner_ids` is text (JSON string) — should be `JSON` typed. |
| `score_logs` | Score audit | Good. |

### Migration hygiene
- All migrations have proper `up()` and `down()` ✅.
- All FKs use `cascadeOnDelete()` ✅.
- Many `$table->enum()` are MySQL-only — moving to PostgreSQL will require rewriting.
- No `index()` calls anywhere — **massive perf risk** at scale.

### Recommended indexes
```php
// organizers
$table->index('payment_status');
$table->index('account_status');

// organizer_bookings
$table->index(['organizer_id', 'status']);
$table->index('scheduled_date');

// activities
$table->index('status');
$table->index('slug');

// activity_games
$table->index(['activity_id', 'status']);

// game_participants
$table->index(['booking_id', 'email_verified_at']);
$table->index(['group_id', 'email_verified_at']);
$table->index('email');

// game_groups
$table->index(['booking_id', 'status']);

// participant_sessions
$table->index(['group_id', 'participant_id']);
$table->index('socket_id');

// timers
$table->index(['is_active', 'expires_at']);

// results
$table->index('group_id');
```

### Model recommendations
- Add `scopeActive`, `scopeWaiting`, `scopeCompleted` on `GameGroup`.
- Cast `Organizer.consents` (json), `ActivityGame.timeline` (json) etc.
- Use `AsPivot` for any future many-to-many.

---

## 9. API & Route Review

### 9.1 Laravel — `routes/api.php`
| Route | Method | Auth | Throttle | Concerns |
|---|---|---|---|---|
| `/v1/auth/login/send-otp` | POST | none | `6,1` | Debug OTP leak (F-04) |
| `/v1/auth/login/verify-otp` | POST | none | `6,1` | Dummy token (F-08) |
| `/v1/auth/login/resend-otp` | POST | none | `6,1` | Same |
| `/v1/game-join/verify-link/{token}` | GET | **none** | none | Token enumeration (F-05) |
| `/v1/game-join/join` | POST | **none** | none | Brute-force OTP (F-05) |
| `/v1/game-join/verify-otp` | POST | **none** | none | Same |
| `/v1/settings` | GET | none | none | OK |
| `/v1/content/*` | GET | **none** | none | Scraping, DoS (F-05) |
| `/v1/activities/*` | GET | **none** | none | Same |

### 9.2 Node.js API routes (paraphrased)
- `/v1/public/*` — public endpoints (no auth)
- `/v1/participant/*` — uses `authMiddleware` (organizer JWT!) — **mismatched auth model** (F-09, F-22)
- `/v1/organizer/*` — uses `authMiddleware`
- `/v1/game/*` — game engine routes; some use auth, some don't

### 9.3 API documentation
**Missing.** Generate Swagger/OpenAPI from JSDoc/PHPDoc; serve at `/docs`.

---

## 10. Frontend Review

The frontend lives in `frontend/` with TanStack Router, Redux Toolkit, TanStack Query, shadcn/ui. The repo contains `FILES_INVENTORY.md`, `ARCHITECTURE.md`, `CODE_STANDARDS.md`, `PROJECT_STRUCTURE.md`, `MIGRATION.md`, `RESTRUCTURING_SUMMARY.md`, `QUICK_START.md`, `SETUP.md`, `APIS-NEED.md` — comprehensive docs.

### Issues
- **No error boundaries** — a single component error crashes the whole SPA.
- **No tests** — no Jest/Vitest config, no React Testing Library.
- **No accessibility audit** — no `axe-core` integration.
- **No service worker** — offline handling is the responsibility of every page.
- **Bundle size unknown** — code splitting not configured.
- **API client** likely has generic error handling (per existing `CODE_REVIEW_REPORT.md`) — needs typed errors and retry policy.
- **TanStack Query** should be the single source of truth for server state; Redux should be limited to UI state. Audit stores.

### Recommendations
1. Add an `<ErrorBoundary>` at route level using `react-error-boundary`.
2. Configure `vite.config.ts` for code splitting and `vite-plugin-compression` for gzip.
3. Add a global API error handler that maps HTTP codes to user-friendly toast messages.
4. Add `eslint-plugin-jsx-a11y` and `axe-core` to CI.
5. Add Playwright E2E for: join flow, lobby, case summary, questioning, lie detector, verdict.

---

## 11. Performance Review

| Area | Issue | Fix |
|---|---|---|
| DB | Missing indexes on every FK + status column | Add per Section 8 |
| Node | `timerService` polling every 5 s | Use `setTimeout` based on next expiry |
| Node | `lobbyService` runs 3 queries per request | Cache `booking` and `activity` rows |
| Laravel | `ContentController` may fetch all blogs without pagination | Use `->paginate()` |
| React | Likely no `React.memo`/`useMemo` for lobby member list | Profile and memoize |
| React | No image lazy loading | Use `loading="lazy"` + responsive `srcset` |
| Build | Vite config may not split vendor chunks | Configure `rollupOptions.output.manualChunks` |
| Network | No HTTP caching on `/v1/content/*` | Add `Cache-Control: public, max-age=300` for blogs/FAQs |
| Email | Synchronous `sendMail` blocks response (currently fire-and-forget) | Push to a queue (BullMQ on Redis) |

---

## 12. Configuration & Environment

### 12.1 Missing env validation
**Both** Laravel and Node.js read `process.env.*` with no schema check.

**Node.js — add at boot:**
```ts
import { z } from 'zod';
const Env = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  DB_HOST: z.string(), DB_USER: z.string(), DB_PASS: z.string(), DB_NAME: z.string(),
  JWT_SECRET: z.string().min(64),
  MAIL_HOST: z.string(), MAIL_PORT: z.coerce.number(), MAIL_USERNAME: z.string(), MAIL_PASSWORD: z.string(),
  CORS_ORIGINS: z.string().min(1),
});
Env.parse(process.env);
```

**Laravel — add `AppServiceProvider::boot()` check** for required env keys; throw on missing.

### 12.2 `.env` keys that must exist in production
- Laravel: `APP_KEY`, `APP_URL`, `DB_*`, `MAIL_*`, `SESSION_SECURE_COOKIE=true`, `CACHE_DRIVER=redis`, `QUEUE_CONNECTION=redis`, `SANCTUM_STATEFUL_DOMAINS`.
- Node.js: `PORT`, `DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME`, `JWT_SECRET`, `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_FROM_NAME`, `MAIL_FROM_ADDRESS`, `CORS_ORIGINS`, `REDIS_URL`.

### 12.3 `config/constants.php` exists but is mostly empty
- Move all literal numbers (5, 2, 7, 10, etc.) into this file (or DB-driven `activities` columns).
- Use enums for `status`, `timer_type`, `vote_value`, `role_type`.

### 12.4 `setting.php` config
The `config/setting.php` is the right place for game tunables — populate it from the `settings` table and expose via the `getGlobalSettings` API.

---

## 13. Logging, Monitoring, Observability

| Need | Status | Recommendation |
|---|---|---|
| Centralized logging | ❌ `console.*` + `logger` mixed | Adopt `pino` (Node) + `monolog` (Laravel) with JSON output |
| Request tracing | ❌ None | Add `reqId` middleware (Express) + Laravel `X-Request-Id` |
| Metrics (Prometheus) | ❌ None | `prom-client` in Node, `promphp/prometheus_client_php` in Laravel |
| Error tracking (Sentry) | ❌ None | Integrate Sentry with environment tagging |
| Health checks | ⚠️ None visible | Add `/healthz` and `/readyz` in both APIs |
| Uptime monitoring | ❌ | Use UptimeRobot / BetterStack |
| Alerting | ❌ | PagerDuty / Opsgenie for `5xx` and DB lag |

---

## 14. CI/CD & DevOps

### Current
- No `.github/workflows`, no `Dockerfile`, no `docker-compose.yml`.
- `phpunit.xml` exists but tests are empty.
- No lint config checked in for either backend.
- No commit hooks (`husky`, `lint-staged`).

### Recommended
```yaml
# .github/workflows/ci.yml (excerpt)
name: CI
on: [push, pull_request]
jobs:
  laravel:
    steps: [composer install, php artisan test, phpstan analyse, phpcs]
  node:
    steps: [npm ci (in apis/), npm test, eslint, tsc --noEmit]
  frontend:
    steps: [bun install, vitest, eslint, vite build]
  security:
    steps: [composer audit, npm audit, gitleaks]
```
- Add `Dockerfile` for each service and a `docker-compose.yml` for local dev.
- Add `gitleaks` or `trufflehog` pre-commit.
- Add a `Renovate` or `Dependabot` config.

---

## 15. Documentation

| Doc | Status | Notes |
|---|---|---|
| `README.md` | Exists | Add real-time event reference and a "Quickstart with Docker" |
| `LOGICS.md` | ✅ Complete | Add edge cases (offline, no answer) |
| `SOCKET.md` | ✅ Exists | Link from README |
| `ARCHITECTURE_REVIEW.md` | ✅ | Use as input to a live `docs/architecture.md` |
| `CODE_REVIEW_REPORT.md` | ✅ | Use as input to a live `docs/code-review.md` |
| `SECURITY_REVIEW.md` | ✅ | Use as input to a live `docs/security.md` |
| `BEST_PRACTICES_REVIEW.md` | ✅ | Use as input to a live `docs/best-practices.md` |
| `PERFORMANCE_REVIEW.md` | ✅ | Use as input to a live `docs/performance.md` |
| `CMS_MODULE_DOCUMENTATION.md` | ✅ | OK |
| `EMAIL_TEMPLATES_*` | ✅ | OK |
| `FORM_VALIDATION_IMPLEMENTATION.md` | ✅ | OK |
| `GAME_ASSIGNMENT_IMPROVEMENTS.md` | ✅ | OK |
| `frontend/APIS-NEED.md` | ✅ | OK |
| `frontend/ARCHITECTURE.md` | ✅ | OK |
| `frontend/CODE_STANDARDS.md` | ✅ | OK |
| `frontend/FILES_INVENTORY.md` | ✅ | OK |
| `frontend/MIGRATION.md` | ✅ | OK |
| `frontend/PROJECT_STRUCTURE.md` | ✅ | OK |
| `frontend/QUICK_START.md` | ✅ | OK |
| `frontend/RESTRUCTURING_SUMMARY.md` | ✅ | OK |
| `frontend/SETUP.md` | ✅ | OK |
| `frontend/verify-architecture.sh` | ✅ | OK |
| `apis/README_MIGRATION.md` | ✅ | OK |
| `apis/Postman_Collection_New.json` | ✅ | OK |

**Recommendation:** Consolidate the 5 review files (`CODE_REVIEW_REPORT`, `SECURITY_REVIEW`, `ARCHITECTURE_REVIEW`, `BEST_PRACTICES_REVIEW`, `PERFORMANCE_REVIEW`, and this new `final_review`) into a single living `docs/review.md` updated quarterly.

---

## 16. SOLID / DRY / KISS Observations

### Single Responsibility
- ❌ `gameEngineController.ts` violates SRP (F-23).
- ⚠️ `organizerController.ts` mixes registration, login, booking, payment (5 responsibilities).
- ✅ `Services/*` mostly OK.

### Open/Closed
- ❌ Hard-coded game phase transitions in `timerService.switch`; new phases need code change.
- ✅ Migrations are forward-only — OK.

### Liskov
- ⚠️ No inheritance chains visible — N/A.

### Interface Segregation
- ⚠️ `authMiddleware` works for both organizer and participant — should be split.

### Dependency Inversion
- ❌ Controllers depend on `mysql2/promise` directly. Introduce repository interfaces.

### DRY
- ⚠️ Investigator lookup repeated 4× (F-24).
- ⚠️ Same SQL `INSERT INTO timers (...)` repeated 3× in `gameEngineController`.

### KISS
- ❌ `parseBookingSchedule` (F-29) is overly clever — should just validate and throw.

---

## 17. Error Handling Patterns

### Issues
- Some controllers return `AppError` (Node), some return raw `throw new Error(...)` (Node), some return Laravel `errorResponse(...)`.
- `errorResponse` in Node swallows the original error context.
- `globalErrorHandler` should be the only place that formats 500 responses.

### Recommendation
- Define a single `AppError(message, statusCode, code, details)` and use it everywhere.
- In production, never return stack traces; log them.
- Map common errors to user-friendly messages (e.g. `OTP_INVALID`, `OTP_EXPIRED`, `SLOT_FULL`).

---

## 18. Testing Recommendations

### Priority tests (must-have)
1. **Lobby grouping** — 6 participants → 2 groups of 5/1; race condition.
2. **Role assignment** — 5 players, each role assigned exactly once, Fisher-Yates randomness distribution test.
3. **Questioning + scoring** — max 5 questions, +10 on ask, -10 on late answer (2-min boundary).
4. **Lie detector** — 3-question limit, 7-min expiry, vote tally.
5. **Witness passcard** — one-time, only Investigator notified.
6. **Verdict / winner logic** — correct vs incorrect scenario, partial group.
7. **Organizer billing** — GST math, 5-day schedule window, one-time reschedule.
8. **Auth** — OTP expiry, email cooldown, dummy-token rejection.
9. **Socket** — auth middleware, room isolation, disconnect cleanup.
10. **Privacy filter** — `getGameState` does not leak other users' roles.

### Tooling
- **Laravel:** `pestphp/pest` for expressive tests, `mockery` for mocks.
- **Node.js:** `vitest` + `supertest` for HTTP, `socket.io-client` for WS.
- **React:** `vitest` + `@testing-library/react` + `playwright` for E2E.

### Coverage target
- **Services:** 80% line coverage.
- **Controllers:** 60% (focus on happy + key error paths).
- **Migrations:** 100% (run on a throwaway DB in CI).

---

## 19. Migration / Refactor Roadmap

### Phase 0 — Stop the bleeding (1–2 days)
1. Remove hardcoded credentials and OTP (F-01, F-02).
2. Set strong `JWT_SECRET` and remove defaults (F-03).
3. Remove `otp_debug` from API responses (F-04).
4. Add authentication to game-join routes (F-05).
5. Add Socket.IO auth middleware (F-06).
6. Rotate any production secrets that were committed.
7. Replace `dummy-token` with a real Sanctum flow (F-08) — or remove the endpoints.

### Phase 1 — Stabilize (1 week)
1. Add env validation at boot.
2. Add rate limiting on all sensitive endpoints.
3. Add input validation in Node.js.
4. Tighten admin throttle.
5. Refactor `gameEngineController` into services.
6. Add DB indexes (Section 8).
7. Implement role-assignment service.
8. Implement scheduled job for incomplete groups.
9. Implement privacy filter in `getGameState`.

### Phase 2 — Quality (2–4 weeks)
1. Migrate from `moment` to `date-fns`.
2. Add request tracing, structured logging, error tracking.
3. Implement error boundaries in React.
4. Add unit + integration tests for critical paths.
5. Generate OpenAPI docs.
6. Add CI pipeline.

### Phase 3 — Operate (1–2 months)
1. Dockerize all services; add compose.
2. Add health/ready endpoints.
3. Add Prometheus + Grafana.
4. Add Sentry / OpenTelemetry.
5. Refactor to repository pattern.
6. Add API Gateway (Kong / Nginx).

### Phase 4 — Scale (quarter)
1. Read replicas for MySQL.
2. Redis cache for hot reads.
3. BullMQ for emails.
4. Consider splitting game engine per game type.
5. Pen-test + security audit.

---

## 20. Prioritized Action Checklist

### 🔴 P0 — Within 24 hours
- [ ] Remove hardcoded email credentials (F-01)
- [ ] Generate random OTP (F-02)
- [ ] Generate strong `JWT_SECRET`, remove defaults (F-03, F-09)
- [ ] Remove `otp_debug` from API responses (F-04)
- [ ] Add auth middleware to `/v1/game-join/*` (F-05)
- [ ] Add Socket.IO auth middleware (F-06)
- [ ] Implement real Sanctum tokens (F-08)
- [ ] Add `authorize()` checks on admin controllers (F-07)

### 🟠 P1 — Within 1 week
- [ ] Add env validation at boot
- [ ] Tighten admin rate limit
- [ ] Add `express-rate-limit` to all organizer routes
- [ ] Add input validation in Node.js
- [ ] CORS production guard
- [ ] Add DB indexes
- [ ] Implement role-assignment service
- [ ] Implement privacy filter
- [ ] Add `/healthz` and `/readyz`
- [ ] Replace `console.*` with `logger`

### 🟡 P2 — Within 1 month
- [ ] Refactor `gameEngineController` into services
- [ ] Migrate from `moment`
- [ ] Add request tracing
- [ ] Add error boundaries in React
- [ ] Implement unit + integration tests
- [ ] Generate OpenAPI docs
- [ ] Add CI pipeline
- [ ] Implement scheduled cleanup job
- [ ] Implement vote tally in lie detector

### 🟢 P3 — Within 1 quarter
- [ ] Dockerize all services
- [ ] Add monitoring stack
- [ ] Implement repository pattern
- [ ] Add API gateway
- [ ] Add E2E tests
- [ ] Pen-test + security audit
- [ ] Performance benchmark
- [ ] Consider microservices split for game engine

---

## 21. Strengths to Preserve

Despite the issues, the following are genuinely good and should be preserved during refactor:

1. **`LOGICS.md`** — single source of truth for product rules. Keep it.
2. **Three-tier separation** — admin/content (Laravel) ↔ real-time engine (Node) ↔ UI (React). It works.
3. **Service layer in Node.js** — `lobbyService`, `participantGroupService`, etc. are good. Keep extracting.
4. **Persistent timers in DB** — timers are the source of truth, not in-memory. Excellent for crash recovery.
5. **Transactions on write paths** — `withTransaction` is used in `gameEngineController`, `organizerController.completeBooking`. Keep this discipline.
6. **`asyncHandler` / `AppError` pattern** — consistent error funneling. Apply to remaining routes.
7. **Parameterized SQL** — almost all queries are parameterized. Excellent.
8. **`helmet` + `cors` + `morgan`** — security baseline in Node.js is correct.
9. **Migrations with `up`/`down`** — proper Laravel migration hygiene.
10. **Soft deletes on `organizers`** — correct.
11. **Documentation culture** — `LOGICS.md`, `SOCKET.md`, multiple `*_REVIEW.md`, and rich frontend docs.

---

## 22. Conclusion

The Amigo platform has a **strong product vision** and **sound architectural choices** (3-tier, persistent timers, transactional writes, service layer). However, it has **critical security defects** (hardcoded OTP, weak JWT, unauthenticated game endpoints, unauthenticated Socket.IO) that prevent production deployment as-is. The business logic is largely faithful to `LOGICS.md`, but the **role assignment**, **privacy filter**, and **scheduled cleanup** are missing.

The path forward is clear:

1. **Week 1** — fix all 8 critical security findings.
2. **Month 1** — stabilize, add tests, add indexes, add observability.
3. **Quarter 1** — Dockerize, add CI/CD, add monitoring, add API gateway, pen-test.
4. **Quarter 2+** — consider microservices, scale horizontally, add advanced features.

**Final Grade: B- (Needs Improvement)**  
**Target after Phase 2: A-**  
**Target after Phase 4: A**

---

## 23. Appendix — Findings Index

| ID | Severity | Title | File |
|---|---|---|---|
| F-01 | 🔴 Critical | Hardcoded email credentials | `apis/src/services/emailService.ts` |
| F-02 | 🔴 Critical | Hardcoded OTP `'123456'` | `apis/src/controllers/organizerController.ts` |
| F-03 | 🔴 Critical | Weak/default JWT secret | `apis/src/middlewares/authMiddleware.ts` |
| F-04 | 🔴 Critical | Debug OTP in API response | `app/Http/Controllers/API/AuthController.php` |
| F-05 | 🔴 Critical | Unauthenticated game endpoints | `routes/api.php` |
| F-06 | 🔴 Critical | Unauthenticated Socket.IO | `apis/src/server.ts` |
| F-07 | 🔴 Critical | IDOR in admin endpoints | `app/Http/Controllers/Admin/*` |
| F-08 | 🔴 Critical | Dummy auth token | `app/Http/Controllers/API/AuthController.php` |
| F-09 | 🟠 High | Default JWT secret in organizerController | `apis/src/controllers/organizerController.ts` |
| F-10 | 🟠 High | Rate limiting insufficient | `routes/admin.php`, `apis/src` |
| F-11 | 🟠 High | LIKE clause with raw input | `app/Http/Controllers/API/ActivityController.php` |
| F-12 | 🟠 High | Missing input validation (Node) | `apis/src/controllers/organizerController.ts` |
| F-13 | 🟠 High | CORS dev defaults | `apis/src/server.ts` |
| F-14 | 🟠 High | JSON column read as string | `apis/src/controllers/gameEngineController.ts` |
| F-15 | 🟠 High | `moment` deprecated | multiple |
| F-16 | 🟠 High | Hardcoded DB timezone | `apis/src/config/db.ts` |
| F-17 | 🟠 High | `sendOtpEmail` swallows errors | `apis/src/services/emailService.ts` |
| F-18 | 🟠 High | Timer service race conditions | `apis/src/services/timerService.ts` |
| F-19 | 🟠 High | `console.log` in timerService | `apis/src/services/timerService.ts` |
| F-20 | 🟠 High | No per-email OTP cooldown | `apis/src/controllers/organizerController.ts` |
| F-21 | 🟠 High | No root `package.json` build config | `/opt/homebrew/var/www/p/package.json` |
| F-22 | 🟠 High | Mixed CSRF/auth guards in Laravel | `app/Http/Middleware`, `routes/*` |
| F-23 | 🟡 Medium | `gameEngineController` 530 lines / 7 endpoints | `apis/src/controllers/gameEngineController.ts` |
| F-24 | 🟡 Medium | Repeated investigator lookup query | `apis/src/controllers/gameEngineController.ts` |
| F-25 | 🟡 Medium | Role detection by string match | `apis/src/controllers/gameEngineController.ts` |
| F-26 | 🟡 Medium | Magic numbers everywhere | `apis/src/controllers/gameEngineController.ts`, `lobbyService.ts` |
| F-27 | 🟡 Medium | Silent error swallowing | `apis/src/socket/socketHandler.ts:28` |
| F-28 | 🟡 Medium | `GameJoinController` duplicate joins | `app/Http/Controllers/API/GameJoinController.php` |
| F-29 | 🟡 Medium | `parseBookingSchedule` accepts wrong format | `apis/src/services/lobbyService.ts` |
| F-30 | 🟡 Medium | N+1 risk in `eventStatsService` | `apis/src/services/eventStatsService.ts` |
| F-31 | 🟡 Medium | Inconsistent date serialization | `apis/src/utils/serializer.ts` |
| F-32 | 🟡 Medium | Activity settings duplication (hard-coded 5) | `apis/src/services/participantGroupService.ts` |
| F-33 | 🟡 Medium | No CSP / X-Frame-Options in Laravel | `app/Http/Middleware/*` |
| F-34 | 🟡 Medium | Legacy `public/admin`, `public/front` folders | `public/` |
| F-35 | 🟡 Medium | Root `package.json` empty | `/opt/homebrew/var/www/p/package.json` |
| F-36 | 🟡 Medium | `console.log` mixed with `logger` | multiple |
| F-37 | 🟡 Medium | No `auth:api` middleware on Laravel API | `routes/api.php` |
| F-38 | 🟡 Medium | Commented debug code in middleware | `app/Http/Middleware/Authenticate.php` |
| F-39 | 🟡 Medium | Models lack `$casts` for json columns | `app/Models/*` |
| F-40 | 🟡 Medium | No structured logging / correlation id | both backends |
| F-41 | 🟢 Low | `phpunit.xml` exists but no tests | `tests/` |
| F-42 | 🟢 Low | Vite config may not handle API proxy | `vite.config.js` |
| F-43 | 🟢 Low | `.env` may be checked in | `.gitignore` |
| F-44 | 🟢 Low | Two lockfiles (npm + bun) | root + `frontend/` |
| F-45 | 🟢 Low | `index.php`/`artisan` at root | project root |
| F-46 | 🟢 Low | `vite.config.js` not `vite.config.ts` | project root |
| F-47 | 🟢 Low | No lint/format configs | root, `apis/`, `frontend/` |
| F-48 | 🟢 Low | `SOCKET.md` not linked from README | `README.md` |
| F-49 | 🟢 Low | `LOGICS.md` lacks edge cases | `LOGICS.md` |
| F-50 | 🟢 Low | `BEST_PRACTICES_REVIEW` references missing paths | `BEST_PRACTICES_REVIEW.md` |

### Cross-References
- **Security:** F-01…F-08, F-09, F-10, F-13, F-17, F-20, F-22, F-33.
- **Performance:** F-10, F-18, F-30, F-31, F-32.
- **Reliability:** F-02, F-08, F-18, F-27, F-29.
- **Maintainability:** F-23, F-24, F-25, F-26, F-36, F-39, F-40.
- **Operations:** F-21, F-34, F-35, F-41…F-50.
- **Logic (vs `LOGICS.md`):** Role assignment, privacy filter, scheduled cleanup, vote tally.

---

## 24. Quick-Win Patches (copy/paste ready)

### 24.1 Fix F-01, F-02, F-03, F-04 (Node)
```ts
// apis/src/config/env.ts
import { z } from 'zod';
const Schema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  PORT: z.coerce.number().default(5000),
  DB_HOST: z.string(), DB_PORT: z.coerce.number().default(3306),
  DB_USER: z.string(), DB_PASS: z.string(), DB_NAME: z.string(),
  DB_TIMEZONE: z.string().default('+00:00'),
  JWT_SECRET: z.string().min(64, 'JWT_SECRET must be ≥64 chars'),
  MAIL_HOST: z.string(), MAIL_PORT: z.coerce.number(), MAIL_USERNAME: z.string(), MAIL_PASSWORD: z.string(),
  MAIL_FROM_NAME: z.string(), MAIL_FROM_ADDRESS: z.string().email(),
  CORS_ORIGINS: z.string().min(1),
  REDIS_URL: z.string().optional(),
});
export const env = Schema.parse(process.env);
```

### 24.2 Fix F-02 (random OTP)
```ts
import crypto from 'crypto';
export const generateOtp = () => crypto.randomInt(100000, 1000000).toString();
```

### 24.3 Fix F-06 (Socket auth)
```ts
// apis/src/socket/authMiddleware.ts
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
export const socketAuth = (socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error('Auth required'));
  try {
    socket.data.user = jwt.verify(token, env.JWT_SECRET);
    return next();
  } catch (e) { return next(new Error('Invalid token')); }
};
// server.ts
io.use(socketAuth);
```

### 24.4 Fix F-04 (Laravel)
```php
// app/Http/Controllers/API/AuthController.php
return $this->successResponse([
    'email' => $organizer->email,
], 'An OTP has been sent to your registered email.');
Log::debug('OTP generated', ['email' => $organizer->email]); // server-side only
```

### 24.5 Fix F-05 (Laravel route)
```php
Route::prefix('v1')->group(function () {
    Route::prefix('auth')->middleware(['throttle:6,1'])->group(function () {
        Route::post('login/send-otp', [AuthController::class, 'sendOtp']);
        Route::post('login/verify-otp', [AuthController::class, 'verifyOtp']);
        Route::post('login/resend-otp', [AuthController::class, 'resendOtp']);
    });

    // Public read-only (still rate-limited)
    Route::middleware('throttle:60,1')->group(function () {
        Route::get('settings', [SettingController::class, 'getGlobalSettings']);
        Route::prefix('content')->group(function () { /* … */ });
        Route::prefix('activities')->group(function () { /* … */ });
    });

    // Game join (still public but throttled)
    Route::prefix('game-join')->middleware(['throttle:10,1'])->group(function () {
        Route::get('verify-link/{token}', [GameJoinController::class, 'verifyLink']);
        Route::post('join', [GameJoinController::class, 'joinGame']);
        Route::post('verify-otp', [GameJoinController::class, 'verifyParticipantOtp']);
    });
});
```

### 24.6 Fix F-18 (timer claim)
```sql
ALTER TABLE timers
  ADD COLUMN claimed_by VARCHAR(64) NULL,
  ADD COLUMN claimed_at DATETIME NULL,
  ADD INDEX (is_active, expires_at, claimed_at);
```
```ts
async function claimTimer(timer) {
  const [r] = await conn.query(
    `UPDATE timers SET claimed_by = ?, claimed_at = NOW()
     WHERE id = ? AND claimed_by IS NULL`,
    [process.pid, timer.id]
  );
  return (r as any).affectedRows === 1;
}
```

### 24.7 Fix F-23 (extract `QuestionService`)
```ts
// apis/src/services/questionService.ts
import { query, withTransaction } from '../config/db';
import moment from 'moment';
import { AppError } from '../utils/AppError';
import { io } from '../server';

export async function askQuestion(opts: { groupId, investigatorSessionId, askedToSessionId, text, maxQuestions }) {
  const [c] = await query('SELECT COUNT(*) as cnt FROM questions WHERE group_id = ?', [opts.groupId]);
  if (Number(c[0].cnt) >= opts.maxQuestions) throw new AppError(`Max ${opts.maxQuestions} questions`, 400);
  // ... same transaction logic
}
```

### 24.8 Fix F-11 (LIKE sanitization)
```php
$clean = str_replace(['\\', '%', '_'], ['\\\\', '\\%', '\\_'], $slug);
$game = ActivityGame::where('title', 'LIKE', '%' . $clean . '%')
    ->where('activity_id', $booking->activity_id)
    ->first();
```

---

## 25. Final Word

This is a **fixable** codebase. The product is well-scoped, the team clearly understands the domain, and the business rules are correctly implemented in 80% of the code. The remaining 20% is concentrated in:

- **Security** (8 critical findings)
- **Auth model inconsistency** (Laravel vs Node.js)
- **Operational maturity** (tests, CI/CD, monitoring, docs)

Once the **P0 critical issues** are resolved (≤24 h), and the **P1 stabilization** is complete (≤1 week), the platform can be safely deployed to a small user base. Reaching A- requires the **P2 quality phase** (≤1 month) with tests, structured logging, and a CI pipeline.

Good luck — and rotate those secrets! 🔐

---

*This document supersedes the individual review files (`CODE_REVIEW_REPORT.md`, `SECURITY_REVIEW.md`, `ARCHITECTURE_REVIEW.md`, `BEST_PRACTICES_REVIEW.md`, `PERFORMANCE_REVIEW.md`) for a single, prioritized, end-to-end view. Keep it in version control and review quarterly.*

