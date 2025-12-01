# Technical Specification: Day-Specific Scheduling Engine

**Project:** wale-plan
**Version:** 1.0
**Date:** 2025-12-01
**Author:** Technical Architecture Team

## Executive Summary

This technical specification details the implementation of wale-plan's core innovation: a day-specific scheduling engine that breaks from traditional uniform-week assumptions in project management. The specification builds on the existing Next.js + TypeScript + tRPC + Drizzle ORM foundation while focusing on performance, user experience, and scalability.

## Table of Contents

1. [Current Technical Foundation](#1-current-technical-foundation)
2. [Core Technical Challenges](#2-core-technical-challenges)
3. [Implementation Strategy](#3-implementation-strategy)
4. [Scheduling Engine Core Implementation](#4-scheduling-engine-core-implementation)
5. [Backward Pass & Critical Path Calculation](#44-backward-pass--critical-path-calculation)
6. [Real-Time Conflict Detection System](#5-real-time-conflict-detection-system)
7. [Performance Optimization Strategy](#6-performance-optimization-strategy)
8. [Database Integration](#7-database-integration)
9. [UI Integration & User Experience](#8-ui-integration--user-experience)
10. [Testing Strategy & Validation](#9-testing-strategy--validation)
11. [Deployment & Monitoring](#10-deployment--monitoring)

---

## 1. Current Technical Foundation

### ✅ Excellent Base Architecture
- **Next.js 15 + TypeScript + tRPC** - Modern full-stack with type safety
- **Drizzle ORM + PostgreSQL** - Robust database with complex schema already designed
- **NextAuth.js + Organizations** - Multi-tenant SaaS foundation
- **ShadCN UI + Tailwind** - Professional component system
- **Complex resource management schema** already implemented

### Database Schema Analysis
The existing schema includes sophisticated day-specific scheduling tables:
- `resourceSchedules` - Day-specific availability patterns
- `resourceDayTypeRates` - Variable rates by day type
- `resourceAvailability` - Calendar-based availability
- `taskAssignments` - Resource allocation with percentage support
- `taskDependencies` - Predecessor/successor relationships

## 2. Core Technical Challenges

### 2.1 Scheduling Algorithm Implementation
Challenge: Implement forward pass scheduling algorithm that respects day-specific resource availability while maintaining MS Project compatibility.

### 2.2 Real-Time Conflict Detection
Challenge: Provide immediate feedback when resource patterns change, detecting overallocations and dependency conflicts within performance thresholds.

### 2.3 Performance Optimization
Challenge: Meet NFR1 (sub-second recalculation for 200+ tasks) through incremental updates and intelligent caching.

## 3. Implementation Strategy

### Phase 1: Core Scheduling Engine (Week 1-2)
1. Implement `SchedulingEngine` class with forward pass algorithm
2. Build conflict detection system
3. Create scheduling result data structures
4. Unit test with sample day-specific scenarios

### Phase 2: UI Integration (Week 2-3)
1. Connect scheduling engine to existing task/resource tables
2. Build real-time conflict detection UI components
3. Implement schedule recalculation triggers
4. Add visual feedback for conflicts

### Phase 3: Performance Optimization (Week 3-4)
1. Implement incremental recalculation
2. Add database performance indexes
3. Optimize large project handling
4. Performance test against NFRs

## 4. Scheduling Engine Core Implementation

### 4.1 Data Structures and Types

```typescript
interface DaySpecificSchedule {
  resourceId: string;
  date: Date;
  dayType: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday' | 'custom';
  hoursAvailable: number;
  hourlyRate: number;
  isActive: boolean;
}

interface SchedulingContext {
  project: Project;
  resources: Map<string, Resource>;
  resourceSchedules: Map<string, DaySpecificSchedule[]>;
  tasks: Task[];
  dependencies: TaskDependency[];
  assignments: TaskAssignment[];
}

interface ScheduleResult {
  tasks: ScheduledTask[];
  conflicts: SchedulingConflict[];
  warnings: SchedulingWarning[];
  criticalPath: CriticalPathAnalysis;
  performance: PerformanceMetrics;
}

interface CriticalPathAnalysis {
  criticalPath: string[];
  totalSlack: Map<string, number>;
  freeSlack: Map<string, number>;
  projectEndDate: Date;
}

interface ScheduledTask extends Task {
  startDate: Date;
  endDate: Date;
  earliestStart: Date;
  earliestFinish: Date;
  latestStart: Date;
  latestFinish: Date;
  totalSlack: number;
  freeSlack: number;
  isCritical: boolean;
}
```

### 4.2 Forward Pass Scheduling Algorithm

The core scheduling engine implements a dual-pass algorithm through the dependency network:

1. **Topological Sort**: Order tasks by dependencies
2. **Forward Pass**: Calculate earliest start dates (ES) and earliest finish dates (EF) considering resource availability
3. **Backward Pass**: Calculate latest start dates (LS) and latest finish dates (LF) using inverse dependency graph
4. **Slack Computation**: Calculate total slack and free slack for critical path analysis
5. **Critical Path Extraction**: Identify tasks on critical path (slack = 0)
6. **Conflict Detection**: Identify overallocations and constraint violations
7. **Result Generation**: Return complete schedule with actionable feedback and critical path visualization

### 4.3 Resource Availability Calculation

```typescript
class ResourceAvailabilityCalculator {
  calculateAvailableHours(
    resourceId: string,
    dateRange: DateRange,
    schedules: DaySpecificSchedule[]
  ): Map<Date, number> {
    const availability = new Map<Date, number>();

    for (const date of this.eachDay(dateRange.start, dateRange.end)) {
      const dayOfWeek = date.getDay();
      const dayType = this.getDayType(dayOfWeek);

      const schedule = schedules.find(s =>
        s.resourceId === resourceId &&
        s.dayType === dayType &&
        s.isActive
      );

      availability.set(date, schedule?.hoursAvailable || 0);
    }

    return availability;
  }
}
```

## 5. Real-Time Conflict Detection System

### 5.1 Backward Pass & Critical Path Calculation

```typescript
interface CriticalPathAnalysis {
  criticalPath: string[];
  totalSlack: Map<string, number>;
  freeSlack: Map<string, number>;
  projectEndDate: Date;
}

class BackwardPassCalculator {
  async calculateCriticalPath(
    forwardResult: ScheduleResult,
    context: SchedulingContext
  ): Promise<CriticalPathAnalysis> {

    // Step 1: Build inverse dependency graph (successor relationships)
    const successorMap = this.buildSuccessorMap(context.dependencies);

    // Step 2: Initialize latest dates for backward pass
    const latestDates = new Map<string, { LS: Date, LF: Date }>();
    const projectEndDate = this.determineProjectEndDate(forwardResult.tasks);

    // Step 3: Backward pass through reverse topological order
    const reverseOrder = forwardResult.tasks.reverse();

    for (const task of reverseOrder) {
      const successors = successorMap.get(task.id) || [];

      if (successors.length === 0) {
        // End task - latest finish = project end date
        const LF = projectEndDate;
        const LS = this.subtractWorkdays(LF, task.duration);
        latestDates.set(task.id, { LS, LF });
      } else {
        // Calculate latest start from successor constraints
        const successorConstraints = successors.map(successorId => {
          const successorLatest = latestDates.get(successorId);
          if (!successorLatest) {
            throw new Error(`Missing latest date for successor ${successorId}`);
          }
          return this.subtractWorkdays(successorLatest.LS,
            this.getDependencyLag(task.id, successorId, context.dependencies));
        });

        // Latest finish = earliest of successor latest starts
        const LF = new Date(Math.min(...successorConstraints.map(d => d.getTime())));
        const LS = this.subtractWorkdays(LF, task.duration);

        latestDates.set(task.id, { LS, LF });
      }
    }

    // Step 4: Calculate slack values
    const totalSlack = new Map<string, number>();
    const freeSlack = new Map<string, number>();

    for (const task of forwardResult.tasks) {
      const earliest = {
        ES: task.startDate,
        EF: task.endDate
      };

      const latest = latestDates.get(task.id)!;

      // Total slack = LS - ES
      const slackDays = this.calculateWorkdays(earliest.ES, latest.LS);
      totalSlack.set(task.id, slackDays);

      // Free slack = min(successor LS - current EF, for each successor)
      const successors = successorMap.get(task.id) || [];
      if (successors.length > 0) {
        const successorSlacks = successors.map(successorId => {
          const successorLatest = latestDates.get(successorId)!;
          const lag = this.getDependencyLag(task.id, successorId, context.dependencies);
          return this.calculateWorkdays(earliest.EF,
            this.subtractWorkdays(successorLatest.LS, lag));
        });
        freeSlack.set(task.id, Math.min(...successorSlacks));
      } else {
        freeSlack.set(task.id, 0); // End tasks have no free slack
      }
    }

    // Step 5: Extract critical path (tasks with total slack = 0)
    const criticalPath = Array.from(totalSlack.entries())
      .filter(([_, slack]) => slack === 0)
      .map(([taskId, _]) => taskId);

    return {
      criticalPath,
      totalSlack,
      freeSlack,
      projectEndDate
    };
  }

  private buildSuccessorMap(dependencies: TaskDependency[]): Map<string, string[]> {
    const successorMap = new Map<string, string[]>();

    for (const dep of dependencies) {
      if (!successorMap.has(dep.predecessorTaskId)) {
        successorMap.set(dep.predecessorTaskId, []);
      }
      successorMap.get(dep.predecessorTaskId)!.push(dep.successorTaskId);
    }

    return successorMap;
  }

  private determineProjectEndDate(tasks: ScheduledTask[]): Date {
    return new Date(Math.max(...tasks.map(task => task.endDate.getTime())));
  }

  private subtractWorkdays(date: Date, workdays: number): Date {
    let result = new Date(date);
    let daysRemoved = 0;

    while (daysRemoved < workdays) {
      result.setDate(result.getDate() - 1);
      if (result.getDay() !== 0 && result.getDay() !== 6) { // Not Sunday or Saturday
        daysRemoved++;
      }
    }

    return result;
  }

  private calculateWorkdays(startDate: Date, endDate: Date): number {
    let workdays = 0;
    let current = new Date(startDate);

    while (current < endDate) {
      if (current.getDay() !== 0 && current.getDay() !== 6) {
        workdays++;
      }
      current.setDate(current.getDate() + 1);
    }

    return workdays;
  }

  private getDependencyLag(
    predecessorId: string,
    successorId: string,
    dependencies: TaskDependency[]
  ): number {
    const dep = dependencies.find(d =>
      d.predecessorTaskId === predecessorId && d.successorTaskId === successorId
    );
    return dep?.lag || 0;
  }
}
```

### 5.1 Conflict Types

- **Resource Overallocation**: When assigned hours exceed daily availability
- **Calendar Unavailability**: When tasks scheduled on resource unavailable days
- **Dependency Cycles**: Circular dependencies preventing scheduling
- **Constraint Violations**: Task constraint conflicts (start/finish dates)

### 5.2 Incremental Conflict Detection

```typescript
class IncrementalConflictDetector {
  async detectIncrementalConflicts(
    changes: ResourceChange[],
    currentSchedule: ScheduleResult,
    context: SchedulingContext
  ): Promise<SchedulingConflict[]> {
    const affectedTaskIds = this.findAffectedTasks(changes, currentSchedule.tasks);
    const newConflicts: SchedulingConflict[] = [];

    for (const taskId of affectedTaskIds) {
      const task = currentSchedule.tasks.find(t => t.id === taskId);
      if (task) {
        const taskConflicts = await this.detectTaskConflicts(task, context);
        newConflicts.push(...taskConflicts);
      }
    }

    return newConflicts;
  }
}
```

## 6. Performance Optimization Strategy

### 6.1 Database Indexing

```sql
-- Critical indexes for scheduling performance
CREATE INDEX idx_resource_schedules_resource_date
ON resource_schedules(resource_id, date, is_active);

CREATE INDEX idx_tasks_dependencies
ON task_dependencies(predecessor_task_id, successor_task_id);

CREATE INDEX idx_task_assignments_resource_date
ON task_assignments(resource_id, scheduled_date);
```

### 6.2 Caching Strategy

```typescript
class SchedulingCache {
  private scheduleCache = new Map<string, ScheduleResult>();
  private resourceAvailabilityCache = new Map<string, Map<Date, number>>();

  async getCachedSchedule(projectId: string): Promise<ScheduleResult | null> {
    const cached = this.scheduleCache.get(projectId);
    if (cached && !this.isCacheExpired(cached)) {
      return cached;
    }
    return null;
  }
}
```

### 6.3 Incremental Recalculation

Only recalculate affected portions when resource patterns change:
1. Calculate impact scope of changes
2. Recalculate only affected tasks
3. Merge with unchanged portions
4. Cache updated result

## 7. Database Integration

### 7.1 Service Layer Architecture

```typescript
class SchedulingDataService {
  constructor(private db: DrizzleDB) {}

  async loadProjectContext(projectId: string): Promise<SchedulingContext> {
    const [project, resources, tasks, dependencies, assignments] = await Promise.all([
      this.db.select().from(projects).where(eq(projects.id, projectId)).limit(1),
      this.loadProjectResources(projectId),
      this.loadProjectTasks(projectId),
      this.loadTaskDependencies(projectId),
      this.loadTaskAssignments(projectId)
    ]);

    const resourceSchedules = await this.loadResourceSchedules(
      resources.map(r => r.id)
    );

    return {
      project: project[0],
      resources: new Map(resources.map(r => [r.id, r])),
      resourceSchedules: new Map(Object.entries(resourceSchedules)),
      tasks,
      dependencies,
      assignments
    };
  }
}
```

## 8. UI Integration & User Experience

### 8.1 Resource Configuration Table Component

Inline editing table for day-specific resource configuration:
- **Active checkboxes** for each day type
- **Hours inputs** for daily availability
- **Rate inputs** for day-specific hourly rates
- **Daily cost calculations** with real-time updates

### 8.2 Task Management with Dependencies

MS Project-like task table with:
- **Inline editing** for task properties (name, duration, predecessors)
- **Dependency editor** supporting FS/SS/FF/SF types with lag
- **Resource assignment** with percentage allocation
- **Status tracking** with visual indicators

### 8.3 Critical Path Visualization

MS Project-style critical path visualization providing:
- **Critical path highlighting** in Gantt chart (red/orange task bars)
- **Slack time display** in task tables and Gantt tooltips
- **Total slack vs free slack** differentiation
- **Critical path length calculation** and duration display

```typescript
const CriticalPathIndicator: React.FC<{ task: ScheduledTask }> = ({ task }) => {
  return (
    <div className="flex items-center space-x-2">
      <div className={`w-3 h-3 rounded-full ${
        task.isCritical ? 'bg-red-500' : 'bg-gray-300'
      }`} title={task.isCritical ? 'Critical Path' : 'Non-Critical'} />
      <span className="text-sm font-mono">
        {task.totalSlack}d slack
      </span>
      {task.freeSlack !== task.totalSlack && (
        <span className="text-xs text-muted-foreground">
          ({task.freeSlack}d free)
        </span>
      )}
    </div>
  );
};

const CriticalPathSummary: React.FC<{ analysis: CriticalPathAnalysis }> = ({ analysis }) => {
  return (
    <Card className="p-4">
      <h4 className="text-sm font-semibold mb-2">Critical Path Summary</h4>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-muted-foreground">Critical Path Length:</span>
          <span className="font-medium">{analysis.criticalPath.length} tasks</span>
        </div>
        <div>
          <span className="text-muted-foreground">Project Duration:</span>
          <span className="font-medium">
            {this.calculateWorkdays(
              analysis.projectStartDate,
              analysis.projectEndDate
            )} days
          </span>
        </div>
      </div>
    </Card>
  );
};
```

### 8.4 Real-Time Conflict Visualization

Conflict alert system providing:
- **Severity-based color coding** (error/warning)
- **Expandable detail panels** with suggestions
- **Auto-resolution options** for common conflicts
- **Visual indicators** in task/resource tables
- **Critical path-aware conflict prioritization** (conflicts on critical path take precedence)

### 8.5 Performance Optimization

- **Virtual scrolling** for large task tables (300+ tasks)
- **Optimistic updates** with rollback capability
- **Debounced API calls** for resource pattern changes
- **Smart caching** of scheduling results

## 9. Testing Strategy & Validation

### 9.1 Unit Testing Coverage

**Scheduling Algorithm Tests:**
- Forward pass with simple/complex dependencies
- Manual vs auto-scheduled task handling
- Resource availability constraint application
- Performance validation (NFR compliance)

**Backward Pass Tests:**
- Critical path identification with exact slack calculation
- Total slack vs free slack computation
- Latest start/finish date calculation
- Project end date determination
- Dependency lag handling in backward pass

**Conflict Detection Tests:**
- Resource overallocation detection
- Dependency cycle identification
- Calendar conflict validation
- Constraint violation checking
- Critical path conflict prioritization

### 9.2 Integration Testing

**Database Integration:**
- Complete project context loading
- Day-specific schedule persistence
- Incremental update performance
- Complex query optimization

**API Integration:**
- Schedule calculation endpoints
- Incremental recalculation requests
- Conflict detection APIs
- Performance monitoring integration

### 9.3 End-to-End Testing

**User Workflow Tests:**
- Resource configuration → schedule calculation
- Task creation → dependency management → assignment
- Conflict detection → resolution workflow
- Large project handling performance

### 9.4 Performance Testing

**Load Testing Scenarios:**
- 300 tasks with complex dependencies
- 100 resources with day-specific patterns
- Concurrent scheduling calculations
- Database query performance under load

### 9.5 NFR Validation

All tests validate compliance with defined NFRs:
- **NFR1:** Sub-second recalculation for 200+ tasks
- **NFR2:** Sub-100ms table interactions
- **NFR3:** Smooth Gantt rendering for 300+ tasks
- **NFR4:** Sub-200ms data persistence

## 10. Deployment & Monitoring

### 10.1 Environment Configuration

Multi-environment setup with:
- **Development:** Local PostgreSQL, Redis
- **Staging:** Cloud database with production-like data
- **Production:** Managed database service with connection pooling

### 10.2 Container Deployment

Docker-based deployment with:
- **Multi-stage builds** for optimized image size
- **Health checks** for service monitoring
- **Environment-specific configurations**
- **Volume mounting** for data persistence

### 10.3 Performance Monitoring

Real-time monitoring of:
- **Scheduling calculation performance** (NFR compliance)
- **Database query performance** (slow query detection)
- **API response times** (user experience metrics)
- **Memory usage** (resource optimization)

### 10.4 Scaling Strategy

**Horizontal Scaling:**
- **Job queuing** with Redis for scheduling calculations
- **Load balancing** across multiple instances
- **Database read replicas** for reporting queries
- **Cache distribution** for result sharing

## Implementation Success Criteria

### Technical Success Metrics

- ✅ **NFR Compliance:** All performance targets met
- ✅ **Conflict Detection:** 95% accuracy in real-world scenarios
- ✅ **User Experience:** Sub-100ms interaction response
- ✅ **Scalability:** Supports 300+ tasks without degradation

### Business Success Metrics

- ✅ **Personal Usability:** 3 projects completed without spreadsheets
- ✅ **Day-Specific Innovation:** Complex scheduling patterns working
- ✅ **MS Project Parity:** Familiar interaction patterns maintained
- ✅ **Performance:** Competitive response times vs. legacy tools

---

## Conclusion

This technical specification provides a comprehensive roadmap for implementing wale-plan's innovative day-specific scheduling engine. The specification builds upon the existing robust foundation while focusing on the core innovation that differentiates the product in the market.

The phased implementation approach ensures rapid MVP delivery while maintaining quality and performance standards. The comprehensive testing strategy guarantees reliability and user experience excellence.

### Next Steps

1. **Begin Phase 1:** Implement core scheduling engine
2. **Set up monitoring:** Configure performance tracking
3. **Start unit testing:** Validate algorithm correctness
4. **Prepare UI components:** Design resource/task tables
5. **Plan integration:** Define API contracts

This technical specification serves as the definitive implementation guide for delivering a high-performance day-specific project management solution.