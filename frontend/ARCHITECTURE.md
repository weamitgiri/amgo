# Project Architecture & Structure Guide

## Overview

This document describes the professional, scalable architecture of the zgame application. The project follows industry best practices for React applications with TypeScript.

## Directory Structure

```
src/
├── api/                    # API service layer and client
│   └── client.ts          # Centralized API client with request handling
├── components/
│   ├── common/            # Reusable UI components used across pages
│   ├── features/          # Feature-specific components (organized by feature)
│   ├── layouts/           # Page layout components
│   └── ui/                # UI primitives (from shadcn/ui)
├── config/                # Application configuration
│   └── environment.ts     # Environment variables and configuration
├── constants/             # Application-wide constants
│   └── index.ts          # Routes, messages, storage keys, etc.
├── hooks/                 # Custom React hooks
│   ├── useAsync.ts
│   ├── useDebounce.ts
│   ├── useLocalStorage.ts
│   └── index.ts           # Barrel export
├── middleware/            # Application middleware
│   ├── auth.ts           # Authentication logic
│   └── routes.ts         # Route protection and guards
├── routes/                # TanStack Router configuration
│   ├── __root.tsx        # Root layout route
│   └── [other routes]    # Page routes
├── store/                 # Redux store configuration
│   ├── index.ts          # Store setup
│   ├── hooks.ts          # Custom Redux hooks
│   └── slices/           # Redux slices
│       ├── authSlice.ts
│       └── gamesSlice.ts
├── styles/                # Global styles and theme
│   └── globals.css
├── types/                 # TypeScript type definitions
│   ├── common.ts         # Common types used throughout app
│   └── api.ts            # API request/response types
├── utils/                 # Utility functions
│   ├── common.ts         # Common utility functions
│   └── validation.ts     # Form validation utilities
├── pages/                 # Page component wrapper (if needed)
├── assets/                # Static assets
├── router.tsx             # Router configuration
├── start.ts               # Application start/server setup
└── server.ts              # Server entry point
```

## Architecture Principles

### 1. **Separation of Concerns**
- Each directory has a specific responsibility
- Components are organized by type and feature
- API logic is isolated in the `api/` directory
- State management is centralized in the `store/`

### 2. **Scalability**
- Feature-based organization allows easy addition of new features
- Redux Toolkit for predictable state management
- Custom hooks for reusable logic
- API service layer for easy backend integration

### 3. **Maintainability**
- Clear naming conventions
- Comprehensive type definitions
- Documented functions and components
- Consistent code structure

### 4. **Type Safety**
- Full TypeScript support
- Centralized type definitions
- Type-safe Redux hooks
- API response types validation

## Key Directories Explained

### `/api`
Contains the HTTP client and API endpoints. All backend communication goes through this layer.

```typescript
// Example usage
import { gamesApi } from '@/api/client';
const games = await gamesApi.getAll();
```

### `/store`
Redux store configuration with slices for different features. Uses Redux Toolkit for simplified setup.

```typescript
// Example usage
import { useAppDispatch, useAppSelector } from '@/store/hooks';
const dispatch = useAppDispatch();
const games = useAppSelector(state => state.games);
```

### `/middleware`
Handles cross-cutting concerns like authentication, route protection, and permissions.

### `/hooks`
Custom React hooks for common operations:
- `useAsync` - Manage async operations
- `useLocalStorage` - Browser storage management
- `useDebounce` - Debounce values

### `/components`

#### common/
Reusable components used in multiple places:
- Navigation components
- Buttons, cards, etc.
- Common utilities

#### features/
Feature-specific components:
```
features/
├── games/
│   ├── GameCard.tsx
│   ├── GamesList.tsx
│   └── index.ts
└── [other features]/
```

#### layouts/
Page layout components:
- Header, Footer
- Sidebar
- Dashboard Shell

### `/types`
TypeScript definitions:
- `common.ts` - Shared types (User, Auth, etc.)
- `api.ts` - API request/response types

### `/utils`
Pure utility functions:
- String formatting
- Validation
- Date formatting
- Storage helpers

## Configuration Files

### Environment Variables (`.env`)
```
VITE_API_BASE_URL=http://localhost:3000/api
VITE_AUTH_TOKEN_KEY=auth_token
VITE_APP_NAME=zgame
```

Copy `.env.example` to `.env.local` and update values.

## Data Flow

### Authentication Flow
1. User logs in → `authApi.login()`
2. Credentials sent to backend
3. Token received and stored → Redux state updated
4. Token set in API client headers
5. Redirected to dashboard

### Data Fetching Flow
1. Component triggers `useAppDispatch(fetchGames)`
2. Async thunk calls `gamesApi.getAll()`
3. API client makes HTTP request
4. Response stored in Redux
5. Component reads state via `useAppSelector`

## Best Practices

### Imports
Use absolute imports with `@` alias:
```typescript
// ✅ Good
import { Button } from '@/components/common';
import { useAuth } from '@/store/hooks';

// ❌ Avoid
import Button from '../../../components/common/Button';
```

### API Calls
All API calls go through the service layer:
```typescript
// ✅ Good
import { gamesApi } from '@/api/client';

// ❌ Avoid
fetch('http://localhost:3000/api/games');
```

### State Management
Use Redux Toolkit for app-level state:
```typescript
// ✅ Good
const dispatch = useAppDispatch();
dispatch(fetchGames());

// ❌ Avoid
useState for global state
```

### Error Handling
Centralized error handling:
```typescript
// ✅ Good
const error = useAppSelector(state => state.games.list.error);

// ❌ Avoid
Multiple try-catch blocks
```

## Adding New Features

### 1. Create Feature Slice
`src/store/slices/featureSlice.ts`

### 2. Add API Endpoints
`src/api/client.ts`

### 3. Create Feature Components
`src/components/features/feature/`

### 4. Create Feature Routes
`src/routes/feature.tsx`

### 5. Update Type Definitions
`src/types/api.ts`

## Deployment

### Build Process
```bash
npm run build
```

### Environment Variables
Set appropriate environment variables for each deployment environment.

### Production Checklist
- [ ] Environment variables configured
- [ ] Redux DevTools disabled
- [ ] Error reporting enabled
- [ ] Analytics configured
- [ ] API endpoints verified
