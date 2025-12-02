# Architecture Documentation - Wale Plan

*Generated as part of comprehensive project documentation*

## Executive Summary

Wale Plan is a sophisticated **project management and resource planning platform** built with a modern TypeScript-first technology stack. The system provides comprehensive capabilities for multi-tenant organizations, including project management, task scheduling, resource allocation, time tracking, and team collaboration.

**Key Architectural Features:**
- **Multi-tenant SaaS Architecture** with organization-based data isolation
- **Type-safe Full-Stack Development** with end-to-end TypeScript
- **Modern Web Architecture** using Next.js 15 with App Router
- **Scalable Resource Management** supporting complex scheduling algorithms
- **Real-time Collaboration** with optimistic updates and intelligent caching

## Technology Stack

### Frontend Architecture

**Core Framework:**
- **Next.js 15.2.3** with App Router for server-side rendering
- **React 18** with Server Components and Client Components
- **TypeScript 5** for type safety and developer experience

**UI/UX Layer:**
- **Tailwind CSS 4.0.15** for utility-first styling
- **shadcn/ui** component library built on Radix UI primitives
- **Lucide React** for consistent iconography
- **Framer Motion** for animations and transitions

**State Management:**
- **TanStack Query v5** for server state management and caching
- **React Hook Form** with Zod validation for form state
- **Local useState/useReducer** for component-specific state

### Backend Architecture

**API Layer:**
- **tRPC v11** for end-to-end type-safe API communication
- **React Query integration** for intelligent client-side caching
- **Zod schemas** for runtime validation and type safety

**Database Layer:**
- **PostgreSQL** as primary database
- **Drizzle ORM** for type-safe database operations
- **Database migrations** for schema evolution
- **Connection pooling** for performance optimization

**Authentication & Authorization:**
- **Better Auth v1.3** for comprehensive authentication
- **Session-based authentication** with secure cookie handling
- **Multi-tenant organization management** with role-based access control
- **Email verification** and social login support

### Infrastructure & DevOps

**Development Environment:**
- **Node.js 18+** with npm package management
- **Docker** for local database containerization
- **TypeScript strict mode** for maximum type safety
- **ESLint and Prettier** for code quality and consistency

**Build & Deployment:**
- **Next.js optimization** with automatic code splitting
- **Environment variable validation** with build-time checks
- **Image optimization** and asset management
- **Performance monitoring** with Core Web Vitals

## System Architecture

### High-Level Architecture Pattern

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Layer                              │
├─────────────────────────────────────────────────────────────┤
│  React Components (Server + Client)                         │
│  ├── UI Components (shadcn/ui)                              │
│  ├── Forms (React Hook Form + Zod)                          │
│  └── State Management (TanStack Query)                      │
├─────────────────────────────────────────────────────────────┤
│                    API Layer                                 │
├─────────────────────────────────────────────────────────────┤
│  tRPC Endpoints (Type-safe)                                 │
│  ├── Authentication (Better Auth)                           │
│  ├── Project Management                                     │
│  ├── Resource Scheduling                                    │
│  └── Time Tracking                                          │
├─────────────────────────────────────────────────────────────┤
│                  Business Logic                              │
├─────────────────────────────────────────────────────────────┤
│  Server-Side Functions                                       │
│  ├── Validation Logic                                       │
│  ├── Authorization Rules                                    │
│  ├── Business Calculations                                  │
│  └── Data Processing                                        │
├─────────────────────────────────────────────────────────────┤
│                 Data Layer                                  │
├─────────────────────────────────────────────────────────────┤
│  PostgreSQL Database                                         │
│  ├── Multi-tenant Schema                                    │
│  ├── Organization Isolation                                 │
│  ├── Complex Relationships                                  │
│  └── Performance Indexes                                    │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow Architecture

**Request-Response Flow:**
```
User Interface → tRPC Client → TanStack Query → tRPC Server → Business Logic → Drizzle ORM → PostgreSQL
     ↑                                                              ↓
UI Updates ← Optimistic Updates ← Cache Invalidation ← Server Response ←
```

**Key Flow Characteristics:**
- **Type Safety**: End-to-end TypeScript type checking
- **Optimistic Updates**: Immediate UI feedback with rollback capability
- **Intelligent Caching**: Automatic cache invalidation and background updates
- **Error Handling**: Comprehensive error propagation with user-friendly messages

### Multi-Tenant Architecture

**Organization-Based Data Isolation:**
```
┌─────────────────────────────────────────────────────────────┐
│                     Multi-Tenant Layer                      │
├─────────────────────────────────────────────────────────────┤
│  Organization A          │  Organization B          │  ...   │
│  ┌─────────────────────┐│ ┌─────────────────────┐│       │
│  │ Users               ││ │ Users               ││       │
│  │ Projects            ││ │ Projects            ││       │
│  │ Resources           ││ │ Resources           ││       │
│  │ Tasks               ││ │ Tasks               ││       │
│  │ Time Entries        ││ │ Time Entries        ││       │
│  └─────────────────────┘│ └─────────────────────┘│       │
└─────────────────────────────────────────────────────────────┘
                    ↓ Data Isolation ↓
              ┌─────────────────────┐
              │  PostgreSQL DB      │
              │  Shared Schema      │
              │  Org-based FKs      │
              └─────────────────────┘
```

**Multi-Tenancy Features:**
- **Data Isolation**: Organization-based foreign key relationships
- **User Management**: Multi-organization user membership
- **Role-Based Access**: Hierarchical permissions (admin, member, viewer)
- **Resource Sharing**: Controlled resource allocation across organizations

## Database Architecture

### Schema Design

**Core Entity Relationships:**
```
Organization (1) → (N) Projects (1) → (N) Tasks (1) → (N) Time Entries
Organization (1) → (N) Resources (1) → (N) Work Schedules
Organization (1) → (N) Organization Memberships
User (1) → (N) Organization Memberships
Task (1) → (N) Task Dependencies (Self-reference)
Resource (1) → (N) Resource Assignments
```

### Key Database Tables

**Authentication & Users:**
- `pg-drizzle_user` - User accounts with email verification
- `pg-drizzle_session` - Secure session management
- `pg-drizzle_account` - External authentication providers
- `pg-drizzle_verification` - Email verification codes

**Organization Management:**
- `pg-drizzle_organization` - Multi-tenant organizations
- `pg-drizzle_organization_member` - User-organization relationships

**Project Management:**
- `pg-drizzle_project` - Project definitions and lifecycle
- `pg-drizzle_task` - Hierarchical tasks with dependencies
- `pg-drizzle_task_dependency` - Critical Path Method relationships

**Resource Management:**
- `pg-drizzle_resource` - Human and material resources
- `pg-drizzle_resource_work_schedule` - Work schedules and availability
- `pg-drizzle_resource_availability` - Time-based resource availability
- `pg-drizzle_resource_assignment` - Resource-to-task assignments

**Time Tracking:**
- `pg-drizzle_time_entry` - Detailed time logging with cost calculation
- `pg-drizzle_baseline` - Project baselines for comparison

### Performance Optimizations

**Indexing Strategy:**
- **Primary Key Indexes**: All tables have optimized primary keys
- **Foreign Key Indexes**: All relationships are indexed
- **Query Indexes**: Common query patterns optimized
- **Composite Indexes**: Multi-column queries optimized

**Query Optimization:**
- **Connection Pooling**: Efficient database connection management
- **Query Caching**: Application-level query result caching
- **Lazy Loading**: On-demand data loading for large datasets
- **Batch Operations**: Efficient bulk data processing

## API Architecture

### tRPC Router Structure

**Router Hierarchy:**
```
appRouter
├── authRouter (Authentication procedures)
├── userRouter (User management)
├── organizationRouter (Organization management)
├── projectRouter (Project CRUD operations)
├── taskRouter (Task management and dependencies)
├── resourceRouter (Resource scheduling)
└── timeEntryRouter (Time tracking and reporting)
```

### API Security

**Authentication Layer:**
- **Session-based Authentication**: Secure HTTP-only cookies
- **CSRF Protection**: Built-in CSRF safeguards
- **Rate Limiting**: Configurable request rate limiting
- **Input Validation**: Zod schema validation for all inputs

**Authorization Layer:**
- **Role-based Access Control**: Hierarchical permission system
- **Resource-based Authorization**: Organization-level data access
- **Procedure-level Security**: Granular API endpoint protection
- **Audit Logging**: Comprehensive access logging

### API Features

**Type Safety:**
- **End-to-end Types**: Database to UI type inference
- **Runtime Validation**: Zod schema validation
- **Auto-completion**: IDE support for all API calls
- **Error Handling**: Type-safe error responses

**Performance Features:**
- **Request Batching**: Multiple requests in single HTTP call
- **Data Transformer**: Efficient data serialization
- **Background Invalidation**: Intelligent cache management
- **Optimistic Updates**: Immediate UI feedback

## Component Architecture

### React Component Hierarchy

**Application Structure:**
```
App (Root Layout)
├── Providers (TRPC, Query, Auth)
├── Routes (App Router)
│   ├── Auth Pages
│   ├── Dashboard Pages
│   ├── Organization Pages
│   └── Project Pages
└── Shared Components
    ├── UI Components (shadcn/ui)
    ├── Form Components (React Hook Form)
    └── Business Components
```

### Component Patterns

**Server Components:**
- **Data Fetching**: Server-side data loading
- **Authentication**: Session validation
- **SEO Optimization**: Server-rendered metadata
- **Performance**: Reduced client-side JavaScript

**Client Components:**
- **Interactivity**: User interactions and state
- **Forms**: Form submission and validation
- **Real-time Updates**: Optimistic updates and caching
- **Browser APIs**: Client-side functionality

**Component Composition:**
- **Small, Reusable Components**: Single responsibility principle
- **Composition over Inheritance**: Flexible component building
- **Prop Typing**: Comprehensive TypeScript interfaces
- **Accessibility**: Built-in ARIA support

## State Management Architecture

### State Classification

**Server State (tRPC + TanStack Query):**
- **Database Data**: Persistent application data
- **API Responses**: Server-side business logic results
- **User Sessions**: Authentication and authorization data
- **Real-time Data**: Frequently changing application state

**Client State (React Hooks):**
- **Form State**: User input and validation
- **UI State**: Component visibility and interactions
- **Temporary State**: Ephemeral component data
- **Derived State**: Computed values from other state

**URL State (Next.js Router):**
- **Navigation State**: Current route and parameters
- **Search State**: Query parameters and filters
- **Tab State**: Multi-tab application state
- **Sharing State**: Shareable application state

### State Synchronization

**Optimistic Updates:**
```typescript
const createTask = trpc.task.create.useMutation({
  onMutate: async (newTask) => {
    // Cancel outgoing queries
    await utils.task.getAll.cancel();

    // Snapshot previous state
    const previousTasks = utils.task.getAll.getData();

    // Optimistically update
    utils.task.getAll.setData(undefined, (old) => [...old, newTask]);

    return { previousTasks };
  },
  onError: (err, newTask, context) => {
    // Rollback on error
    utils.task.getAll.setData(undefined, context?.previousTasks);
  },
  onSettled: () => {
    // Refetch after completion
    utils.task.getAll.invalidate();
  },
});
```

**Cache Management:**
- **Intelligent Invalidation**: Precise cache updates
- **Background Refetching**: Automatic data synchronization
- **Stale-while-revalidate**: Performance optimization
- **Memory Management**: Efficient cache cleanup

## Security Architecture

### Authentication System

**Better Auth Integration:**
- **Session Management**: Secure, scalable session handling
- **Multi-provider Support**: Email/password and social login
- **Email Verification**: Account verification workflow
- **Password Security**: Secure password hashing and policies

**Session Security:**
- **HTTP-only Cookies**: Prevent XSS attacks
- **Secure Flags**: HTTPS-only cookie transmission
- **Same-site Protection**: CSRF attack prevention
- **Session Rotation**: Automatic session refresh

### Authorization System

**Role-based Access Control:**
```
Organization Admin
├── Manage Organization Settings
├── Invite/Remove Members
├── Manage All Projects
└── Full Access to All Resources

Organization Member
├── View Assigned Projects
├── Create/Edit Assigned Tasks
├── Log Time Entries
└── View Assigned Resources

Project Viewer
├── View Project Details
├── View Tasks (Read-only)
└── View Reports (Read-only)
```

**Resource-based Authorization:**
- **Organization Ownership**: Data access based on organization membership
- **Project Access Control**: Role-based project permissions
- **Resource Assignment**: Access based on resource assignments
- **Data Isolation**: Strict data separation between organizations

### Data Security

**Input Validation:**
- **Zod Schemas**: Runtime type validation
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Input sanitization and output encoding
- **CSRF Protection**: Built-in CSRF safeguards

**Data Encryption:**
- **Data in Transit**: HTTPS/TLS encryption
- **Password Security**: Bcrypt hashing with salt
- **Session Security**: Secure session token generation
- **API Security**: Type-safe API communication

## Performance Architecture

### Frontend Performance

**Next.js Optimizations:**
- **Server Components**: Reduced client-side JavaScript
- **Automatic Code Splitting**: Route-based bundle splitting
- **Image Optimization**: Next.js Image component with optimization
- **Font Optimization**: Google Fonts with display swap

**Component Performance:**
- **React.memo**: Component memoization for expensive renders
- **useMemo/useCallback**: Hook optimization for expensive calculations
- **Virtual Scrolling**: Efficient rendering of large lists
- **Lazy Loading**: Dynamic imports for large components

### Backend Performance

**Database Performance:**
- **Connection Pooling**: Efficient database connection management
- **Query Optimization**: Indexed queries and efficient data access
- **Caching Strategy**: Multi-level caching (query, application, CDN)
- **Batch Processing**: Efficient bulk data operations

**API Performance:**
- **Request Batching**: Multiple requests in single HTTP call
- **Data Transformer**: Efficient JSON serialization
- **Response Compression**: Gzip compression for API responses
- **Edge Caching**: CDN-based response caching

### Monitoring and Optimization

**Performance Metrics:**
- **Core Web Vitals**: LCP, FID, CLS monitoring
- **Database Performance**: Query execution time tracking
- **API Performance**: Response time and error rate monitoring
- **User Experience**: Real user performance monitoring

**Optimization Strategies:**
- **Bundle Analysis**: Regular bundle size analysis
- **Performance Budgeting**: Performance budgets and monitoring
- **A/B Testing**: Performance optimization testing
- **Load Testing**: Performance testing under load

## Scalability Architecture

### Horizontal Scalability

**Application Scalability:**
- **Stateless Design**: Stateless application servers
- **Load Balancing**: Multiple application instances
- **Database Sharding**: Horizontal database scaling
- **CDN Integration**: Global content delivery

**Database Scalability:**
- **Read Replicas**: Read scaling for database queries
- **Connection Pooling**: Efficient connection management
- **Caching Layers**: Redis/Memcached for application caching
- **Database Partitioning**: Time-based or organization-based partitioning

### Multi-tenancy Scalability

**Organization Scaling:**
- **Data Isolation**: Scalable multi-tenant architecture
- **Resource Allocation**: Per-organization resource limits
- **Performance Isolation**: Organization performance isolation
- **Billing Integration**: Usage-based billing support

**Feature Scalability:**
- **Modular Architecture**: Independent feature development
- **API Versioning**: Backward-compatible API evolution
- **Plugin Architecture**: Extensible feature system
- **Microservice Migration**: Path to microservice architecture

## Development Architecture

### Development Workflow

**Code Organization:**
- **Monorepo Structure**: Single repository with clear separation
- **Feature-based Development**: Feature-driven code organization
- **Component-driven Development**: Component-first architecture
- **Type-first Development**: TypeScript-driven development

**Quality Assurance:**
- **TypeScript Strict Mode**: Maximum type safety
- **ESLint Configuration**: Comprehensive linting rules
- **Automated Testing**: Unit, integration, and E2E testing
- **Code Reviews**: Peer review process

### Build and Deployment

**Build Process:**
- **TypeScript Compilation**: Strict TypeScript compilation
- **Bundle Optimization**: Automatic code splitting and optimization
- **Asset Optimization**: Image and asset optimization
- **Environment Validation**: Build-time environment validation

**Deployment Strategy:**
- **Containerization**: Docker-based deployment
- **Environment Management**: Development, staging, production environments
- **CI/CD Pipeline**: Automated build and deployment
- **Rollback Strategy**: Automated rollback capabilities

## Future Architecture Considerations

### Scalability Enhancements

**Microservice Migration:**
- **Service Extraction**: Gradual service extraction
- **API Gateway**: Central API management
- **Service Mesh**: Inter-service communication
- **Event-driven Architecture**: Asynchronous communication

**Database Enhancements:**
- **NoSQL Integration**: Document database for specific use cases
- **Search Engine**: Elasticsearch integration for search
- **Data Warehouse**: Analytics and reporting database
- **Real-time Data**: WebSocket integration for real-time updates

### Feature Enhancements

**Advanced Features:**
- **AI Integration**: Machine learning for project predictions
- **Advanced Analytics**: Business intelligence and reporting
- **Mobile Applications**: React Native mobile apps
- **API Ecosystem**: Third-party integration support

**Infrastructure Enhancements:**
- **Edge Computing**: Global edge deployment
- **Serverless Architecture**: Function-based scaling
- **Multi-cloud Deployment**: Cloud-agnostic deployment
- **Disaster Recovery**: Comprehensive backup and recovery

---

*This architecture documentation provides a comprehensive overview of the Wale Plan system architecture, demonstrating a modern, scalable, and maintainable approach to building a sophisticated project management and resource planning platform.*