# Project Setup & Installation Guide

## Overview
This document provides instructions for setting up the project locally and understanding the development workflow.

## Prerequisites
- Node.js 18+
- npm or yarn
- Git

## Installation Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Install Redux (Required for this architecture)
```bash
npm install @reduxjs/toolkit react-redux
```

If you haven't done so already, run:
```bash
npm install
```

### 3. Setup Environment Variables
```bash
# Copy the example file
cp .env.example .env.local

# Edit .env.local with your local configuration
# VITE_API_BASE_URL=http://localhost:3000/api
# etc.
```

### 4. Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Development Workflow

### Running Tests
```bash
npm run test
```

### Linting & Formatting
```bash
npm run lint      # Run ESLint
npm run format    # Format with Prettier
```

### Building for Production
```bash
npm run build     # Production build
npm run preview   # Preview production build
```

## Project Structure

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed project structure and best practices.

## Key Technologies

- **React 19** - UI library
- **TypeScript** - Type safety
- **TanStack Router** - Routing
- **Redux Toolkit** - State management
- **TanStack Query** - Data fetching (included)
- **Tailwind CSS** - Styling
- **Vite** - Build tool

## Common Tasks

### Adding a New Page
1. Create route file in `src/routes/`
2. Create component in `src/pages/` or `src/components/`
3. Add to router configuration

### Adding a New API Endpoint
1. Create function in `src/api/client.ts`
2. Add types to `src/types/api.ts`
3. Create Redux slice in `src/store/slices/`

### Using Redux State
```typescript
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { fetchGames } from '@/store/slices/gamesSlice';

function MyComponent() {
  const dispatch = useAppDispatch();
  const games = useAppSelector(state => state.games);
  
  useEffect(() => {
    dispatch(fetchGames());
  }, [dispatch]);
  
  return <div>{/* ... */}</div>;
}
```

## Troubleshooting

### Port Already in Use
```bash
npm run dev -- --port 5174
```

### Clear Cache
```bash
rm -rf node_modules
npm install
```

## Environment Variables Reference

| Variable | Description | Default |
|----------|-------------|---------|
| VITE_API_BASE_URL | Backend API URL | http://localhost:3000/api |
| VITE_API_TIMEOUT | Request timeout (ms) | 30000 |
| VITE_AUTH_TOKEN_KEY | Auth token storage key | auth_token |
| VITE_ENABLE_ANALYTICS | Enable analytics | false |
| VITE_ENVIRONMENT | Environment (dev/staging/prod) | development |

## Additional Resources

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Project architecture
- [TanStack Router Docs](https://tanstack.com/router/latest)
- [Redux Toolkit Docs](https://redux-toolkit.js.org/)
- [React Documentation](https://react.dev)
