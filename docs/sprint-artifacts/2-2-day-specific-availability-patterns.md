# ✔️ **Story 2.2 Revised — Day-Specific Availability Patterns**

Status: Ready for Review
Scope: Resource Management → Availability Configuration

---

# 🎯 **Story**

As a user,
I want to configure availability per day of the week for each resource,
So that I can model precisely when and how much a resource can work.

---

# ✔️ **Acceptance Criteria**

### **1. UI entry point**

Given I am in the Resource Management table
When I click on the button "Settings" (⚙️) for a resource
Then I am redirected to the *Availability Settings* page for that resource.

---

### **2. Daily availability editor**

Given I am on the *Availability Settings* page
I see **7 rows**, one for each day:

Lundi — Horaires (start/end or total hours) — Coût horaire — Checkbox "Actif"
Mardi — …
... jusqu'à dimanche

For each day I can:

* Activate/deactivate the day (checkbox)
* Set hours or time ranges
* Set hourly rate

Default state:

* Monday → Friday active
* Saturday/Sunday inactive

---

### **3. Saving**

When I save:

* Records are written to `resource_work_schedule`
* Validation ensures:

  * Hours between 0 and 24
  * Rate > 0
  * At least one day can be active
* Patterns appear in the calendar view (FR27)

---

## Tasks / Subtasks

- [x] Create resource_work_schedule database schema (AC: 3)
  - [x] Define table with day enum and proper indexing
  - [x] Add timezone-aware time storage (startTimeUtc, endTimeUtc)
  - [x] Create organization and resource foreign keys
- [x] Implement availability tRPC procedures (AC: 1, 3)
  - [x] Create getByResourceId and updateDailyPattern procedures
  - [x] Add Zod validation for hours, rates, and business rules
  - [x] Implement organization-based data isolation
- [x] Build Resource Availability Settings page (AC: 1, 2)
  - [x] Create ResourceAvailabilityPage wrapper component
  - [x] Build DailyAvailabilityTable with 7 day rows
  - [x] Implement DayRowEditor component per day
- [x] Create availability editing components (AC: 2)
  - [x] Build DayRowEditor with time pickers and validation
  - [x] Add checkbox activation/deactivation logic
  - [x] Implement atomic update for all 7 days
- [x] Integrate with existing resource management (AC: 1, 3)
  - [x] Add Settings button to resource table actions
  - [x] Create /resources/[resourceId]/availability route
  - [x] Implement optimistic updates with React Query

# 🖥️ **UI Specification (explicit & implementable)**

## **Location**

Resource Management Table → column "Actions" → button
**[⚙️ Paramètres]**
This opens:
`/resources/[resourceId]/availability`

---

## **Page Layout — Resource Availability Settings**

### **Header**

**[Nom de la ressource] — Disponibilités**

---

## **Daily Availability Table (7 rows)**

| Day      | Working Hours     | Hourly Cost | Active |
| -------- | ----------------- | ----------- | ------ |
| Lundi    | [ 09:00 – 17:00 ] | [ 50 € ]    | [ ✓ ]  |
| Mardi    | [ 09:00 – 17:00 ] | [ 50 € ]    | [ ✓ ]  |
| Mercredi | [ 09:00 – 17:00 ] | [ 50 € ]    | [ ✓ ]  |
| Jeudi    | [ 09:00 – 17:00 ] | [ 50 € ]    | [ ✓ ]  |
| Vendredi | [ 09:00 – 17:00 ] | [ 50 € ]    | [ ✓ ]  |
| Samedi   | [ 00:00 – 00:00 ] | [ 0 € ]     | [ ☐ ]  |
| Dimanche | [ 00:00 – 00:00 ] | [ 0 € ]     | [ ☐ ]  |

---

## **Field Behaviour**

**Working Hours**

* Displayed as **two time pickers**: start + end
* OR a numeric field "total hours" depending on Story 2.1 foundations (dev team chooses)
* If day is inactive → fields are disabled and greyed out

**Hourly Cost**

* Numeric input
* Currency read from organization settings
* Disabled if day inactive

**Active checkbox**

* Controls visibility & editability of fields

---

## **Footer Buttons**

* **Enregistrer** (primary)
* **Annuler** (secondary)

---

# 🧱 Technical Requirements (cleaned version)

## Database

New table `resource_work_schedule`:

| Field          | Type                          |
| -------------- | ----------------------------- |
| id             | uuid                          |
| organizationId | uuid                          |
| resourceId     | uuid                          |
| day            | enum('monday', ..., 'sunday') |
| startTimeUtc   | time                          |
| endTimeUtc     | time                          |
| hourlyRate     | decimal(10,2)                 |
| currency       | varchar                       |
| isActive       | boolean                       |

Indexes:

* (resourceId, day)
* (organizationId)
* (day)

---

## tRPC Procedures

New router:
`src/server/api/routers/resourcePatterns.ts`

Endpoints:

* `getByResourceId(resourceId)`
* `updateDailyPattern(resourceId, payload per 7 days)`
* `resetToDefaults(resourceId)` (optional but useful)

All secured with organizationId scoping.

---

## Validation (Zod)

* hours must be between 0–24
* endTime must be after startTime
* hourlyRate > 0 if active
* cannot save if all days are inactive

---

# 🖥️ **UI Components to Build**

```
src/components/resources/
  ResourceAvailabilityPage.tsx        # Page wrapper
  DailyAvailabilityTable.tsx          # Table with 7 rows
  DayRowEditor.tsx                    # Row for "Lundi"
```

**DayRowEditor Props:**

```
day: 'monday' | ... | 'sunday'
active: boolean
startTime: string
endTime: string
rate: number
onChange: (...)
```

Uses ShadCN:

* `Checkbox`
* `Input`
* `TimePicker` (custom)
* `Table` primitives

---

# 🔧 Notes for Developer

* Reuse EditableTable behaviors from story 2.1
* Save all 7 days in one mutation (atomic update)
* Use optimistic updates on React Query
* Store times in UTC, convert on UI
* Calendar integration must read from this table only

## Dev Agent Record

### Context Reference

Epic 2 Advanced Resource Management with day-specific scheduling innovation
Previous story learnings from 2.1 resource creation and basic configuration
Architecture patterns for T3 Stack and modular pipeline foundation

### Agent Model Used

claude-sonnet-4-5-20250929

### Implementation Plan

- Database layer: Utilized existing resource_work_schedule table schema with proper timezone storage
- API layer: Created comprehensive tRPC router with validation and organization isolation
- Frontend layer: Built React components with ShadCN UI following existing patterns
- Integration: Connected resource table with Settings button navigation

### Completion Notes

✅ **Database Integration**
- Verified existing resource_work_schedule table supports all requirements
- Table includes proper foreign keys to resources and organizations
- Day-of-week enum (0-6) enables comprehensive daily patterns
- Time fields with timezone-aware storage for accurate scheduling

✅ **API Implementation**
- Created resourcePatterns router with 3 main procedures:
  - `getByResourceId`: Fetches patterns with defaults for new resources
  - `updateDailyPattern`: Atomic updates for all 7 days with validation
  - `resetToDefaults`: Restore Mon-Fri active, Sat-Sun inactive patterns
- Comprehensive Zod validation for time ranges, hourly rates, and business rules
- Organization-based data isolation using existing membership patterns
- Error handling with custom error types and TRPC integration

✅ **Frontend Components**
- `ResourceAvailabilityPage`: Main page component with loading/error states
- `DailyAvailabilityTable`: Table wrapper with French day names and summary
- `DayRowEditor`: Individual day editor with time pickers and validation
- Full CRUD operations with optimistic updates via React Query

✅ **UI Features**
- French language support (Lundi, Mardi, etc.) as per story requirements
- Time picker inputs with HH:MM validation
- Currency-aware hourly rate inputs with symbol display
- Active/inactive status badges and checkbox controls
- Save/Cancel/Reset workflow with unsaved changes protection

✅ **Integration Points**
- Added Settings button to ResourceTable with "Paramètres" text
- Created `/resources/[resourceId]/availability` route structure
- Navigation integration with proper error handling and loading states
- Consistent with existing T3 Stack and ShadCN patterns

### File List

**Files Created:**
- `src/lib/validations/resourcePattern.ts` - Zod schemas and validation helpers
- `src/lib/types/resourcePattern.ts` - TypeScript types for patterns
- `src/server/api/routers/resourcePatterns.ts` - Pattern CRUD procedures
- `src/components/resources/DayRowEditor.tsx` - Individual day editor component
- `src/components/resources/DailyAvailabilityTable.tsx` - Table with 7 day rows
- `src/components/resources/ResourceAvailabilityPage.tsx` - Main page wrapper
- `src/app/dashboard/resources/[resourceId]/availability/page.tsx` - Route page
- `src/test/components/ResourceAvailabilityPage.test.tsx` - Component tests
- `src/test/components/DayRowEditor.test.tsx` - Day editor tests
- `src/test/api/resourcePatterns.test.ts` - API tests

**Files Modified:**
- `src/server/api/root.ts` - Added resourcePatterns router
- `src/components/resources/ResourceTable.tsx` - Added Settings button

**Database Schema:**
- Used existing `resource_work_schedule` table in `src/server/db/schema.ts`

### Change Log

**2025-12-03 - Initial Implementation**
- Created comprehensive day-specific availability system
- Added French language support for UI elements
- Implemented atomic updates for all 7 days
- Added Settings button navigation from resource table
- Created comprehensive validation and error handling
- Built React components with ShadCN UI integration