# Story 1.3: Project Creation and Management

Status: ready-for-dev

## Story

As a user,
I want to create and manage multiple projects,
so that I can organize different work initiatives.

## Acceptance Criteria

1. **Project Creation Interface Accessibility**
   Given I am in my organization workspace
   When I click "New Project"
   Then I see a project creation form with name, description, and default calendar settings
   And I can set project working days and hours (FR29)

2. **Database Integration and Record Creation**
   When I create a project
   Then a record is created in pg-drizzle_project table with organization_id foreign key
   And the project appears in my project list dashboard
   And I can switch between projects using project navigation (FR3)

## Tasks / Subtasks

- [ ] **Task 1: Extend Database Schema for Projects** (AC: 2)
  - [ ] Create `pg-drizzle_project` table with proper schema
  - [ ] Add organization_id foreign key constraint for multi-tenant data isolation
  - [ ] Create project calendar settings fields (working days, base hours)
  - [ ] Generate and run database migrations
  - [ ] Add proper indexes for organization-based project queries

- [ ] **Task 2: Implement Project Data Access Layer** (AC: 2)
  - [ ] Create project schema definitions in Drizzle following camelCase patterns
  - [ ] Implement project CRUD operations with tRPC procedures
  - [ ] Add organization-based middleware for project data filtering
  - [ ] Create project validation schemas with Zod
  - [ ] Implement Result<T, Error> pattern for project operations

- [ ] **Task 3: Build Project Management Components** (AC: 1, 2)
  - [ ] Create `ProjectCreationForm` component with ShadCN primitives
  - [ ] Implement project calendar settings interface
  - [ ] Add project list dashboard component
  - [ ] Create project navigation switcher component
  - [ ] Style components using established ShadCN UI patterns

- [ ] **Task 4: Implement Project Router and API** (AC: 1, 2)
  - [ ] Create project tRPC router following /lib/trpc/procedures/projects.ts pattern
  - [ ] Add project CRUD procedures with organization context validation
  - [ ] Implement project switching functionality
  - [ ] Add project list and query procedures
  - [ ] Integrate with existing tRPC router structure

- [ ] **Task 5: Project Navigation Integration** (AC: 2)
  - [ ] Update Navigation component to show current project
  - [ ] Implement project switcher dropdown
  - [ ] Add project-based routing to dashboard
  - [ ] Create project-specific dashboard layout
  - [ ] Ensure project context persistence across navigation

- [ ] **Task 6: Calendar Settings Implementation** (AC: 1)
  - [ ] Implement default project calendar settings (working days/hours)
  - [ ] Create calendar configuration interface
  - [ ] Add timezone-aware calendar handling
  - [ ] Implement calendar override functionality
  - [ ] Add calendar validation for business rules

- [ ] **Task 7: Multi-tenant Data Isolation** (AC: 2)
  - [ ] Ensure all project queries filter by organization_id
  - [ ] Add project membership validation
  - [ ] Implement cross-project data access prevention
  - [ ] Add organization context to all project operations
  - [ ] Create project ownership and permission checks

- [ ] **Task 8: Integration Testing and Quality Assurance** (AC: 1, 2)
  - [ ] Unit tests for project schema and operations
  - [ ] Integration tests for multi-tenant project isolation
  - [ ] Component tests for project management forms
  - [ ] API route tests for project endpoints
  - [ ] E2E tests for complete project creation flow

## Dev Notes

### Architecture Requirements

**Technology Stack:**
- **Database**: PostgreSQL with Drizzle ORM 0.41 [Source: previous story 1.2 implementation]
- **Validation**: Zod 3.25.76 for schema validation [Source: previous story patterns]
- **API**: tRPC 11 for type-safe API procedures with Result<T, Error> pattern [Source: architecture.md#Technology Decisions]
- **UI**: ShadCN components with Radix UI primitives [Source: previous story patterns]
- **Authentication**: Better Auth 1.3 with session-based auth and organization context [Source: previous story 1.2]

**Multi-tenancy Requirements:**
- All project tables must include organization_id foreign key [Source: architecture.md#Multi-tenancy section 3]
- Implement organization-based data isolation at database level [Source: previous story 1.2 patterns]
- Use camelCase naming: projectId, organizationId, createdAt [Source: established patterns]
- Follow organization middleware patterns for automatic data filtering [Source: previous story 1.2]

**Project Calendar Requirements:**
- Store default working days and hours per project (FR29) [Source: epics.md#Functional Requirements]
- Implement timezone-aware calendar handling [Source: previous story 1.2 timezone patterns]
- Support project-specific calendar overrides [Source: epics.md#Calendar & Time Management]
- Maintain UTC storage with local timezone display [Source: architecture.md#Timezone Management]

### Implementation Patterns

**Database Schema:**
- Table naming: camelCase (`pg-drizzle_project`) [Source: established patterns]
- Column naming: camelCase (`projectName`, `description`, `organizationId`) [Source: established patterns]
- Foreign keys: xxxId format (`projectId`, `organizationId`) [Source: established patterns]
- Multi-tenant: All tables include organizationId for data isolation [Source: architecture.md#Multi-tenancy]

**API Patterns:**
- Use tRPC procedures with organization context [Source: architecture.md#API Patterns]
- Implement Result<T, Error> pattern for operations [Source: previous story patterns]
- Add organization middleware for automatic data filtering [Source: previous story 1.2]
- Create project router at /lib/trpc/procedures/projects.ts [Source: architecture.md#API Boundaries]

**Component Patterns:**
- PascalCase naming: `ProjectCreationForm`, `ProjectNavigation` [Source: established patterns]
- File naming: `ProjectCreationForm.tsx`, `ProjectNavigation.tsx` [Source: established patterns]
- Use ShadCN form primitives for consistency [Source: previous story patterns]
- Follow dashboard layout patterns from established components

### Project Structure

```
src/
├── lib/
│   ├── db/
│   │   ├── schema.ts          # Extended with project schema
│   │   └── migrations/        # New project migrations
│   └── trpc/
│       └── procedures/
│           └── projects.ts    # Project tRPC procedures
├── components/
│   └── projects/
│       ├── ProjectCreationForm.tsx  # Project creation form
│       ├── ProjectNavigation.tsx    # Project switcher navigation
│       ├── ProjectList.tsx          # Project list dashboard
│       └── CalendarSettings.tsx     # Project calendar settings
├── app/
│   ├── dashboard/
│   │   ├── projects/        # Project management pages
│   │   │   ├── new/         # New project creation page
│   │   │   └── [projectId]/ # Project-specific dashboard
│   │   └── page.tsx         # Updated with project context
│   └── api/
│       └── trpc/[...trpc]/ # Updated tRPC router
```

### Previous Story Intelligence

**Learnings from Story 1.2 (Organization Management Setup):**
- Multi-tenant middleware patterns are working correctly [Source: previous story 1.2]
- Organization context implementation with session management is functional [Source: previous story 1.2]
- Database schema with Drizzle ORM and organization foreign keys established [Source: previous story 1.2]
- Timezone handling with IANA identifiers and UTC storage implemented [Source: previous story 1.2]
- ShadCN UI components with form validation patterns established [Source: previous story 1.2]

**Established Code Patterns:**
- Organization-aware database queries with automatic filtering [Source: previous story 1.2]
- tRPC procedures with Result<T, Error> pattern and organization validation [Source: previous story 1.2]
- React context patterns for organization state management [Source: previous story 1.2]
- Form validation with Zod schemas integrated with ShadCN components [Source: previous story 1.2]
- Database migration patterns with proper constraints and indexes [Source: previous story 1.2]

**Technical Foundation:**
- T3 Stack foundation is solid and proven working [Source: previous story 1.2]
- Session-based authentication with Better Auth 1.3 is functioning correctly [Source: previous story 1.2]
- Multi-tenant architecture with organization isolation is ready for project implementation [Source: previous story 1.2]
- Component patterns with ShadCN are established and consistent [Source: previous story 1.2]

### Git Intelligence

**Recent Work Patterns:**
- Navigation component with authentication support (51634ea) - Navigation patterns available for project integration
- Dashboard page with session management (363f42e) - Dashboard integration patterns established
- Documentation and state management (49c899d) - Project organization patterns working well
- Technical specification improvements (18e829a) - Architecture patterns established

**Architecture Decisions:**
- T3 Stack foundation provides consistent patterns across all features [Source: recent commits]
- Session-based authentication with organization context is functional [Source: recent commits]
- Component patterns with proper separation of concerns established [Source: recent commits]
- API route patterns with proper error handling working correctly [Source: recent commits]

### Latest Technical Information

**Project Management Best Practices:**
- Implement project-based routing following Next.js 15 patterns [Modern Next.js approach]
- Use client-side state management for current project context [React best practice]
- Implement optimistic updates for project switching [UX requirement]
- Add proper loading states for project operations [User experience requirement]

**Database Schema for Projects:**
```sql
-- Project table following established patterns
pg-drizzle_project:
- id: uuid (primary key)
- name: text (project name)
- description: text (optional project description)
- organizationId: uuid REFERENCES pg-drizzle_organization(id)
- workingDays: text[] (default working days, e.g., ['Mon','Tue','Wed','Thu','Fri'])
- workingHours: json (default work hours per day)
- createdAt: timestamp (UTC)
- updatedAt: timestamp (UTC)
```

**API Integration Patterns:**
- Follow tRPC router organization from architecture.md#API Boundaries
- Use organization middleware from previous story 1.2 for automatic filtering
- Implement proper error handling with Result<T, Error> pattern
- Add React Query integration for optimistic updates

### Quality Requirements

**Type Safety:**
- End-to-end TypeScript coverage following previous story patterns [Source: architecture.md#Type Safety Requirements]
- Zod schemas for all project data validation [Source: previous story patterns]
- No `any` types in project code [Source: architecture.md#Type Safety Requirements]

**Security:**
- Multi-tenant data isolation must be 100% effective for projects [Critical security requirement]
- Organization membership validation in all project operations [Security requirement]
- Prevent cross-organization project access at database level [Data protection requirement]
- Proper authorization checks for project management [Access control requirement]

**Performance:**
- Project-based queries must be optimized with proper indexes [Source: architecture.md#Performance Requirements]
- Project switching should be fast with optimistic updates [User experience requirement]
- Project list loading should not impact overall dashboard performance [Performance requirement]

### Integration Requirements

**Organization Integration:**
- All projects must be scoped to organization context [Source: previous story 1.2]
- Use existing organization middleware for automatic filtering [Source: previous story 1.2]
- Maintain organization isolation patterns established in story 1.2 [Source: previous story 1.2]
- Integrate with existing organization context for seamless UX [Source: previous story 1.2]

**Navigation Integration:**
- Extend existing Navigation component with project switching [Source: Navigation.tsx]
- Maintain consistent navigation patterns from authentication [Source: recent commits]
- Use existing dashboard layout patterns [Source: dashboard page implementation]
- Ensure project context persistence across navigation [UX requirement]

### References

- [Source: docs/epics.md#Story-13-Project-Creation-and-Management] - Complete story requirements and acceptance criteria
- [Source: docs/architecture.md#Multi-tenancy section 3] - Multi-tenant architecture patterns
- [Source: docs/architecture.md#API Patterns] - API design patterns and router structure
- [Source: previous story 1.2 implementation] - Established patterns and organization foundation
- [Source: docs/architecture.md#Technology Decisions Already Made] - Technology stack requirements
- [Source: docs/architecture.md#Implementation Patterns] - Naming conventions and patterns
- [Source: docs/prd.md] - Functional requirements FR1, FR2, FR3 for project management
- [Source: docs/ux-design-specification.md] - UX requirements for project management interfaces

## Dev Agent Record

### Context Reference

<!-- Story context generated from comprehensive analysis of epics, architecture, previous story implementation, and latest technical requirements -->

### Agent Model Used

Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)

### Debug Log References

### Completion Notes List

- Comprehensive analysis completed for Epic 1.3 Project Creation and Management
- Previous story 1.2 multi-tenant patterns successfully leveraged for project isolation
- Database schema designed with proper organization foreign keys and calendar settings
- Integration requirements with existing navigation and dashboard identified
- Complete task breakdown created with specific implementation guidance
- Organization context and timezone patterns from story 1.2 applied to project management

### File List

**Database & Schema:**
- src/server/db/schema.ts (Extended with project schema)
- drizzle/[new-migration].sql (Database migration for project table)

**API Layer:**
- src/server/api/routers/projects.ts (Project CRUD operations)
- src/server/api/root.ts (Added project router)

**UI Components:**
- src/components/projects/ProjectCreationForm.tsx (Project creation form)
- src/components/projects/ProjectNavigation.tsx (Project switcher navigation)
- src/components/projects/ProjectList.tsx (Project list dashboard)
- src/components/projects/CalendarSettings.tsx (Project calendar settings)

**Pages:**
- src/app/dashboard/projects/new/page.tsx (New project creation page)
- src/app/dashboard/projects/[projectId]/page.tsx (Project-specific dashboard)
- src/components/navigation/Navigation.tsx (Updated with project navigation)

**Context & Utilities:**
- src/lib/projects/context.tsx (Project context provider)
- src/lib/projects/utils.ts (Project utilities and helpers)

**Tests:**
- src/test/projects.test.ts (Project requirements tests)
- src/test/projects-crud.test.tsx (CRUD operations tests)
- src/test/project-router.test.tsx (Router integration tests)

## Change Log

**2025-12-02** - Initial story creation with comprehensive project management context analysis and integration patterns from previous story 1.2 organization implementation