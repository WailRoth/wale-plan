# API Contracts - Main Web Application

*Generated as part of comprehensive project documentation*

## API Overview

This project uses **tRPC** as the primary API framework with **Better Auth** for authentication. The API provides type-safe endpoints for project management, resource scheduling, and team collaboration.

### Base Configuration

- **API Base URL:** `/api/trpc`
- **Authentication Base URL:** `/api/auth`
- **Framework:** tRPC v11 with React Query integration
- **Authentication:** Better Auth v1.3 with session management
- **Serialization:** SuperJSON for type transport

## Authentication System

### Authentication Provider: Better Auth

**Authentication Features:**
- Email/password authentication with email verification
- Organization management (teams, roles, permissions)
- Session management with 7-day expiration
- User registration, login, logout
- Organization invitations and team collaboration
- Social login support (configurable)

### Session Requirements

- **Storage:** Cookie-based sessions
- **Duration:** 7 days (configurable)
- **Verification:** Email verification required for new accounts
- **Organization Support:** Full organization management with teams and roles

### Authentication Endpoints

All authentication endpoints are handled by Better Auth at `/api/auth/[...all]/route.ts`:

- **POST** `/api/auth/sign-up` - User registration
- **POST** `/api/auth/sign-in` - User login
- **POST** `/api/auth/sign-out` - User logout
- **GET** `/api/auth/session` - Get current session
- **POST** `/api/auth/verify-email` - Email verification
- **POST** `/api/auth/forgot-password` - Password reset
- **Organization endpoints** - Team management, invitations, roles

## tRPC API Procedures

### Post Router (`post`)

All post procedures are available at `/api/trpc/post.{procedure-name}`

#### 1. Public Procedures

##### `hello`
- **Type:** Query
- **Authentication:** None required
- **Input:** `{ text: string }`
- **Response:** `{ greeting: string }`
- **Usage:** Public greeting endpoint, typically for testing

**Example Request:**
```typescript
const greeting = await trpc.post.hello.query({ text: "World" });
// Returns: { greeting: "Hello World" }
```

#### 2. Protected Procedures

All protected procedures require a valid authenticated session.

##### `create`
- **Type:** Mutation
- **Authentication:** Required
- **Input:** `{ name: string (min 1 char) }`
- **Response:** `void`
- **Purpose:** Create a new post/resource

**Example Request:**
```typescript
await trpc.post.create.mutate({ name: "New Project Task" });
```

##### `getLatest`
- **Type:** Query
- **Authentication:** Required
- **Input:** None
- **Response:** `Post | null`
- **Purpose:** Get the most recent post/resource for the current user

**Example Request:**
```typescript
const latestPost = await trpc.post.getLatest.query();
// Returns: Post object or null if none exists
```

##### `getSecretMessage`
- **Type:** Query
- **Authentication:** Required
- **Input:** None
- **Response:** `string`
- **Purpose:** Get a protected message (demonstrates authentication)

**Example Request:**
```typescript
const secret = await trpc.post.getSecretMessage.query();
// Returns: Protected message string
```

## Data Models

### Post Entity

```typescript
interface Post {
  id: number;              // Auto-generated primary key
  name: string;            // Max 256 characters
  createdById: string;     // References user.id
  createdAt: Date;         // Timestamp with timezone
  updatedAt: Date;         // Timestamp with timezone
}
```

### User Entity

```typescript
interface User {
  id: string;              // Primary key
  name: string;            // User display name
  email: string;           // Unique email address
  emailVerified: boolean;  // Email verification status
  image?: string;          // Optional avatar URL
  createdAt: Date;         // Account creation timestamp
  updatedAt: Date;         // Last update timestamp
}
```

### Organization Entity

```typescript
interface Organization {
  id: number;              // Auto-generated primary key
  name: string;            // Max 256 characters
  description?: string;    // Optional description
  slug: string;            // Max 100 characters, unique
  createdAt: Date;         // Timestamp with timezone
  updatedAt: Date;         // Timestamp with timezone
}
```

## Client Configuration

### React Query Integration

The project uses TanStack React Query v5 for client-side state management:

```typescript
// Client setup in src/trpc/query-client.ts
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 5 * 60 * 1000 }, // 5 minutes
    mutations: {},
  },
});
```

### tRPC Client

```typescript
// tRPC client configuration
const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${getBaseUrl()}/api/trpc`,
      headers: () => {
        return {
          cookie: headers().cookie,
          'x-trpc-source': 'react',
        };
      },
    }),
  ],
});
```

## API Usage Examples

### Setting up the client

```typescript
import { trpc } from '@/trpc/react';

function MyComponent() {
  // Protected query
  const { data: latestPost, isLoading } = trpc.post.getLatest.useQuery();

  // Protected mutation
  const createPost = trpc.post.create.useMutation();

  const handleCreate = async (name: string) => {
    await createPost.mutateAsync({ name });
  };

  // Public query
  const { data: greeting } = trpc.post.hello.useQuery(
    { text: "Client" },
    { enabled: false } // Manual trigger
  );
}
```

### Error Handling

tRPC provides built-in error handling with proper TypeScript typing:

```typescript
try {
  const result = await trpc.post.create.mutate({ name: "Test" });
} catch (error) {
  if (error instanceof TRPCError) {
    console.error('tRPC Error:', error.code, error.message);
  }
}
```

## File Structure

```
src/
├── server/api/
│   ├── trpc.ts              # tRPC configuration and context
│   ├── root.ts              # Main router aggregator
│   └── routers/
│       └── post.ts          # Post-related procedures
├── app/api/
│   ├── trpc/[trpc]/route.ts # tRPC HTTP endpoint handler
│   └── auth/[...all]/route.ts # Better Auth endpoint handler
├── server/better-auth/
│   ├── client.ts            # Auth client configuration
│   └── config.ts            # Better Auth configuration
└── trpc/
    ├── query-client.ts      # React Query client setup
    ├── react.ts            # React hooks setup
    └── server.ts           # Server-side tRPC setup
```

## Security Features

- **Type Safety:** Full end-to-end TypeScript validation
- **Input Validation:** Zod schemas for all inputs
- **Authentication:** Session-based with secure cookie handling
- **Authorization:** Role-based access control through Better Auth
- **CSRF Protection:** Built-in tRPC security measures
- **Rate Limiting:** Configurable through Better Auth

## Development Considerations

- All mutations and most queries require authentication
- Input validation is handled automatically through Zod schemas
- Error responses follow tRPC's standardized format
- Client-side caching is managed by React Query with appropriate stale times
- Type safety is maintained from database to frontend components

---

*This documentation covers the current API contracts. Additional procedures may be added as the application grows.*