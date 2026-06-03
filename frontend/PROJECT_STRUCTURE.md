# Zoventro - Project Structure Documentation

## 📋 Project Overview

**Zoventro** is an interactive team experience platform built with React 19, TypeScript, and Vite. It enables organizations to create and manage mystery quest games and interactive team-building activities with real-time participation tracking.

**Tech Stack:**
- **Frontend Framework:** React 19 + TypeScript
- **Build Tool:** Vite
- **Routing:** TanStack Router
- **State Management:** Redux Toolkit + React Query
- **UI Components:** Radix UI (headless)
- **Styling:** Tailwind CSS
- **Notifications:** Sonner Toast
- **Forms:** React Hook Form + Zod
- **Deployment:** Cloudflare Workers (via Wrangler)

---

## 📁 Directory Structure

```
riamit/
├── src/                          # Source code directory
│   ├── api/                      # API client and error handling
│   ├── assets/                   # Static images and media
│   ├── components/               # Reusable React components
│   ├── config/                   # Configuration files
│   ├── constants/                # Application constants
│   ├── hooks/                    # Custom React hooks
│   ├── lib/                      # Utility libraries and helpers
│   ├── middleware/               # Auth and routing middleware
│   ├── routes/                   # Page components (file-based routing)
│   ├── store/                    # Redux store configuration
│   ├── types/                    # TypeScript type definitions
│   ├── utils/                    # Utility functions
│   ├── router.tsx                # Router configuration
│   ├── routeTree.gen.ts          # Auto-generated route tree
│   ├── server.ts                 # Server entry point
│   └── start.ts                  # Client entry point
├── public/                       # Static assets (if any)
├── package.json                  # Dependencies and scripts
├── tsconfig.json                 # TypeScript configuration
├── vite.config.ts                # Vite configuration
├── eslint.config.js              # ESLint configuration
├── components.json               # Shadcn UI configuration
└── wrangler.jsonc                # Cloudflare Workers config
```

---

## 📂 Detailed Directory Breakdown

### **src/api/** - API Communication
Handles all backend communication and error handling.

| File | Purpose |
|------|---------|
| `client.ts` | HTTP client with GET, POST, PUT, DELETE methods |
| `errors.ts` | Custom error types and error handling utilities |
| `index.ts` | Export API utilities |

**Usage:** Centralized API calls with error handling and request/response interceptors.

---

### **src/assets/** - Static Media
Images and media files used throughout the application.

| Asset | Used In |
|-------|---------|
| `hero.jpg` | Home page, Login page |
| `mystery.jpg` | Dashboard, Lobby, Results, Join page |
| `cook.jpg` | Home page, Login page |
| `cta.jpg` | Home page (Call-to-Action section) |
| `calculator.png` | Home page (icons) |
| `secret_box.png` | Game page (secret box animation) |
| `mystery-box.png` | Game components |

---

### **src/components/** - React Components

#### **Root Components**
| Component | Purpose |
|-----------|---------|
| `Crumbs.tsx` | Breadcrumb navigation component |
| `DashboardShell.tsx` | Layout wrapper for dashboard pages |
| `Footer.tsx` | Site footer with links and info |
| `Header.tsx` | Page header with navigation |
| `Logo.tsx` | Zoventro logo component |
| `PillButton.tsx` | Custom pill-shaped button |

#### **src/components/ui/** - Shadcn UI Components
45+ reusable UI components from Radix UI, styled with Tailwind CSS.

**Key Components:**
- `button.tsx` - Primary button component
- `card.tsx` - Card container
- `dialog.tsx` - Modal dialogs
- `form.tsx` - Form wrapper with React Hook Form
- `input.tsx` - Text input
- `select.tsx` - Dropdown select
- `table.tsx` - Data table
- `tabs.tsx` - Tab navigation
- `sonner.tsx` - Toast notifications
- `sidebar.tsx` - Navigation sidebar
- `breadcrumb.tsx` - Breadcrumb navigation
- And 30+ more specialized components

#### **src/components/common/** - Shared Components
`index.ts` - Exports common components (currently empty, ready for expansion)

#### **src/components/features/** - Feature Components
`index.ts` - Exports feature-specific components (currently empty, ready for expansion)

#### **src/components/layouts/** - Layout Components
`index.ts` - Exports layout components (currently empty, ready for expansion)

---

### **src/config/** - Configuration

| File | Purpose |
|------|---------|
| `environment.ts` | Environment variables and configuration |

---

### **src/constants/** - Application Constants

| File | Purpose |
|------|---------|
| `index.ts` | Export application-wide constants |

**Used For:** Routes, API endpoints, default values, magic strings

---

### **src/hooks/** - Custom React Hooks

| Hook | Purpose |
|------|---------|
| `use-mobile.tsx` | Detect if device is mobile |
| `useAsync.ts` | Handle async operations with loading state |
| `useDebounce.ts` | Debounce values (e.g., search input) |
| `useLocalStorage.ts` | Persist data in browser storage |
| `index.ts` | Export all hooks |

---

### **src/lib/** - Utility Libraries

| File | Purpose |
|------|---------|
| `toast.ts` | Reusable toast notification functions (`toastSuccess`, `toastError`, `toastWarning`, `toastInfo`) |
| `utils.ts` | General utility functions (className merging, etc.) |
| `error-capture.ts` | Error boundary and error capturing utilities |
| `error-page.ts` | Error page component |

---

### **src/middleware/** - Middleware Functions

| File | Purpose |
|------|---------|
| `auth.ts` | Authentication checks and user validation |
| `routes.ts` | Route protection and redirects |

---

### **src/routes/** - Page Components (File-Based Routing)

Each file corresponds to a URL route in the application.

| Route File | URL | Purpose |
|-----------|-----|---------|
| `__root.tsx` | Root layout | App root with Toaster provider |
| `index.tsx` | `/` | Home page with feature overview |
| `login.tsx` | `/login` | Login/OTP authentication |
| `create.tsx` | `/create` | Organizer registration & session setup |
| `dashboard.tsx` | `/dashboard` | Organizer dashboard |
| `lobby.tsx` | `/lobby` | Game lobby before starting |
| `join.tsx` | `/join` | Join session with code |
| `game.tsx` | `/game` | Main mystery quest game page |
| `results.tsx` | `/results` | Game results & leaderboard (story/table view) |
| `participants.tsx` | `/participants` | View session participants |
| `groups.tsx` | `/groups` | Manage groups within session |
| `profile.tsx` | `/profile` | User profile & settings |
| `payments.tsx` | `/payments` | Payment history & invoices (CSV export) |
| `privacy.tsx` | `/privacy` | Privacy policy page |
| `terms.tsx` | `/terms` | Terms of service page |

---

### **src/store/** - Redux State Management

| File | Purpose |
|------|---------|
| `index.ts` | Redux store configuration |
| `hooks.ts` | Redux hooks (`useAppDispatch`, `useAppSelector`) |
| `selectors.ts` | Redux selectors for state queries |

#### **src/store/slices/** - Redux Slices

| File | Purpose |
|------|---------|
| `authSlice.ts` | Authentication state (user, token, login status) |
| `gamesSlice.ts` | Games state (list, active game, loading) |

---

### **src/types/** - TypeScript Type Definitions

| File | Purpose |
|------|---------|
| `index.ts` | Export all types |
| `common.ts` | Common types (User, Game, Session, etc.) |
| `api.ts` | API request/response types |

---

### **src/utils/** - Utility Functions

| File | Purpose |
|------|---------|
| `index.ts` | Export all utilities |
| `common.ts` | Common utility functions |
| `validation.ts` | Form validation schemas (Zod) |

---

### **Root-Level Files**

| File | Purpose |
|------|---------|
| `router.tsx` | TanStack Router configuration |
| `routeTree.gen.ts` | Auto-generated route tree (do not edit) |
| `server.ts` | Server entry point for SSR |
| `start.ts` | Client entry point |
| `styles.css` | Global CSS styles |

---

## 🛣️ Routing Map

```
/                          → Home page
├── /login                 → User login
├── /create                → Create session (organizer)
│   ├── Details Step       → Enter session info
│   ├── Verify Step        → Verify details
│   ├── Setup Step         → Configure game
│   └── Payment Step       → Complete payment
├── /dashboard             → Organizer dashboard
│   └── Event Overview     → Session management
├── /join                  → Join existing session
├── /lobby                 → Pre-game lobby
├── /game                  → Main game page
│   ├── Questions View     → Answer questions
│   ├── Summary View       → Score & secret box
│   └── Info Slider Modal  → Rules & guide
├── /results               → Game results
│   ├── Story View         → Narrative + rankings
│   └── Table View         → Detailed leaderboard
├── /participants          → View participants
├── /groups                → Manage groups
├── /profile               → User profile
├── /payments              → Payment history
├── /privacy               → Privacy policy
└── /terms                 → Terms of service
```

---

## 🎯 Key Features

### **Authentication Flow**
1. User enters email on `/login`
2. OTP sent and verified
3. Session token stored
4. Redirected to `/lobby` or `/dashboard`

### **Session Creation Flow**
1. Organizer completes **Details** (company, name, date)
2. System **Verifies** email domain
3. Organizer **Sets Up** game (package selection, timing)
4. Completes **Payment** for activation
5. Receives access link and game code

### **Game Flow**
1. Participant joins via `/join` with session code
2. Waits in `/lobby` until game starts
3. Plays mystery quest on `/game`
4. Reveals secret box in summary view
5. Views results on `/results` (story or table view)

### **Organizer Dashboard**
- View real-time participant count
- Reschedule game
- Manage groups
- Download invoices
- View results and analytics

---

## 📦 Component Architecture

### **UI Component Pattern**
All Radix UI components follow a consistent pattern:
```
src/components/ui/[component].tsx
├── Primitive imports from @radix-ui
├── cn() utility for className merging
├── Component export
└── Ref forwarding for accessibility
```

### **Page Component Pattern**
```
src/routes/[page].tsx
├── Imports (components, hooks, utilities)
├── Route export with createFileRoute()
├── Helper components
└── Main component export
```

---

## 🔄 Data Flow

### **State Management**
```
Redux Store (authSlice, gamesSlice)
    ↓
React Query (optional caching)
    ↓
Component Props
    ↓
Local useState (UI state)
```

### **API Communication**
```
Component
    ↓
API Client (src/api/client.ts)
    ↓
Fetch Request
    ↓
Error Handler (src/api/errors.ts)
    ↓
Redux Store / Local State
    ↓
Toast Notification (src/lib/toast.ts)
```

---

## 🎨 Styling Architecture

**CSS Layers:**
1. **Tailwind CSS** - Utility classes (primary)
2. **Radix UI** - Component styling (automatic)
3. **Global Styles** - `src/styles.css`
4. **Component Styles** - Inline Tailwind classes

**Color Scheme:**
- **Primary:** Purple/Indigo (`from-violet-600 to-purple-900`)
- **Success:** Emerald green
- **Warning:** Amber
- **Error:** Rose/Red
- **Background:** Dark (`#0d0820`)

---

## 🚀 Build & Deployment

### **Available Scripts**
```bash
npm run dev          # Start development server (localhost:8080)
npm run build        # Build for production
npm run build:dev    # Build in development mode
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run format       # Format with Prettier
```

### **Deployment**
- Hosted on **Cloudflare Workers** (via `wrangler.jsonc`)
- Built with Vite for optimal bundling
- Server-side rendering support via `server.ts`

---

## 📝 Configuration Files

| File | Purpose |
|------|---------|
| `tsconfig.json` | TypeScript compiler options |
| `vite.config.ts` | Vite bundler configuration |
| `eslint.config.js` | Code linting rules |
| `components.json` | Shadcn UI component config |
| `wrangler.jsonc` | Cloudflare Workers settings |
| `package.json` | Dependencies and scripts |

---

## 🔐 Security

### **Authentication**
- Email-based OTP verification
- Session tokens stored securely
- Middleware checks on protected routes

### **Payment**
- GST invoice generation
- Secure payment processing
- Invoice download capability

---

## 📊 Database/State Structure

### **User Object**
```typescript
{
  id: string
  email: string
  name: string
  company: string
  role: "organizer" | "participant"
  avatar?: string
}
```

### **Session Object**
```typescript
{
  id: string
  code: string
  title: string
  organizer: User
  startDate: Date
  package: "standard" | "premium" | "enterprise"
  participants: User[]
  status: "draft" | "active" | "completed"
}
```

### **Game Results Object**
```typescript
{
  sessionId: string
  participantId: string
  score: number
  role: string
  badge: string
  rank: number
  timestamp: Date
}
```

---

## 🧪 Testing & Quality

### **ESLint Rules**
- TypeScript strict mode
- Prettier code formatting
- No unused variables
- Accessibility checks (a11y)

### **Type Safety**
- Full TypeScript coverage
- Strict mode enabled
- Type definitions for all APIs

---

## 🎓 Code Organization Principles

1. **Separation of Concerns**
   - Routes handle pages
   - Components handle UI
   - Utils handle logic
   - Store handles global state

2. **DRY (Don't Repeat Yourself)**
   - Reusable components in `src/components/`
   - Shared utilities in `src/utils/`
   - Common types in `src/types/`

3. **Single Responsibility**
   - Each file has one clear purpose
   - Components are focused and composable
   - Functions are pure when possible

4. **Consistent Patterns**
   - All routes use same structure
   - All components use same patterns
   - All utilities have clear exports

---

## 🔗 Important Links & References

- **TanStack Router:** https://tanstack.com/router/latest
- **Radix UI:** https://www.radix-ui.com/
- **Tailwind CSS:** https://tailwindcss.com/
- **Redux Toolkit:** https://redux-toolkit.js.org/
- **React Hook Form:** https://react-hook-form.com/
- **Vite:** https://vitejs.dev/

---

## 📞 Quick Reference

### **Add a New Page**
1. Create `src/routes/[page].tsx`
2. Export route with `createFileRoute()`
3. Add component
4. Route automatically added to app

### **Add a New Component**
1. Create `src/components/[Component].tsx`
2. Export component
3. Import in pages/components as needed

### **Add a New Utility**
1. Create `src/utils/[utility].ts`
2. Export functions
3. Import with `import { ... } from '@/utils'`

### **Add Toast Notification**
```typescript
import { toastSuccess, toastError } from '@/lib/toast'

toastSuccess('Operation completed!')
toastError('Something went wrong')
```

---

**Last Updated:** 27 May 2026  
**Project Version:** 1.0.0  
**Maintained by:** Development Team
