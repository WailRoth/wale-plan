# State Management Patterns - Main Web Application

*Generated as part of comprehensive project documentation*

## State Management Architecture Overview

This Next.js application uses a **modern, layered approach to state management** that combines multiple patterns optimized for different use cases. The architecture prioritizes type safety, performance, and developer experience over traditional monolithic state management libraries.

### Core Philosophy

- **Server-First Approach**: Leverage Next.js server components and tRPC
- **Type Safety**: End-to-end TypeScript inference from database to UI
- **Performance**: Intelligent caching and query optimization
- **Simplicity**: Use the right tool for each specific use case

## Primary State Management Stack

### 1. tRPC + React Query (Server State Management)

**Primary Technology**: `@trpc/react-query` v11 + `@tanstack/react-query` v5

**Configuration Location**: `/src/trpc/react.tsx`

```typescript
// Singleton pattern for browser query client
export function getTRPCClient() {
  if (browserClient) return browserClient;

  browserClient = createTRPCReact<AppRouter>();

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30 * 1000, // 30 seconds
        refetchOnWindowFocus: false
      },
    },
  });

  browserClient = createTRPCClient<AppRouter>({
    links: [
      httpBatchLink({
        url: `${getBaseUrl()}/api/trpc`,
        headers: () => ({
          cookie: headers().cookie,
          'x-trpc-source': 'react',
        }),
      }),
    ],
  });

  return browserClient;
}
```

**Key Features:**
- **Automatic Caching**: 30-second stale time with intelligent refetching
- **Optimistic Updates**: Built-in optimistic updates with `utils.post.invalidate()`
- **Type Safety**: Full TypeScript inference from API procedures
- **Batching**: HTTP batch streaming for efficient API calls
- **Error Handling**: Built-in error boundaries and retry logic

### 2. Better Auth (Authentication State)

**Primary Technology**: `better-auth` v1.3

**Configuration Location**: `/src/server/better-auth/`

**Authentication Features:**
- **Session Management**: Cookie-based 7-day sessions
- **Multi-provider Support**: Email/password + GitHub OAuth
- **Organization Management**: Teams, roles, and permissions
- **Database Integration**: Drizzle ORM adapter for persistence

**Session Flow:**
```typescript
// Server-side session check
export const getSession = cache(async () =>
  auth.api.getSession({ headers: await headers() }),
);

// Client-side usage in components
const { data: session } = trpc.auth.getSession.useQuery();
```

## State Management Layers

### 1. Server State Layer (tRPC + React Query)

**Purpose**: Manage all server-side data and API interactions

**Components:**
- **tRPC Router**: Type-safe API procedures
- **React Query**: Client-side caching and synchronization
- **Server Actions**: Server-side data mutations

**Usage Patterns:**
```typescript
// Query pattern
const { data: posts, isLoading } = trpc.post.getAll.useQuery();

// Mutation pattern with optimistic updates
const createPost = trpc.post.create.useMutation({
  onSuccess: async () => {
    await utils.post.invalidate();
  },
});

// Server action pattern
const handleCreate = async (data: CreatePostInput) => {
  await createPost.mutateAsync(data);
};
```

### 2. Authentication State Layer (Better Auth)

**Purpose**: Handle user authentication, sessions, and authorization

**Components:**
- **Session Provider**: Global authentication context
- **Route Guards**: Protected route components
- **Authorization Hooks**: Role-based access control

**Usage Patterns:**
```typescript
// Protected component pattern
export default async function Dashboard() {
  const session = await getSession();
  if (!session) {
    redirect("/auth");
  }

  return <DashboardContent user={session.user} />;
}

// Client-side auth checks
const { data: session } = useSession();
if (!session) return <LoginForm />;
```

### 3. Form State Layer (React Hook Form)

**Primary Technology**: `react-hook-form` with Zod validation

**Configuration Location**: `/src/components/ui/form.tsx`

**Features:**
- **Context-based Form Management**: Shared form state context
- **Validation Integration**: Zod schema validation
- **Custom Hooks**: `useFormField` for state access
- **Performance Optimized**: Uncontrolled inputs with minimal re-renders

**Usage Patterns:**
```typescript
// Form setup with validation
const form = useForm<CreatePostInput>({
  resolver: zodResolver(createPostSchema),
  defaultValues: { name: "" },
});

// Form submission with state management
const onSubmit = async (data: CreatePostInput) => {
  await createPost.mutateAsync(data);
  form.reset();
};
```

### 4. Local Component State Layer

**Purpose**: Manage UI-specific state that doesn't need persistence

**Technologies:**
- **useState**: Basic component state
- **useReducer**: Complex component state logic
- **useContext**: Shared state between components
- **Custom Hooks**: Reusable state logic

**Usage Patterns:**
```typescript
// Local component state
const [isOpen, setIsOpen] = useState(false);
const [selectedItem, setSelectedItem] = useState(null);

// Custom hook pattern
function useTaskFilters() {
  const [filters, setFilters] = useState<TaskFilters>({});
  const [sortBy, setSortBy] = useState<'name' | 'date'>('name');

  const filteredTasks = useMemo(() => {
    // Filter logic
  }, [tasks, filters, sortBy]);

  return { filteredTasks, setFilters, setSortBy };
}
```

## State Architecture Patterns

### 1. Provider Hierarchy Pattern

```typescript
// Root layout provider structure
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <TRPCReactProvider>
          <QueryClientProvider>
            <api.Provider>
              {children}
            </api.Provider>
          </QueryClientProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
```

**Provider Stack:**
1. **TRPCReactProvider**: tRPC React context
2. **QueryClientProvider**: React Query client context
3. **api.Provider**: Application-specific context

### 2. Server-First Data Pattern

**Flow**: Database → Drizzle ORM → tRPC Server → React Query → Components

**Benefits:**
- **Type Safety**: End-to-end TypeScript inference
- **Performance**: Server-side data fetching and caching
- **SSR Support**: Built-in server-side rendering
- **Optimistic Updates**: Seamless client-server synchronization

### 3. Component State Co-location Pattern

**Principle**: Keep state as close to where it's used as possible

```typescript
// Example: Task component with localized state
export function TaskItem({ task }: { task: Task }) {
  const [isEditing, setIsEditing] = useState(false);
  const [localName, setLocalName] = useState(task.name);

  // State mutation with server sync
  const updateTask = trpc.task.update.useMutation({
    onSuccess: () => utils.task.invalidate(),
  });

  // State is co-located with its usage
  return (
    <div>
      {isEditing ? (
        <TaskEditForm
          value={localName}
          onChange={setLocalName}
          onSave={() => updateTask.mutate({ id: task.id, name: localName })}
        />
      ) : (
        <TaskDisplay
          task={task}
          onEdit={() => setIsEditing(true)}
        />
      )}
    </div>
  );
}
```

## State Persistence Mechanisms

### 1. Database Persistence (Long-term)

**Technology**: PostgreSQL via Drizzle ORM

**Data Types:**
- **User Data**: Authentication and profile information
- **Project Data**: Tasks, milestones, baselines
- **Resource Data**: Assignments, schedules, availability
- **Session Data**: User sessions and authentication tokens

**Features:**
- **ACID Compliance**: Reliable transaction handling
- **Multi-tenancy**: Organization-based data isolation
- **Indexes**: Optimized for common query patterns
- **Migrations**: Schema evolution with Drizzle migrations

### 2. Client Caching (Medium-term)

**Technology**: React Query Cache

**Cache Configuration:**
- **Stale Time**: 30 seconds for most queries
- **Cache Time**: 5 minutes for frequently accessed data
- **Background Refetching**: Automatic data synchronization
- **Offline Support**: Cached data available offline

### 3. Session Storage (Short-term)

**Technology**: Better Auth Cookies

**Features:**
- **Secure Sessions**: HTTP-only, secure cookies
- **Automatic Refresh**: Transparent session renewal
- **Cross-tab Sync**: Shared session across browser tabs

## Performance Optimizations

### 1. Query Optimization

**Strategies:**
- **Query Deduplication**: Multiple components share the same query
- **Background Refetching**: Automatic data synchronization
- **Selective Invalidation**: Precise cache invalidation
- **Prefetching**: Proactive data loading

**Example:**
```typescript
// Efficient query usage across components
const postsQuery = trpc.post.getAll.useQuery();
// Multiple components can use the same query without duplicate requests
```

### 2. Rendering Optimization

**Techniques:**
- **Server Components**: Data fetching on the server
- **React.memo**: Component memoization
- **useMemo/useCallback**: Hook optimization
- **Code Splitting**: Dynamic imports for large components

### 3. Bundle Optimization

**Tools:**
- **Tree Shaking**: Unused code elimination
- **Dynamic Imports**: Code splitting by route
- **Minification**: Production build optimization

## State Synchronization Patterns

### 1. Optimistic Updates

**Pattern**: Update UI immediately, sync with server in background

```typescript
const createTask = trpc.task.create.useMutation({
  onMutate: async (newTask) => {
    // Cancel any outgoing refetches
    await utils.task.getAll.cancel();

    // Snapshot the previous value
    const previousTasks = utils.task.getAll.getData();

    // Optimistically update to the new value
    utils.task.getAll.setData(undefined, (old) => [
      ...(old || []),
      { ...newTask, id: 'temp-id' }
    ]);

    return { previousTasks };
  },
  onError: (err, newTask, context) => {
    // If the mutation fails, roll back
    utils.task.getAll.setData(undefined, context?.previousTasks);
  },
  onSettled: () => {
    // Always refetch after error or success
    utils.task.getAll.invalidate();
  },
});
```

### 2. Cache Invalidation Strategy

**Principles:**
- **Granular Invalidation**: Invalidate only affected queries
- **Hierarchical Invalidation**: Parent queries update children
- **Manual Invalidation**: User-initiated refresh capability

## Error Handling Patterns

### 1. Query Error Boundaries

**Implementation**: React Query built-in error handling

```typescript
const { data, error, isLoading } = trpc.post.getAll.useQuery({
  retry: (failureCount, error) => {
    // Custom retry logic
    if (error.data?.code === 'UNAUTHORIZED') return false;
    return failureCount < 3;
  },
  onError: (error) => {
    // Centralized error handling
    console.error('Query failed:', error);
    toast.error('Failed to load posts');
  },
});
```

### 2. Mutation Error Handling

**Pattern**: Comprehensive error handling with user feedback

```typescript
const createPost = trpc.post.create.useMutation({
  onError: (error) => {
    if (error.data?.code === 'VALIDATION_ERROR') {
      form.setError('root', { message: error.message });
    } else {
      toast.error('Failed to create post');
    }
  },
  onSuccess: () => {
    toast.success('Post created successfully');
    form.reset();
  },
});
```

## Development Best Practices

### 1. State Design Principles

- **Single Source of Truth**: Each piece of data has one authoritative source
- **State Normalization**: Flat data structures for efficient updates
- **Immutable Updates**: Use immutable patterns for state changes
- **Separation of Concerns**: Different state types use appropriate tools

### 2. Performance Guidelines

- **Memoization**: Use React.memo, useMemo, and useCallback appropriately
- **Lazy Loading**: Load data and components as needed
- **Avoid Over-fetching**: Fetch only necessary data
- **Optimize Re-renders**: Minimize unnecessary component updates

### 3. Type Safety Practices

- **End-to-End Types**: From database to UI components
- **Runtime Validation**: Zod schemas for API inputs
- **Environment Variables**: Type-safe configuration
- **Error Type Safety**: Typed error responses

## Future Enhancement Opportunities

### 1. Advanced State Management

**Potential Additions:**
- **Zustand**: For complex client-side state scenarios
- **React Hook Form**: Enhanced form state management
- **Real-time Updates**: WebSocket integration for live collaboration

### 2. Offline Support

**Features to Consider:**
- **Service Workers**: Offline application functionality
- **Cache API**: Persistent client-side storage
- **Sync Mechanisms**: Offline-to-online data synchronization

### 3. State Persistence

**Enhancements:**
- **Local Storage**: Form draft persistence
- **IndexedDB**: Large client-side data storage
- **Compression**: Efficient state serialization

---

*This state management architecture demonstrates a modern, type-safe approach that leverages the strengths of Next.js 15, tRPC, and React Query for a sophisticated project management application with excellent performance and developer experience.*