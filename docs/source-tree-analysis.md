# Source Tree Analysis - Wale Plan Project

*Generated as part of comprehensive project documentation*

## Project Overview

**Wale Plan** is a sophisticated **Next.js 15** project management and resource planning application built with modern TypeScript, featuring comprehensive resource scheduling, team collaboration, and organizational management capabilities.

**Architecture Pattern**: Monolithic full-stack application with server-side rendering
**Primary Framework**: Next.js 15 with App Router
**Database**: PostgreSQL with Drizzle ORM
**API Layer**: tRPC with React Query for type-safe client-server communication
**Authentication**: Better Auth with multi-tenant organization support

## Directory Structure

```
wale-plan/
├── .bmad/                          # BMAD workflow management system
│   ├── bmm/                        # BMM module configuration and workflows
│   │   ├── agents/                 # AI agent configurations
│   │   ├── workflows/              # Workflow definitions and instructions
│   │   ├── config.yaml             # BMM module configuration
│   │   └── data/                   # Documentation standards and templates
│   └── core/                       # Core BMAD framework files
├── drizzle/                        # Database migration files and metadata
│   ├── 0000_absent_mephistopheles.sql  # Initial database schema migration
│   └── meta/                       # Migration tracking and snapshots
├── docs/                           # Project documentation (this location)
│   ├── architecture.md             # System architecture documentation
│   ├── prd.md                      # Product Requirements Document
│   ├── tech-spec.md                # Technical specification
│   └── bmm-workflow-status.yaml    # BMM workflow progress tracking
├── public/                         # Static assets and public files
│   ├── next.svg                    # Next.js default SVG icon
│   └── vercel.svg                  # Vercel deployment SVG icon
├── src/                            # Main application source code
│   ├── app/                        # Next.js App Router pages and layouts
│   ├── components/                 # Reusable React components
│   ├── lib/                        # Utility libraries and configurations
│   ├── server/                     # Server-side code (APIs, auth, database)
│   ├── styles/                     # Global CSS and styling
│   └── trpc/                       # tRPC configuration and client setup
├── .env.example                    # Environment variables template
├── .eslintrc.json                  # ESLint configuration
├── .gitignore                      # Git ignore rules
├── next.config.ts                  # Next.js configuration
├── package.json                    # Project dependencies and scripts
├── tailwind.config.ts              # Tailwind CSS configuration
├── tsconfig.json                   # TypeScript configuration
└── README.md                       # Project README documentation
```

## Critical Directories Analysis

### 1. `src/` - Application Core

**Purpose**: Contains all application source code organized by responsibility and architecture layer

#### `src/app/` - Next.js App Router

**Purpose**: Server-side rendered pages and layouts using Next.js 15 App Router

```
src/app/
├── api/                            # API route handlers
│   ├── auth/                       # Authentication endpoints (Better Auth)
│   │   └── [...all]/route.ts       # Catch-all auth handler
│   └── trpc/                       # tRPC API endpoints
│       └── [trpc]/route.ts         # tRPC HTTP handler
├── auth/                           # Authentication pages
│   ├── layout.tsx                  # Auth layout wrapper
│   └── page.tsx                    # Authentication form
├── dashboard/                      # Main application dashboard
│   ├── organizations/              # Organization management
│   │   ├── new/
│   │   │   └── page.tsx            # Create organization form
│   │   └── page.tsx                # Organizations list
│   └── page.tsx                    # Dashboard overview
├── globals.css                     # Global styles import
├── layout.tsx                      # Root application layout
├── page.tsx                        # Home page
└── post/                           # Demo post functionality
    └── page.tsx                    # Post management page
```

**Key Features**:
- **Server Components**: All pages are server-side rendered by default
- **API Routes**: tRPC and authentication endpoints in `/api/`
- **Layout Hierarchy**: Nested layouts for different application sections
- **Route Groups**: Logical organization of related pages

#### `src/components/` - React Components

**Purpose**: Reusable UI components organized by type and responsibility

```
src/components/
├── ui/                             # Design system components (shadcn/ui)
│   ├── button.tsx                  # Button component with variants
│   ├── card.tsx                    # Card container component
│   ├── checkbox.tsx                # Checkbox with Radix UI
│   ├── form.tsx                    # Form system with React Hook Form
│   ├── input.tsx                   # Styled input field
│   ├── label.tsx                   # Form label with accessibility
│   └── separator.tsx               # Visual separator component
└── LatestPost.tsx                  # Example post component
```

**Architecture Patterns**:
- **Design System**: All UI components follow shadcn/ui patterns
- **Accessibility**: Built on Radix UI primitives with full ARIA support
- **Type Safety**: Complete TypeScript prop definitions
- **Composition**: Small, composable components

#### `src/lib/` - Utilities and Configuration

**Purpose**: Shared utilities, configurations, and helper functions

```
src/lib/
├── auth.ts                         # Authentication utilities
├── auth.ts                         # Better Auth configuration
├── utils.ts                        # Utility functions (cn, etc.)
└── env.ts                          # Environment variable validation
```

**Key Files**:
- **utils.ts**: Contains `cn()` function for className merging
- **auth.ts**: Better Auth configuration and session management
- **env.ts**: Type-safe environment variable validation

#### `src/server/` - Server-Side Logic

**Purpose**: Backend logic including database, APIs, and server utilities

```
src/server/
├── api/                            # tRPC API procedures
│   ├── root.ts                     # Main tRPC router
│   ├── trpc.ts                     # tRPC configuration and context
│   └── routers/
│       └── post.ts                 # Post-related API procedures
├── better-auth/                    # Authentication system
│   ├── client.ts                   # Auth client configuration
│   └── config.ts                   # Better Auth setup
├── db/                             # Database configuration
│   ├── empty-schema.ts             # Empty database schema
│   ├── index.ts                    # Database connection setup
│   └── schema.ts                   # Complete Drizzle schema
└── db-empty.ts                     # Alternative empty database setup
```

**Architecture Highlights**:
- **tRPC Router**: Type-safe API with automatic client generation
- **Database Schema**: Comprehensive project management data model
- **Authentication**: Better Auth with multi-tenant support
- **Connection Management**: PostgreSQL connection with Drizzle ORM

#### `src/styles/` - Styling

**Purpose**: Global CSS and styling configuration

```
src/styles/
└── globals.css                     # Global styles with Tailwind and theme
```

**Features**:
- **Tailwind CSS**: Utility-first styling
- **Custom Properties**: OKLCH color system
- **Dark Mode**: Complete theme support
- **Typography**: Geist Sans font integration

#### `src/trpc/` - tRPC Client

**Purpose**: tRPC client configuration for type-safe API calls

```
src/trpc/
├── query-client.ts                 # React Query client configuration
├── react.tsx                       # React hooks and providers
└── server.ts                       # Server-side tRPC setup
```

### 2. Configuration Files

#### `drizzle.config.ts` - Database Configuration

**Purpose**: Drizzle ORM configuration for database operations

```typescript
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/server/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});
```

#### `next.config.ts` - Next.js Configuration

**Purpose**: Next.js application configuration

```typescript
const config = {
  experimental: {
    // Experimental features
  },
  // Additional Next.js configuration
};
```

#### `tailwind.config.ts` - Tailwind Configuration

**Purpose**: Tailwind CSS customization and theme configuration

**Features**:
- **CSS Custom Properties**: OKLCH color space
- **Custom Animations**: Animation utilities
- **Theme System**: Dark/light mode support

### 3. `drizzle/` - Database Migrations

**Purpose**: Database schema migration files and metadata

```
drizzle/
├── 0000_absent_mephistopheles.sql  # Initial migration with complete schema
└── meta/                           # Migration tracking
    ├── _journal.json               # Migration history
    └── 0000_snapshot.json         # Schema snapshot
```

**Migration Contents**:
- **Complete Schema**: All tables for project management system
- **Indexes**: Performance optimization indexes
- **Constraints**: Foreign key relationships and data integrity
- **Sequences**: Auto-incrementing primary keys

## Entry Points and Application Flow

### 1. Application Entry Point

**File**: `src/app/layout.tsx`

**Purpose**: Root layout with providers and global configuration

```typescript
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={cn(font.className, "font-sans antialiased")}>
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

### 2. API Entry Point

**File**: `src/app/api/trpc/[trpc]/route.ts`

**Purpose**: tRPC HTTP endpoint handler

**Features**:
- **Type Safety**: Automatic type inference
- **Error Handling**: Comprehensive error responses
- **Performance**: Efficient request processing

### 3. Database Entry Point

**File**: `src/server/db/index.ts`

**Purpose**: Database connection and pool management

```typescript
export const db = drizzle(dbConnection, {
  schema,
});
```

## Technology Integration Points

### 1. Authentication Flow

```
Client Request → Better Auth → Session Validation → Database → Response
```

**Components**:
- **Better Auth**: Session management and validation
- **Database**: User and session persistence
- **Middleware**: Route protection and session checking

### 2. API Data Flow

```
Client Component → tRPC Hook → React Query → tRPC Server → Database → Response
```

**Benefits**:
- **Type Safety**: End-to-end TypeScript inference
- **Caching**: Automatic client-side caching with React Query
- **Optimistic Updates**: Seamless user experience

### 3. Database Architecture

```
PostgreSQL ← Drizzle ORM ← tRPC Procedures ← React Components
```

**Schema Organization**:
- **Authentication**: Users, sessions, accounts
- **Organizations**: Multi-tenant organization management
- **Projects**: Project and task management
- **Resources**: Resource scheduling and assignments
- **Time Tracking**: Detailed time entry management

## Development Workflow Integration

### 1. Package Management

**File**: `package.json`

**Key Scripts**:
- `dev`: Development server with hot reload
- `build`: Production build optimization
- `db:generate`: Generate database types
- `db:migrate`: Run database migrations
- `db:studio`: Drizzle Studio for database management

### 2. Development Tools

**TypeScript Configuration**: `tsconfig.json`
- **Strict Mode**: Full TypeScript strict mode
- **Path Mapping**: Clean import paths with `~` prefix
- **Next.js Integration**: Optimized for Next.js app router

**ESLint Configuration**: `.eslintrc.json`
- **Next.js Rules**: Next.js-specific linting rules
- **TypeScript Rules**: Type checking and consistency
- **Import Rules**: Organized import ordering

### 3. Environment Management

**Environment Variables**:
- **Database**: PostgreSQL connection string
- **Authentication**: Better Auth secrets
- **Next.js**: Runtime configuration options
- **Development**: Debug and development settings

## Critical Integration Points

### 1. Server-Client Communication

**tRPC Integration**:
- **Server Procedures**: Type-safe API endpoints
- **Client Hooks**: Auto-generated React hooks
- **Error Handling**: Comprehensive error propagation
- **Validation**: Zod schema validation

### 2. State Management

**React Query Integration**:
- **Caching**: Intelligent data caching
- **Background Updates**: Automatic data synchronization
- **Optimistic Updates**: Immediate UI feedback
- **Error Recovery**: Robust error handling

### 3. Database Integration

**Drizzle ORM Integration**:
- **Type Safety**: Generated TypeScript types
- **Migrations**: Schema evolution management
- **Performance**: Optimized query execution
- **Relationships**: Comprehensive foreign key support

## Security Architecture

### 1. Authentication Security

**Better Auth Features**:
- **Session Management**: Secure session handling
- **CSRF Protection**: Built-in CSRF safeguards
- **Multi-Factor**: Support for MFA integration
- **Organization Security**: Multi-tenant data isolation

### 2. API Security

**tRPC Security**:
- **Type Safety**: Compile-time error prevention
- **Input Validation**: Zod schema validation
- **Rate Limiting**: Configurable request limiting
- **CORS**: Cross-origin resource sharing control

### 3. Database Security

**Drizzle Security**:
- **SQL Injection**: Parameterized queries
- **Data Isolation**: Organization-based data separation
- **Connection Security**: Encrypted database connections
- **Access Control**: Row-level security capabilities

## Performance Considerations

### 1. Server Performance

**Next.js Optimizations**:
- **Server Components**: Reduced client-side JavaScript
- **Streaming**: Progressive content loading
- **Caching**: Edge and browser caching strategies
- **Bundle Optimization**: Automatic code splitting

### 2. Database Performance

**Drizzle Optimizations**:
- **Query Optimization**: Efficient query generation
- **Connection Pooling**: Database connection management
- **Index Strategy**: Comprehensive indexing plan
- **Migration Performance**: Efficient schema updates

### 3. Client Performance

**React Query Optimizations**:
- **Intelligent Caching**: Smart data caching strategies
- **Background Updates**: Seamless data synchronization
- **Memory Management**: Efficient cache cleanup
- **Network Optimization**: Request batching and deduplication

## Development Best Practices

### 1. Code Organization

**Separation of Concerns**:
- **UI Components**: Presentational logic only
- **API Layer**: Business logic and data access
- **Database**: Data persistence and relationships
- **Utilities**: Shared helper functions

### 2. Type Safety

**End-to-End Types**:
- **Database**: Generated TypeScript types
- **API**: Type-safe procedure definitions
- **Components**: Comprehensive prop types
- **Environment**: Type-safe configuration

### 3. Testing Strategy

**Integration Points**:
- **Unit Tests**: Component and utility testing
- **Integration Tests**: API and database testing
- **E2E Tests**: Full user workflow testing
- **Type Checking**: Compile-time error prevention

---

*This source tree analysis provides a comprehensive overview of the Wale Plan application architecture, demonstrating a modern, well-structured full-stack application with excellent separation of concerns, type safety, and scalability considerations.*