# Wale Plan Project Documentation Index

*Primary entry point for AI-assisted development and comprehensive project reference*

## Project Overview

**Wale Plan** is a sophisticated **project management and resource planning platform** built with modern TypeScript technologies. The system provides comprehensive capabilities for multi-tenant organizations, including project management, task scheduling with Critical Path Method support, resource allocation, time tracking, and team collaboration.

### Quick Reference

| Attribute | Details |
|-----------|---------|
| **Project Type** | Web Application (Monolith) |
| **Primary Language** | TypeScript |
| **Framework** | Next.js 15 with App Router |
| **Database** | PostgreSQL with Drizzle ORM |
| **Architecture** | Server-side rendering with tRPC |
| **Authentication** | Better Auth with multi-tenant support |
| **UI Framework** | shadcn/ui + Tailwind CSS |

### Technology Stack Summary

**Frontend:**
- **Next.js 15.2.3** - React framework with App Router and Server Components
- **TypeScript 5** - End-to-end type safety
- **Tailwind CSS 4.0.15** - Utility-first styling
- **shadcn/ui** - Component library built on Radix UI primitives
- **TanStack Query v5** - Server state management and caching
- **React Hook Form** - Form state management with Zod validation

**Backend:**
- **tRPC v11** - Type-safe API layer with automatic client generation
- **Drizzle ORM** - Type-safe database queries with PostgreSQL
- **Better Auth v1.3** - Comprehensive authentication with multi-tenant support
- **Zod** - Runtime validation and TypeScript schema generation

**Database:**
- **PostgreSQL** - Primary database with comprehensive project management schema
- **18+ tables** covering authentication, organizations, projects, tasks, resources, and time tracking
- **Advanced features** - Task dependencies, resource scheduling, baseline management

## Generated Documentation

### Core Architecture & Analysis

- **[Architecture](./architecture-main.md)** - Complete system architecture with technology stack, data flow, and scalability considerations
- **[Data Models](./data-models-main.md)** - Comprehensive database schema with 18+ tables, relationships, and constraints
- **[API Contracts](./api-contracts-main.md)** - Complete tRPC API documentation with procedures, authentication, and data structures
- **[Source Tree Analysis](./source-tree-analysis.md)** - Annotated directory structure with file organization and entry points

### Development Resources

- **[Development Guide](./development-guide.md)** - Complete setup instructions, development workflow, and contribution guidelines
- **[State Management Patterns](./state-management-patterns_main.md)** - Comprehensive state management architecture using tRPC, React Query, and React Hook Form
- **[UI Component Inventory](./ui-component-inventory_main.md)** - Complete design system documentation with shadcn/ui components and styling architecture

### Existing Project Documentation

- **[Technical Specification](./tech-spec.md)** - Detailed technical specification with implementation details
- **[Product Requirements Document](./prd.md)** - Comprehensive product requirements and feature specifications
- **[Architecture.md](./architecture.md)** - Original architecture documentation (may be superseded by generated docs)

## Project Classification

### Repository Type
**Monolith** - Single cohesive application with full-stack integration

### Architecture Pattern
**Modern Full-Stack** - Server-side rendering with type-safe API communication

### Key Features
- **Multi-tenant SaaS** with organization-based data isolation
- **Advanced Project Management** with Critical Path Method support
- **Sophisticated Resource Scheduling** with time zone support and dynamic pricing
- **Comprehensive Time Tracking** with cost calculation and reporting
- **Real-time Collaboration** with optimistic updates and intelligent caching
- **Type-safe Development** with end-to-end TypeScript

## Quick Start Guide

### Development Setup
1. **Clone and Install**
   ```bash
   git clone <repository>
   cd wale-plan
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   # Configure DATABASE_URL and other variables
   ```

3. **Database Setup**
   ```bash
   ./start-database.sh
   npm run db:migrate
   ```

4. **Start Development**
   ```bash
   npm run dev
   # Open http://localhost:3000
   ```

### Key Development Commands
- `npm run dev` - Development server with hot reload
- `npm run build` - Production build
- `npm run db:studio` - Database management interface
- `npm run check` - Code quality checks (lint + typecheck)

## Database Schema Overview

### Core Entity Relationships
```
Organization (1) → (N) Projects (1) → (N) Tasks (1) → (N) Time Entries
Organization (1) → (N) Resources (1) → (N) Work Schedules
User (1) → (N) Organization Memberships
Task (1) → (N) Task Dependencies (Self-reference for CPM)
Resource (1) → (N) Resource Assignments
```

### Key Tables
- **Authentication**: `pg-drizzle_user`, `pg-drizzle_session`, `pg-drizzle_organization`
- **Project Management**: `pg-drizzle_project`, `pg-drizzle_task`, `pg-drizzle_task_dependency`
- **Resource Management**: `pg-drizzle_resource`, `pg-drizzle_resource_work_schedule`, `pg-drizzle_resource_availability`
- **Time Tracking**: `pg-drizzle_time_entry`, `pg-drizzle_resource_assignment`
- **Baseline Management**: `pg-drizzle_baseline`, `pg-drizzle_baseline_task`

## API Architecture Overview

### tRPC Router Structure
```
appRouter
├── postRouter - Demo/test procedures
├── authRouter - Authentication and session management
├── organizationRouter - Organization CRUD and member management
├── projectRouter - Project lifecycle management
├── taskRouter - Task management with dependencies
├── resourceRouter - Resource scheduling and assignment
└── timeEntryRouter - Time tracking and reporting
```

### Key API Features
- **End-to-end Type Safety** from database to UI
- **Automatic Client Generation** with React Query integration
- **Optimistic Updates** with intelligent cache invalidation
- **Built-in Error Handling** with comprehensive error responses
- **Request Batching** for performance optimization

## Component Architecture Overview

### Design System
- **Base Framework**: shadcn/ui built on Radix UI primitives
- **Styling**: Tailwind CSS with OKLCH color space
- **Icons**: Lucide React for consistent iconography
- **Forms**: React Hook Form with Zod validation
- **Accessibility**: Full ARIA support with keyboard navigation

### Component Categories
- **Form Components**: Button, Input, Label, Checkbox, Form system
- **Layout Components**: Card, Separator, Container components
- **Business Components**: Task management, resource scheduling, time tracking
- **Authentication Components**: Login, registration, organization management

## State Management Overview

### Server State (tRPC + TanStack Query)
- **API Data**: All server-side application data
- **Caching**: Intelligent 30-second stale time with background refetching
- **Optimistic Updates**: Immediate UI feedback with rollback capability
- **Error Handling**: Comprehensive error states and recovery

### Client State (React Hooks)
- **Form State**: React Hook Form with Zod validation
- **UI State**: Component visibility and interaction states
- **Local State**: Ephemeral component-specific data

### Authentication State (Better Auth)
- **Session Management**: Secure 7-day sessions with automatic refresh
- **Multi-tenant Support**: Organization-based data isolation
- **Role-based Access**: Hierarchical permissions (admin, member, viewer)

## Security Architecture

### Authentication Features
- **Session-based Authentication** with secure HTTP-only cookies
- **Multi-provider Support** (email/password, GitHub OAuth)
- **Email Verification** for account activation
- **Password Security** with Bcrypt hashing

### Authorization Features
- **Multi-tenant Data Isolation** with organization-based access control
- **Role-based Access Control** (admin, member, viewer roles)
- **Resource-based Authorization** with granular permissions
- **API Security** with comprehensive input validation

### Data Protection
- **SQL Injection Prevention** through Drizzle ORM parameterized queries
- **XSS Protection** with input sanitization and output encoding
- **CSRF Protection** with built-in safeguards
- **Data Encryption** in transit (HTTPS) and at rest considerations

## Performance Features

### Frontend Performance
- **Server Components** for reduced client-side JavaScript
- **Automatic Code Splitting** with Next.js App Router
- **Image Optimization** with Next.js Image component
- **Component Memoization** with React.memo and useMemo/useCallback

### Backend Performance
- **Connection Pooling** for efficient database connections
- **Query Optimization** with comprehensive indexing strategy
- **API Caching** with TanStack Query intelligent caching
- **Request Batching** with tRPC HTTP batching

### Database Performance
- **50+ Performance Indexes** covering common query patterns
- **Foreign Key Optimization** with cascade operations
- **Composite Indexes** for multi-column queries
- **Query Analysis** capabilities with Drizzle Studio

## Getting Started for AI-Assisted Development

This index serves as the primary entry point for AI assistants working with this codebase. For optimal assistance:

### For Code Generation
- Reference the **[Architecture](./architecture-main.md)** for system patterns
- Use the **[Data Models](./data-models-main.md)** for database operations
- Consult the **[API Contracts](./api-contracts-main.md)** for endpoint definitions
- Review the **[Component Inventory](./ui-component-inventory_main.md)** for UI patterns

### For Feature Development
- Start with the **[Technical Specification](./tech-spec.md)** for feature requirements
- Use the **[Development Guide](./development-guide.md)** for setup and workflow
- Reference the **[Source Tree Analysis](./source-tree-analysis.md)** for file organization
- Consult the **[State Management](./state-management-patterns_main.md)** for data flow patterns

### For Bug Fixes and Maintenance
- Check the **[Architecture](./architecture-main.md)** for architectural constraints
- Review the **[API Contracts](./api-contracts-main.md)** for interface definitions
- Use the **[Development Guide](./development-guide.md)** for debugging procedures
- Reference the **[Data Models](./data-models-main.md)** for database schema

### For Documentation Updates
- Follow patterns established in this index
- Update relevant sections when making architectural changes
- Maintain consistency between generated documentation and actual implementation
- Update this index when adding new documentation files

## Current Project Status

### Completed Features
- ✅ **Multi-tenant Architecture** with organization management
- ✅ **Advanced Database Schema** with comprehensive relationships
- ✅ **Type-safe API Layer** with tRPC integration
- ✅ **Modern UI System** with shadcn/ui components
- ✅ **Authentication System** with Better Auth integration
- ✅ **Development Environment** with comprehensive tooling

### Development Status
- **Phase**: Brownfield analysis and documentation complete
- **Next Steps**: Feature implementation based on existing PRD and tech spec
- **Readiness**: Ready for AI-assisted development with comprehensive documentation
- **Workflow Status**: Documented in `bmm-workflow-status.yaml`

### Technology Debt and Considerations
- **Testing**: Test framework not yet configured (recommend Vitest + Testing Library)
- **Deployment**: Deployment configuration not yet implemented
- **CI/CD**: Continuous integration pipeline not yet established
- **Documentation**: Contribution guidelines and developer setup procedures needed

---

*This comprehensive documentation index provides complete coverage of the Wale Plan project architecture, development patterns, and implementation details. It serves as the primary reference for AI-assisted development, code generation, feature implementation, and system maintenance.*

*For specific implementation guidance, refer to the detailed documentation sections linked above. The project demonstrates modern full-stack development practices with excellent type safety, performance optimization, and scalability considerations.*