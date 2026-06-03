# Z-Game - Professional React Application

A production-ready React.js application with professional scalable architecture, built with TypeScript, Redux Toolkit, and TanStack Router.

## 🚀 Features

- **Professional Architecture**: Clean, scalable folder structure following industry best practices
- **Redux Toolkit**: Centralized state management with slices and async thunks
- **Type Safety**: Full TypeScript support with comprehensive type definitions
- **API Service Layer**: Centralized HTTP client with error handling and interceptors
- **Authentication**: Built-in authentication middleware with token management
- **Protected Routes**: Role-based access control and route protection
- **Custom Hooks**: Reusable hooks for common operations (useAsync, useDebounce, useLocalStorage)
- **Tailwind CSS**: Modern styling with Tailwind CSS and shadcn/ui components
- **TanStack Router**: Enterprise-grade routing solution
- **Environment Configuration**: Environment-based configuration management
- **Code Standards**: ESLint and Prettier for consistent code quality

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- Git

## 🛠️ Installation

### 1. Install Dependencies
```bash
npm install
```

### 2. Install Redux Packages (if not already installed)
```bash
npm install @reduxjs/toolkit react-redux
```

### 3. Setup Environment Variables
```bash
# Copy the example environment file
cp .env.example .env.local

# Edit .env.local with your configuration
# Example:
# VITE_API_BASE_URL=http://localhost:3000/api
# VITE_AUTH_TOKEN_KEY=auth_token
# VITE_ENVIRONMENT=development
```

### 4. Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 📁 Project Structure

```
src/
├── api/                    # API client and endpoints
├── components/             # React components
│   ├── common/            # Reusable components
│   ├── features/          # Feature-specific components
│   ├── layouts/           # Layout components
│   └── ui/                # UI primitives
├── config/                # Configuration
├── constants/             # App constants
├── hooks/                 # Custom hooks
├── middleware/            # Authentication & routing
├── routes/                # Page routes
├── store/                 # Redux store
├── types/                 # TypeScript types
├── utils/                 # Utility functions
├── pages/                 # Page components
├── assets/                # Static assets
└── styles/                # Global styles
```

For detailed architecture documentation, see [ARCHITECTURE.md](./ARCHITECTURE.md).

## 🏗️ Architecture Overview

### State Management (Redux)
- **store/slices/**: Redux slices for different features
- **store/hooks.ts**: Type-safe Redux hooks
- Async thunks for API calls
- Centralized state management

### API Layer
- **api/client.ts**: Centralized HTTP client
- Request/response interceptors
- Error handling
- Token management

### Authentication
- Token-based authentication
- Token refresh mechanism
- Protected routes
- Role-based access control

### Routing
- TanStack Router for navigation
- Protected/public route separation
- Route middleware for access control
- Automatic code splitting

## 💡 Usage Examples

### Using Redux State
```typescript
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchGames } from '@/store/slices/gamesSlice';

function GamesList() {
  const dispatch = useAppDispatch();
  const games = useAppSelector(state => state.games);

  useEffect(() => {
    dispatch(fetchGames());
  }, [dispatch]);

  return <div>{/* render games */}</div>;
}
```

### Using API Client
```typescript
import { gamesApi } from '@/api/client';

async function loadGames() {
  try {
    const games = await gamesApi.getAll();
    // Handle games
  } catch (error) {
    // Handle error
  }
}
```

### Using Custom Hooks
```typescript
import { useAsync, useDebounce, useLocalStorage } from '@/hooks';

function SearchComponent() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 500);
  
  const { data: results, loading, error } = useAsync(
    () => gamesApi.search(debouncedQuery),
    { immediate: false }
  );

  return <div>{/* render results */}</div>;
}
```

### Protected Routes
Routes are automatically protected based on configuration in `src/middleware/routes.ts`. Add your protected routes there.

## 📖 Documentation

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Detailed architecture and design patterns
- **[SETUP.md](./SETUP.md)** - Setup and development workflow
- **[CODE_STANDARDS.md](./CODE_STANDARDS.md)** - Code style and best practices

## 🔧 Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint

# Format code
npm run format

# Build for development
npm run build:dev
```

## 🎯 Key Technologies

| Technology | Purpose |
|-----------|---------|
| React 19 | UI library |
| TypeScript | Type safety |
| Redux Toolkit | State management |
| TanStack Router | Routing |
| TanStack Query | Data fetching |
| Tailwind CSS | Styling |
| Vite | Build tool |
| shadcn/ui | UI components |

## 🔐 Authentication Flow

1. **Login**: User credentials → API → Token received
2. **Token Storage**: Token stored in localStorage and Redux
3. **API Requests**: Token automatically included in headers
4. **Token Refresh**: Automatic refresh on 401 response
5. **Logout**: Clear tokens and redirect to login

## 🛡️ Security Features

- Token-based authentication
- Automatic token refresh
- Protected API routes
- Role-based access control
- CORS support
- XSS protection via React

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Environment Configuration
Update `.env` file with production values:
```
VITE_API_BASE_URL=https://api.example.com
VITE_ENVIRONMENT=production
VITE_ENABLE_ERROR_REPORTING=true
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

## 📚 Best Practices

### Naming Conventions
- Components: PascalCase (e.g., `GameCard.tsx`)
- Hooks: camelCase with `use` prefix (e.g., `useAuth.ts`)
- Utils: camelCase (e.g., `formatDate.ts`)
- Constants: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)

### Import Organization
```typescript
// React
import { FC, useState } from 'react';

// External libraries
import { useNavigate } from '@tanstack/react-router';

// Internal (organized by layer)
import { fetchGames } from '@/store/slices/gamesSlice';
import { ROUTES } from '@/constants';
import { formatDate } from '@/utils';
```

### Component Structure
```typescript
import { FC } from 'react';

interface ComponentProps {
  // Props definition
}

/**
 * Component description
 */
export const MyComponent: FC<ComponentProps> = (props) => {
  // Implementation
  return <div></div>;
};
```

## 🐛 Troubleshooting

### Port Already in Use
```bash
npm run dev -- --port 5174
```

### Redux DevTools
Redux DevTools will be enabled in development. Download the browser extension for debugging.

### Build Issues
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

## 📝 Environment Variables

See [.env.example](./.env.example) for all available environment variables.

Key variables:
- `VITE_API_BASE_URL` - Backend API URL
- `VITE_AUTH_TOKEN_KEY` - Storage key for auth token
- `VITE_ENVIRONMENT` - Environment (development/staging/production)

## 🤝 Contributing

When adding new features:

1. Follow the project structure
2. Add types in `src/types/`
3. Create API endpoints in `src/api/client.ts`
4. Create Redux slice in `src/store/slices/`
5. Create components in appropriate folders
6. Add unit tests
7. Update documentation
8. Follow code standards (see [CODE_STANDARDS.md](./CODE_STANDARDS.md))

## 📄 License

Private project. All rights reserved.

## 📞 Support

For issues or questions:
1. Check [ARCHITECTURE.md](./ARCHITECTURE.md)
2. Review [CODE_STANDARDS.md](./CODE_STANDARDS.md)
3. Check error logs in browser console

## 🎓 Learning Resources

- [React Documentation](https://react.dev)
- [Redux Toolkit Docs](https://redux-toolkit.js.org/)
- [TanStack Router Docs](https://tanstack.com/router/latest)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com)

---

**Happy coding!** 🚀
