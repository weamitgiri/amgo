# Code Standards & Best Practices

## Naming Conventions

### Files and Folders
- **Components**: PascalCase (e.g., `GameCard.tsx`, `UserProfile.tsx`)
- **Utilities**: camelCase (e.g., `formatDate.ts`, `validateEmail.ts`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)
- **Hooks**: camelCase with `use` prefix (e.g., `useAuth.ts`, `useDebounce.ts`)
- **Folders**: kebab-case (e.g., `game-card/`, `user-profile/`)

### Variables and Functions
```typescript
// ✅ Good naming conventions
const MAX_RETRIES = 3;
const isLoading = true;
const fetchUserData = () => {};
const UserProfile: React.FC = () => {};

// ❌ Avoid
const maxRetries = 3;
const loading = true;
const get_user_data = () => {};
const userProfile = () => {};
```

## Component Structure

### Functional Components
```typescript
import { FC, ReactNode } from 'react';
import { cn } from '@/utils/common';

interface ComponentProps {
  className?: string;
  children?: ReactNode;
  // Other props
}

/**
 * Component description
 * 
 * @example
 * ```tsx
 * <MyComponent prop="value" />
 * ```
 */
export const MyComponent: FC<ComponentProps> = ({
  className,
  children,
  // Other props
}) => {
  return <div className={cn('base-styles', className)}>{children}</div>;
};

export default MyComponent;
```

## Import Organization

```typescript
// 1. React imports
import { FC, useState } from 'react';

// 2. External library imports
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';

// 3. Internal imports (organized by layer)
import { fetchGames } from '@/store/slices/gamesSlice';
import { useAppDispatch } from '@/store/hooks';
import { ROUTES } from '@/constants';
import { cn } from '@/utils/common';
import type { Game } from '@/types/api';
```

## Type Definitions

### Props Types
```typescript
interface ComponentProps {
  // Required props first
  title: string;
  onSubmit: (data: FormData) => void;
  
  // Optional props with defaults
  loading?: boolean;
  variant?: 'primary' | 'secondary';
  
  // Complex types
  items?: Game[];
}
```

### API Types
```typescript
// Always organize by feature
// src/types/api.ts

export interface Game {
  id: string;
  title: string;
  description?: string;
  status: 'active' | 'completed' | 'pending';
  createdAt: string;
  updatedAt: string;
}

export interface CreateGameRequest {
  title: string;
  description?: string;
}
```

## Error Handling

### API Errors
```typescript
import { parseError } from '@/utils/common';

try {
  const data = await gamesApi.getAll();
} catch (error) {
  const message = parseError(error);
  console.error(message);
}
```

### Redux Error Handling
```typescript
export const fetchGames = createAsyncThunk(
  'games/fetchGames',
  async (_, { rejectWithValue }) => {
    try {
      return await gamesApi.getAll();
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch games');
    }
  }
);
```

## Comments and Documentation

### Function Documentation
```typescript
/**
 * Fetches all games from the API
 * 
 * @returns {Promise<Game[]>} Array of games
 * @throws {Error} If the request fails
 * 
 * @example
 * ```typescript
 * const games = await fetchGames();
 * ```
 */
export async function fetchGames(): Promise<Game[]> {
  return gamesApi.getAll();
}
```

### Component Documentation
```typescript
/**
 * GameCard Component
 * 
 * Displays a single game card with title, description, and action buttons.
 * 
 * @component
 * @param {Game} game - The game data to display
 * @param {Function} onSelect - Callback when card is selected
 * 
 * @example
 * ```tsx
 * <GameCard 
 *   game={game} 
 *   onSelect={() => navigate('/games/123')} 
 * />
 * ```
 */
export const GameCard: FC<GameCardProps> = ({ game, onSelect }) => {
  // Implementation
};
```

### Complex Logic Comments
```typescript
// Use for non-obvious logic
if (user.roles.includes('admin') || (user.createdAt && isWithinDays(user.createdAt, 7))) {
  // New admins or users within 7 days can perform special actions
  return true;
}
```

## Code Organization

### Constants
```typescript
// src/constants/index.ts
export const API_CONSTANTS = {
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
} as const;

export const ROUTES = {
  PUBLIC: { ROOT: '/', LOGIN: '/login' },
  PROTECTED: { DASHBOARD: '/dashboard' },
} as const;
```

### Utils
```typescript
// src/utils/common.ts
// Keep utilities small and focused
// One function per concept

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US');
}
```

## Performance Optimization

### Memoization
```typescript
import { memo } from 'react';

interface GameCardProps {
  game: Game;
  onClick: () => void;
}

export const GameCard = memo<GameCardProps>(({ game, onClick }) => {
  return <div onClick={onClick}>{game.title}</div>;
});
```

### useCallback for Handlers
```typescript
import { useCallback } from 'react';

export function GamesList({ games }: { games: Game[] }) {
  const handleSelectGame = useCallback((gameId: string) => {
    navigate(`/games/${gameId}`);
  }, [navigate]);

  return (
    <div>
      {games.map(game => (
        <GameCard 
          key={game.id} 
          game={game} 
          onSelect={() => handleSelectGame(game.id)}
        />
      ))}
    </div>
  );
}
```

## Testing

### Test File Organization
```typescript
// src/components/GameCard.test.tsx
import { render, screen } from '@testing-library/react';
import { GameCard } from './GameCard';

describe('GameCard', () => {
  it('renders game title', () => {
    render(<GameCard game={mockGame} />);
    expect(screen.getByText(mockGame.title)).toBeInTheDocument();
  });
});
```

## Accessibility

### ARIA Labels
```typescript
// ✅ Good
<button aria-label="Close menu">
  <X size={24} />
</button>

// ❌ Avoid
<button>×</button>
```

### Semantic HTML
```typescript
// ✅ Good
<nav>Navigation items</nav>
<main>Main content</main>
<button>Action</button>

// ❌ Avoid
<div>Navigation items</div>
<div>Main content</div>
<div onClick={handleClick}>Action</div>
```

## ESLint Rules

Key rules enforced:
- `react-hooks/rules-of-hooks` - Proper hook usage
- `react-hooks/exhaustive-deps` - Dependencies in useEffect
- `@typescript-eslint/no-unused-vars` - Remove unused code
- `@typescript-eslint/explicit-function-return-types` - Type all functions

## Commit Messages

Follow conventional commits:
```
feat: add new game creation feature
fix: correct loading state in GameCard
docs: update setup instructions
refactor: reorganize API client structure
test: add GameCard tests
```
