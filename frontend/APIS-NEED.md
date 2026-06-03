# APIs Need for Zoventro

## Overview

This document describes all pages in the current project, what each page does, and which backend APIs are required to make it fully dynamic after login.

The app is built with React + TypeScript + Vite with TanStack Router and Redux Toolkit. Most pages are currently UI-driven, but for a production-ready dynamic app, the following APIs are needed.

---

## Page List and API Requirements

### 1. `/` - Home Page
- Purpose: Landing page, product overview, feature sections
- Dynamic needs: Minimal. Can remain static if homepage content is marketing-only.
- APIs needed:
  - Optional: `/content/home` or `/app/settings` if homepage text/images come from CMS

### 2. `/login` - Login Page
- Purpose: Email OTP or password login
- Dynamic needs:
  - Authenticate user credentials
  - Send and verify OTP
- Required APIs:
  - `POST /auth/login` - login with email/password
  - `POST /auth/logout` - optional logout
  - `GET /auth/me` - get current user profile after login
  - `POST /auth/refresh` - refresh auth token

### 3. `/create` - Create Session / Organizer Setup
- Purpose: Organizer registers, selects package, configures event, completes payment
- Dynamic needs:
  - Save organizer and session details
  - Validate email/company
  - Create a new game/session record
  - Payment activation and invoice generation
- Required APIs:
  - `POST /games` or `POST /sessions` - create new game/session
  - `PUT /games/:id` or `PUT /sessions/:id` - update session details
  - `POST /payments` - complete payment
  - `GET /payments/history` - optional, return billing/payment summary

### 4. `/dashboard` - Organizer Dashboard
- Purpose: Manage active events, view summary, download invoices
- Dynamic needs:
  - Load organizer's sessions and status
  - Load team counts and event data
  - Possibly reschedule sessions
- Required APIs:
  - `GET /games` or `GET /sessions` - list sessions for current organizer
  - `GET /games/:id` or `GET /sessions/:id` - fetch current session details
  - `PUT /games/:id/reschedule` or `PUT /sessions/:id` - update event date/time
  - `GET /payments/invoices` - fetch invoice metadata for downloads

### 5. `/join` - Join Session Page
- Purpose: Participant enters session code and joins
- Dynamic needs:
  - Validate join code
  - Register participant into session
- Required APIs:
  - `POST /games/:id/join` or `POST /sessions/join` - participant joins session
  - `GET /games/:id` - validate session state
  - `GET /participants/me` - optional participant profile

### 6. `/lobby` - Lobby Page
- Purpose: Pre-game waiting room with countdown
- Dynamic needs:
  - Load participant list
  - Display current lobby status
  - Start/ready state sync
- Required APIs:
  - `GET /games/:id/participants` - lobby participants
  - `GET /games/:id/status` - current game state
  - `POST /games/:id/ready` - set participant ready state (optional)

### 7. `/game` - Game Page
- Purpose: Main mystery quest gameplay and interaction
- Dynamic needs:
  - Load game questions, clues, participants, current game state
  - Save answers and progress
  - Reveal game summary and results
- Required APIs:
  - `GET /games/:id` - fetch active game metadata
  - `GET /games/:id/questions` - game content and clue list
  - `POST /games/:id/answers` - submit answers
  - `GET /games/:id/state` - current game progress and timers
  - `POST /games/:id/actions` - submit in-game actions such as votes, reveals, votes

### 8. `/results` - Results Page
- Purpose: Show final leaderboard and game results
- Dynamic needs:
  - Display player rankings, points, roles, story summary
  - Enable export / print of results data
- Required APIs:
  - `GET /games/:id/results` - full result sheet
  - `GET /games/:id/leaderboard` - player ranking list
  - `GET /games/:id/summary` - narrative summary and conclusions
  - Optional: `GET /games/:id/results/export` - results export endpoint

### 9. `/participants` - Participants Page
- Purpose: List participants and status
- Dynamic needs:
  - Fetch participant roster
  - View join/leave state
- Required APIs:
  - `GET /participants` - all participants for organizer or admin
  - `GET /games/:id/participants` - participants for a specific game
  - `POST /games/:id/participants/:participantId/remove` - remove or disqualify participant (optional)

### 10. `/groups` - Groups Management Page
- Purpose: Manage groups inside a session
- Dynamic needs:
  - Fetch group list
  - Create / update / delete groups
- Required APIs:
  - `GET /groups` - list groups
  - `POST /groups` - create new group
  - `PUT /groups/:id` - update group data
  - `DELETE /groups/:id` - remove group

### 11. `/profile` - User Profile Page
- Purpose: User/account settings
- Dynamic needs:
  - Load user profile
  - Update profile data
- Required APIs:
  - `GET /auth/me` - current user data
  - `PUT /auth/me` - update user profile
  - `POST /auth/change-password` - change password (optional)

### 12. `/payments` - Payment History Page
- Purpose: Show billing history, invoices, export payments
- Dynamic needs:
  - Load payment history
  - Download invoice files
- Required APIs:
  - `GET /payments/history` - payment records
  - `GET /payments/invoices` - invoice metadata or download links
  - `GET /payments/invoices/:invoiceId/download` - invoice PDF download

### 13. `/privacy` and `/terms` - Policy Pages
- Purpose: Static legal content
- Dynamic needs: None or minimal
- APIs needed:
  - Optional: `GET /content/privacy` and `GET /content/terms` if content is managed dynamically

---

## API Endpoints Needed for Full Dynamic Behavior

### Auth APIs
- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/me`
- `POST /auth/refresh`
- `PUT /auth/me` (profile update)
- `POST /auth/change-password` (optional)

### Game / Session APIs
- `GET /games`
- `GET /games/:id`
- `POST /games`
- `PUT /games/:id`
- `DELETE /games/:id`
- `GET /games/:id/questions`
- `POST /games/:id/answers`
- `GET /games/:id/state`
- `POST /games/:id/actions`
- `GET /games/:id/results`
- `GET /games/:id/leaderboard`
- `GET /games/:id/summary`
- `GET /games/:id/participants`
- `POST /games/:id/join`
- `POST /games/:id/leave`
- `POST /games/:id/ready` (optional)
- `PUT /games/:id/reschedule`

### Group APIs
- `GET /groups`
- `GET /groups/:id`
- `POST /groups`
- `PUT /groups/:id`
- `DELETE /groups/:id`

### Participant APIs
- `GET /participants`
- `GET /participants/:id`
- `POST /participants/:id/approve` (optional)
- `POST /participants/:id/remove` (optional)

### Payment / Invoice APIs
- `POST /payments`
- `GET /payments/history`
- `GET /payments/invoices`
- `GET /payments/invoices/:invoiceId/download`
- `GET /payments/reports` or `GET /payments/export`

### Content / CMS APIs (optional)
- `GET /content/home`
- `GET /content/privacy`
- `GET /content/terms`

---

## Existing API Layer in Project

The current `src/api/client.ts` already defines these service objects:
- `authApi`
  - `login`, `logout`, `getCurrentUser`, `refreshToken`
- `gamesApi`
  - `getAll`, `getById`, `create`, `update`, `delete`
- `groupsApi`
  - `getAll`, `getById`, `create`, `update`, `delete`
- `participantsApi`
  - `getAll`, `getByGameId`, `join`, `leave`

These are the core API hooks already present in the app.

---

## Page-by-Page API Usage Summary

### Login flow
- Page: `/login`
- Uses: `authApi.login`, `authApi.getCurrentUser`, `authApi.refreshToken`
- Dynamic after login: yes, provide token and user profile

### Organizer creation flow
- Page: `/create`
- Uses: `gamesApi.create`, `gamesApi.update` and payment endpoints
- Dynamic after login: yes, create live event/session and update details

### Dashboard
- Page: `/dashboard`
- Uses: `gamesApi.getAll`, `gamesApi.getById`, payment / invoice endpoints
- Dynamic after login: yes, show active session data and organizer-specific info

### Join session
- Page: `/join`
- Uses: `participantsApi.join`, `gamesApi.getById`
- Dynamic after login: yes, validate and register participant

### Lobby
- Page: `/lobby`
- Uses: `gamesApi.getById`, `participantsApi.getByGameId`
- Dynamic after login: yes, show live lobby state and countdown

### Game page
- Page: `/game`
- Uses: `gamesApi.getById`, `games/:id/questions`, `games/:id/answers`, `games/:id/state`
- Dynamic after login: yes, full live gameplay data

### Results
- Page: `/results`
- Uses: `games/:id/results`, `games/:id/leaderboard`, `games/:id/summary`
- Dynamic after login: yes, show final game results and export

### Participants page
- Page: `/participants`
- Uses: `participantsApi.getAll`, `participantsApi.getByGameId`
- Dynamic after login: yes, show roster and status

### Groups page
- Page: `/groups`
- Uses: `groupsApi.getAll`, `groupsApi.create`, `groupsApi.update`, `groupsApi.delete`
- Dynamic after login: yes, manage groups dynamically

### Profile page
- Page: `/profile`
- Uses: `authApi.getCurrentUser`, `authApi.updateProfile`
- Dynamic after login: yes, personal account edits

### Payments page
- Page: `/payments`
- Uses: `GET /payments/history`, `GET /payments/invoices`, download invoice
- Dynamic after login: yes, real billing history and exports

---

## Recommended API Data Contracts

### `POST /auth/login`
Request:
```json
{
  "email": "user@example.com",
  "password": "secret"
}
```
Response:
```json
{
  "user": { "id": "", "email": "", "name": "", "roles": [], "createdAt": "", "updatedAt": "" },
  "token": "...",
  "refreshToken": "..."
}
```

### `GET /games`
Response:
```json
[
  { "id": "", "title": "", "description": "", "status": "active", "createdAt": "", "updatedAt": "" }
]
```

### `GET /games/:id/results`
Response:
```json
{
  "gameId": "",
  "winner": "",
  "rankings": [
    { "player": "", "role": "", "badge": "", "points": 0 }
  ],
  "summary": "",
  "startedAt": "",
  "endedAt": ""
}
```

### `GET /payments/history`
Response:
```json
[
  { "invoiceId": "", "date": "", "packageName": "", "amount": "", "status": "completed", "downloadUrl": "" }
]
```

---

## Notes for Implementation

- The app should store the JWT token in localStorage and attach it in `Authorization: Bearer ...` headers.
- All protected pages should call `GET /auth/me` on initial load to validate session.
- `/games/:id` should be central for dashboard, lobby, game, and results dynamic state.
- Payment and results pages should support export/download features through dedicated endpoints.
- Group and participant management should work only for logged-in organizers.

---

## Suggested Additional Endpoints

These endpoints are not currently in `src/api/client.ts` but are recommended:
- `POST /payments/confirm`
- `GET /users/me/sessions`
- `GET /games/:id/notifications`
- `POST /games/:id/chat` or event comments
- `GET /reports/usage`
- `GET /games/:id/export` (results export)

---

## Summary

This project needs a clear backend contract for the following API categories:
- Authentication
- Games / Sessions
- Groups
- Participants
- Payments / Invoices
- Results
- User Profile
- Optional CMS / static content

With the above APIs implemented, the app will become fully dynamic after login and support the complete workflow from organizer creation, session launch, live gameplay, and result export.
