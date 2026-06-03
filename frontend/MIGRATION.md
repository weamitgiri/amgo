# Migration Guide: From Old Structure to New Architecture

This guide will help you migrate your existing project to the new professional architecture.

## Overview

The new architecture is organized around:
1. **API Layer** - All backend communication
2. **State Management** - Redux Toolkit for global state
3. **Components** - Organized by type and feature
4. **Utilities & Hooks** - Reusable logic
5. **Types** - Centralized type definitions
6. **Configuration** - Environment and app settings

## Step-by-Step Migration

### Step 1: Move Components

Organize your existing components into the new structure:

```
OLD:
src/components/
├── Header.tsx
├── Footer.tsx
├── Logo.tsx
├── PillButton.tsx
├── Crumbs.tsx
└── DashboardShell.tsx

NEW:
src/components/
├── common/
│   ├── index.ts
│   ├── Logo.tsx
│   ├── PillButton.tsx
│   ├── Crumbs.tsx
│   └── ...
├── layouts/
│   ├── index.ts
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── DashboardShell.tsx
│   └── ...
└── features/
    ├── index.ts
    └── [organize by feature]
```

**Action Items:**
1. Move `Header.tsx`, `Footer.tsx`, `DashboardShell.tsx` to `components/layouts/`
2. Move `Logo.tsx`, `PillButton.tsx`, `Crumbs.tsx` to `components/common/`
3. Update imports throughout your project

### Step 2: Centralize API Calls

**OLD WAY** (Avoid):
```typescript
// Components making API calls directly
fetch('/api/games')
  .then(res => res.json())
  .then(data => setGames(data))
```

**NEW WAY** (Use):
```typescript
// All API calls go through the service layer
import { gamesApi } from '@/api/client';

const games = await gamesApi.getAll();
```

**Action Items:**
1. Remove any direct `fetch()` calls from components
2. Use the centralized API client in `src/api/client.ts`
3. Add new API endpoints to `src/api/client.ts`

### Step 3: Setup Redux State

**OLD WAY** (Avoid):
```typescript
const [games, setGames] = useState([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
```

**NEW WAY** (Use):
```typescript
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchGames } from '@/store/slices/gamesSlice';

const dispatch = useAppDispatch();
const games = useAppSelector(state => state.games);
```

**Action Items:**
1. Create Redux slices for your features (see `src/store/slices/gamesSlice.ts`)
2. Replace useState + API calls with Redux
3. Use the custom Redux hooks from `src/store/hooks.ts`

### Step 4: Update Routes

The new routing structure uses TanStack Router with protected routes.

**Update routes to use the new constants:**
```typescript
import { ROUTES } from '@/constants';

// Navigate to protected routes
navigate({ to: ROUTES.PROTECTED.DASHBOARD });
navigate({ to: ROUTES.PUBLIC.LOGIN });
```

### Step 5: Update Imports

Replace old imports with new structured imports:

**OLD:**
```typescript
import { utils } from '../../lib/utils';
import { MyComponent } from '../../../components/MyComponent';
```

**NEW:**
```typescript
import { cn } from '@/utils/common';
import { MyComponent } from '@/components/common/MyComponent';
```

### Step 6: Add Types

Move type definitions to the centralized location:

**OLD:**
```typescript
// Types scattered throughout the project
interface Game { ... }
interface User { ... }
```

**NEW:**
```typescript
// src/types/api.ts - For API types
export interface Game { ... }

// src/types/common.ts - For common types
export interface User { ... }
```

### Step 7: Extract Utilities

Move utility functions to `src/utils/`:

**OLD:**
```typescript
// In various component files
const formatDate = (date) => { ... }
const validateEmail = (email) => { ... }
```

**NEW:**
```typescript
// src/utils/common.ts
export function formatDate(date: Date | string): string { ... }

// src/utils/validation.ts
export function validateEmail(email: string): ValidationResult { ... }
```

## File-by-File Migration

### Migrating a Page Component

**BEFORE:**
```typescript
// src/routes/games.tsx
import { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

export function GamesPage() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch('/api/games')
      .then(r => r.json())
      .then(data => {
        setGames(data);
        setLoading(false);
      });
  }, []);

  return (
    <>
      <Header />
      <main>
        {loading && <p>Loading...</p>}
        {games.map(game => <div key={game.id}>{game.title}</div>)}
      </main>
      <Footer />
    </>
  );
}
```

**AFTER:**
```typescript
// src/routes/game.tsx
import { FC, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchGames } from '@/store/slices/gamesSlice';
import { Header } from '@/components/layouts/Header';
import { Footer } from '@/components/layouts/Footer';
import { Skeleton } from '@/components/ui/skeleton';

export const GamesRoute: FC = () => {
  const dispatch = useAppDispatch();
  const { data: games, loading } = useAppSelector(state => state.games.list);

  useEffect(() => {
    dispatch(fetchGames());
  }, [dispatch]);

  return (
    <>
      <Header />
      <main>
        {loading && (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        )}
        {games?.map(game => (
          <div key={game.id} className="p-4 border rounded">
            {game.title}
          </div>
        ))}
      </main>
      <Footer />
    </>
  );
};

export default GamesRoute;
```

### Migrating a Component

**BEFORE:**
```typescript
// src/components/GameCard.tsx
import { useState } from 'react';

export function GameCard({ game }) {
  const [selected, setSelected] = useState(false);

  return (
    <div onClick={() => setSelected(!selected)}>
      <h3>{game.title}</h3>
      {selected && <p>{game.description}</p>}
    </div>
  );
}
```

**AFTER:**
```typescript
// src/components/features/GameCard.tsx
import { FC } from 'react';
import type { Game } from '@/types/api';
import { Card } from '@/components/ui/card';

interface GameCardProps {
  game: Game;
  onSelect?: () => void;
}

export const GameCard: FC<GameCardProps> = ({ game, onSelect }) => {
  return (
    <Card className="cursor-pointer hover:shadow-lg" onClick={onSelect}>
      <h3 className="font-semibold">{game.title}</h3>
      {game.description && <p className="text-sm text-gray-600">{game.description}</p>}
    </Card>
  );
};

export default GameCard;
```

## Checklist

- [ ] All components moved to appropriate folders
- [ ] All imports updated to use `@/` alias
- [ ] Redux slices created for main features
- [ ] API calls moved to `src/api/client.ts`
- [ ] Types centralized in `src/types/`
- [ ] Utilities moved to `src/utils/`
- [ ] Environment variables configured in `.env.local`
- [ ] Redux Toolkit installed (`npm install @reduxjs/toolkit react-redux`)
- [ ] Routes protected with middleware
- [ ] Documentation updated

## Common Issues & Solutions

### Issue: Import not found
**Solution:** Make sure you're using the `@/` alias. Check `tsconfig.json` has the path configured:
```json
"paths": {
  "@/*": ["./src/*"]
}
```

### Issue: Redux store not initialized
**Solution:** Wrap your app with Redux Provider:
```typescript
import { Provider } from 'react-redux';
import { store } from '@/store';

<Provider store={store}>
  <App />
</Provider>
```

### Issue: Types not recognized
**Solution:** Make sure types are imported correctly:
```typescript
import type { Game } from '@/types/api';
```

### Issue: API client throwing errors
**Solution:** Check that:
1. Environment variables are set in `.env.local`
2. API base URL is correct
3. Backend server is running

## Next Steps

1. Review [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed structure
2. Read [CODE_STANDARDS.md](./CODE_STANDARDS.md) for best practices
3. Check example files in `src/components/features/EXAMPLE_*`
4. Install Redux: `npm install @reduxjs/toolkit react-redux`
5. Start using the new architecture for new features

## Need Help?

- Review the example files: `EXAMPLE_*.tsx`
- Check the documentation files: `ARCHITECTURE.md`, `CODE_STANDARDS.md`
- Look at existing slices in `src/store/slices/`
- Review API client in `src/api/client.ts`
