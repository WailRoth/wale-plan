import { relations, sql } from "drizzle-orm";
import {
  boolean,
  index,
  pgTableCreator,
  text,
  timestamp,
  integer,
  varchar,
  date,
  time,
  primaryKey,
  numeric,
  json,
} from "drizzle-orm/pg-core";

export const createTable = pgTableCreator((name) => `pg-drizzle_${name}`);

export const posts = createTable(
  "post",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    name: d.varchar({ length: 256 }),
    createdById: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => user.id),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [
    index("created_by_idx").on(t.createdById),
    index("name_idx").on(t.name),
  ],
);

export const user = createTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified")
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  organizationId: integer("organization_id")
    .references(() => organizations.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const session = createTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = createTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = createTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").$defaultFn(
    () => /* @__PURE__ */ new Date(),
  ),
  updatedAt: timestamp("updated_at").$defaultFn(
    () => /* @__PURE__ */ new Date(),
  ),
});

export const userRelations = relations(user, ({ many, one }) => ({
  account: many(account),
  session: many(session),
  organizationMemberships: many(organizationMembers),
  organization: one(organizations, {
    fields: [user.organizationId],
    references: [organizations.id],
  }),
  resources: many(resources),
  timeEntries: many(timeEntries),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, { fields: [account.userId], references: [user.id] }),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, { fields: [session.userId], references: [user.id] }),
}));

// Organization Management
export const organizations = createTable(
  "organization",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    name: d.varchar({ length: 256 }).notNull(),
    description: d.text(),
    slug: d.varchar({ length: 100 }).notNull().unique(),
    timezone: d.varchar({ length: 50 }).notNull().default("UTC"), // IANA timezone identifier
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [
    index("organization_name_idx").on(t.name),
    index("organization_slug_idx").on(t.slug),
    index("organization_timezone_idx").on(t.timezone),
  ],
);

export const organizationMembers = createTable(
  "organization_member",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    organizationId: d
      .integer("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    userId: d
      .text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: d.varchar({ length: 50 }).notNull().default("member"), // owner, admin, member
    joinedAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
  }),
  (t) => [
    index("org_member_org_idx").on(t.organizationId),
    index("org_member_user_idx").on(t.userId),
    index("org_member_role_idx").on(t.role),
  ],
);

// Projects
export const projects = createTable(
  "project",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    organizationId: d
      .integer("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    name: d.varchar({ length: 256 }).notNull(),
    description: d.text(),
    status: d.varchar({ length: 50 }).notNull().default("planning"), // planning, active, completed, archived
    startDate: d.date(),
    endDate: d.date(),
    // Calendar settings for project
    workingDays: d.text("working_days").array().notNull().default(sql`'{"Mon","Tue","Wed","Thu","Fri"}'::text[]`), // Default working days
    workingHours: d.json("working_hours").$type<Record<string, { start: string; end: string }>>().$default(() => ({
      monday: { start: "09:00", end: "17:00" },
      tuesday: { start: "09:00", end: "17:00" },
      wednesday: { start: "09:00", end: "17:00" },
      thursday: { start: "09:00", end: "17:00" },
      friday: { start: "09:00", end: "17:00" },
    })),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [
    index("project_org_idx").on(t.organizationId),
    index("project_status_idx").on(t.status),
    index("project_name_idx").on(t.name),
    index("project_working_days_idx").on(t.workingDays),
  ],
);

// Resources (Human resources with custom work hours and rates)
export const resources = createTable(
  "resource",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    organizationId: d
      .integer("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    userId: d
      .text("user_id")
      .references(() => user.id, { onDelete: "set null" }),
    name: d.varchar({ length: 256 }).notNull(),
    type: d.varchar({ length: 50 }).notNull().default("human"), // human, equipment, material
    hourlyRate: d.numeric({ precision: 10, scale: 2 }),
    dailyWorkHours: d.numeric({ precision: 4, scale: 2 }).default("8"), // e.g., 4.0, 6.5, 8.0 hours
    currency: d.varchar({ length: 3 }).default("USD"),
    isActive: d.boolean().default(true).notNull(),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [
    index("resource_org_idx").on(t.organizationId),
    index("resource_user_idx").on(t.userId),
    index("resource_type_idx").on(t.type),
    index("resource_active_idx").on(t.isActive),
  ],
);

// Tasks
export const tasks = createTable(
  "task",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    projectId: d
      .integer("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    parentId: d.integer("parent_id"), // Will be set later with references
    name: d.varchar({ length: 256 }).notNull(),
    description: d.text(),
    wbsCode: d.varchar({ length: 50 }), // Work Breakdown Structure code (e.g., "1.1.2")
    status: d.varchar({ length: 50 }).notNull().default("not_started"), // not_started, in_progress, completed, rejected
    progress: d.integer().default(0), // Progress percentage (0-100)
    isMilestone: d.boolean().default(false).notNull(),
    scheduledType: d.varchar({ length: 20 }).notNull().default("manual"), // manual, auto
    plannedStartDate: d.date(),
    plannedEndDate: d.date(),
    actualStartDate: d.date(),
    actualEndDate: d.date(),
    duration: d.integer(), // Duration in days
    estimatedHours: d.numeric({ precision: 8, scale: 2 }),
    actualHours: d.numeric({ precision: 8, scale: 2 }).default("0"),
    constraintType: d.varchar({ length: 20 }), // asap, alap, snet, fnlt, mso, mfo
    constraintDate: d.date(),
    deadline: d.date(),
    priority: d.integer().default(0), // Higher number = higher priority
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [
    index("task_project_idx").on(t.projectId),
    index("task_parent_idx").on(t.parentId),
    index("task_status_idx").on(t.status),
    index("task_wbs_idx").on(t.wbsCode),
    index("task_milestone_idx").on(t.isMilestone),
  ],
);


// Task Dependencies (Predecessors/Successors)
export const taskDependencies = createTable(
  "task_dependency",
  (d) => ({
    predecessorId: d
      .integer("predecessor_id")
      .notNull()
      .references(() => tasks.id, { onDelete: "cascade" }),
    successorId: d
      .integer("successor_id")
      .notNull()
      .references(() => tasks.id, { onDelete: "cascade" }),
    dependencyType: d.varchar({ length: 20 }).notNull().default("fs"), // fs, ss, ff, sf (finish-start, start-start, etc.)
    lag: d.integer().default(0), // Lag in days (can be negative for lead)
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
  }),
  (t) => [
    // Composite primary key prevents duplicate dependencies between same predecessor and successor
    primaryKey({
      columns: [t.predecessorId, t.successorId],
      name: "task_dep_unique",
    }),
    index("task_dep_type_idx").on(t.dependencyType),
    index("task_dep_predecessor_idx").on(t.predecessorId),
    index("task_dep_successor_idx").on(t.successorId),
  ],
);

// Resource Assignments
export const resourceAssignments = createTable(
  "resource_assignment",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    taskId: d
      .integer("task_id")
      .notNull()
      .references(() => tasks.id, { onDelete: "cascade" }),
    resourceId: d
      .integer("resource_id")
      .notNull()
      .references(() => resources.id, { onDelete: "cascade" }),
    assignedUnits: d.numeric({ precision: 4, scale: 2 }).default("1"), // Percentage of resource (e.g., 0.5 = 50%)
    assignedHours: d.numeric({ precision: 8, scale: 2 }),
    cost: d.numeric({ precision: 10, scale: 2 }), // Calculated cost
    startDate: d.date(),
    endDate: d.date(),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [
    index("resource_assignment_task_idx").on(t.taskId),
    index("resource_assignment_resource_idx").on(t.resourceId),
    index("resource_assignment_dates_idx").on(t.startDate, t.endDate),
  ],
);

// Baselines
export const baselines = createTable(
  "baseline",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    projectId: d
      .integer("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    name: d.varchar({ length: 256 }).notNull(),
    description: d.text(),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
  }),
  (t) => [
    index("baseline_project_idx").on(t.projectId),
    index("baseline_name_idx").on(t.name),
  ],
);

// Baseline Tasks (Snapshot of tasks when baseline was created)
export const baselineTasks = createTable(
  "baseline_task",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    baselineId: d
      .integer("baseline_id")
      .notNull()
      .references(() => baselines.id, { onDelete: "cascade" }),
    taskId: d
      .integer("task_id")
      .notNull()
      .references(() => tasks.id, { onDelete: "cascade" }),
    name: d.varchar({ length: 256 }).notNull(),
    description: d.text(),
    plannedStartDate: d.date(),
    plannedEndDate: d.date(),
    estimatedHours: d.numeric({ precision: 8, scale: 2 }),
    progress: d.integer().default(0),
    isMilestone: d.boolean().default(false).notNull(),
  }),
  (t) => [
    index("baseline_task_baseline_idx").on(t.baselineId),
    index("baseline_task_task_idx").on(t.taskId),
  ],
);

// Enhanced Resource Scheduling Tables

// Resource Work Schedules - Day-specific work patterns
export const resourceWorkSchedules = createTable(
  "resource_work_schedule",
  (d) => ({
    resourceId: d
      .integer("resource_id")
      .notNull()
      .references(() => resources.id, { onDelete: "cascade" }),
    dayOfWeek: d.integer().notNull(), // 0-6 (Sunday=0 or Monday=0 based on preference)
    dayType: d.varchar({ length: 20 }).notNull().default("regular"), // regular, weekend, holiday, custom
    isWorkingDay: d.boolean().default(true).notNull(),
    workStartTime: d.time(), // e.g., "09:00:00"
    workEndTime: d.time(), // e.g., "17:00:00"
    breakStartTime: d.time(), // e.g., "12:00:00"
    breakEndTime: d.time(), // e.g., "13:00:00"
    totalWorkHours: d.numeric({ precision: 4, scale: 2 }), // Calculated work hours for this day
    hourlyRate: d.numeric({ precision: 10, scale: 2 }), // Can vary by day type
    currency: d.varchar({ length: 3 }).default("USD"),
    isActive: d.boolean().default(true).notNull(),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [
    // Composite primary key ensures unique combination of resource and day
    primaryKey({
      columns: [t.resourceId, t.dayOfWeek],
      name: "resource_schedule_unique",
    }),
    index("resource_schedule_type_idx").on(t.dayType),
    index("resource_schedule_active_idx").on(t.isActive),
  ],
);

// Resource Availability - Non-working periods and vacations
export const resourceAvailability = createTable(
  "resource_availability",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    resourceId: d
      .integer("resource_id")
      .notNull()
      .references(() => resources.id, { onDelete: "cascade" }),
    startDate: d.date().notNull(),
    endDate: d.date().notNull(),
    availabilityType: d.varchar({ length: 20 }).notNull(), // vacation, sick_leave, holiday, training, unavailable
    description: d.text(),
    isFullDay: d.boolean().default(true).notNull(), // If false, specific times apply
    startTime: d.time(), // Only used if isFullDay is false
    endTime: d.time(), // Only used if isFullDay is false
    isRecurring: d.boolean().default(false).notNull(),
    recurringPattern: d.varchar({ length: 50 }), // daily, weekly, monthly, yearly
    recurringEndDate: d.date(), // When recurring pattern ends
    timeZone: d.varchar({ length: 50 }), // Time zone for availability periods
    isActive: d.boolean().default(true).notNull(),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [
    index("resource_availability_resource_idx").on(t.resourceId),
    index("resource_availability_dates_idx").on(t.startDate, t.endDate),
    index("resource_availability_type_idx").on(t.availabilityType),
    index("resource_availability_active_idx").on(t.isActive),
  ],
);

// Resource Time Zones - Store time zone information per resource
export const resourceTimeZones = createTable(
  "resource_time_zone",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    resourceId: d
      .integer("resource_id")
      .notNull()
      .references(() => resources.id, { onDelete: "cascade" }),
    timeZone: d.varchar({ length: 50 }).notNull(), // IANA time zone identifier (e.g., "America/New_York")
    utcOffset: d.varchar({ length: 6 }), // e.g., "-05:00", "+01:00"
    isDST: d.boolean().default(false).notNull(), // Observes Daylight Saving Time
    isActive: d.boolean().default(true).notNull(),
    effectiveDate: d.date().notNull().defaultNow(), // When this time zone became effective
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [
    index("resource_timezone_resource_idx").on(t.resourceId),
    index("resource_timezone_active_idx").on(t.isActive),
    index("resource_timezone_effective_idx").on(t.effectiveDate),
  ],
);

// Dynamic Pricing Tables for variable rates by workday type
export const resourceDayTypeRates = createTable(
  "resource_day_type_rate",
  (d) => ({
    resourceId: d
      .integer("resource_id")
      .notNull()
      .references(() => resources.id, { onDelete: "cascade" }),
    dayType: d.varchar({ length: 20 }).notNull(), // regular, overtime, weekend, holiday
    baseHourlyRate: d.numeric({ precision: 10, scale: 2 }).notNull(),
    overtimeMultiplier: d.numeric({ precision: 4, scale: 2 }).default("1.5"), // e.g., 1.5x for overtime
    currency: d.varchar({ length: 3 }).default("USD"),
    minimumHours: d.numeric({ precision: 4, scale: 2 }).default("0"), // Minimum hours for this rate
    maximumHours: d.numeric({ precision: 4, scale: 2 }), // Maximum hours before next rate tier
    effectiveDate: d.date().notNull().defaultNow(),
    expiryDate: d.date(), // When this rate expires (null = no expiry)
    isActive: d.boolean().default(true).notNull(),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [
    // Composite primary key ensures unique combination of resource, day type, and effective date
    primaryKey({
      columns: [t.resourceId, t.dayType, t.effectiveDate],
      name: "resource_rate_unique",
    }),
    index("resource_rate_day_type_idx").on(t.dayType),
    index("resource_rate_effective_idx").on(t.effectiveDate),
    index("resource_rate_active_idx").on(t.isActive),
  ],
);

// Time Entries for actual time tracking
export const timeEntries = createTable(
  "time_entry",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    taskId: d
      .integer("task_id")
      .notNull()
      .references(() => tasks.id, { onDelete: "cascade" }),
    resourceId: d
      .integer("resource_id")
      .notNull()
      .references(() => resources.id, { onDelete: "cascade" }),
    userId: d
      .text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    date: d.date().notNull(),
    startTime: d.time(),
    endTime: d.time(),
    hours: d.numeric({ precision: 4, scale: 2 }).notNull(),
    dayType: d.varchar({ length: 20 }).notNull().default("regular"), // Track what type of day this was
    hourlyRate: d.numeric({ precision: 10, scale: 2 }), // Actual rate used (can vary by day type)
    cost: d.numeric({ precision: 10, scale: 2 }),
    timeZone: d.varchar({ length: 50 }), // Time zone of the time entry
    isOvertime: d.boolean().default(false).notNull(),
    description: d.text(),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [
    index("time_entry_task_idx").on(t.taskId),
    index("time_entry_resource_idx").on(t.resourceId),
    index("time_entry_user_idx").on(t.userId),
    index("time_entry_date_idx").on(t.date),
    index("time_entry_day_type_idx").on(t.dayType),
    index("time_entry_overtime_idx").on(t.isOvertime),
  ],
);

// Relations
export const organizationRelations = relations(organizations, ({ many }) => ({
  members: many(organizationMembers),
  projects: many(projects),
  resources: many(resources),
  users: many(user),
}));

export const organizationMemberRelations = relations(organizationMembers, ({ one }) => ({
  organization: one(organizations, {
    fields: [organizationMembers.organizationId],
    references: [organizations.id],
  }),
  user: one(user, {
    fields: [organizationMembers.userId],
    references: [user.id],
  }),
}));

export const projectRelations = relations(projects, ({ many, one }) => ({
  organization: one(organizations, {
    fields: [projects.organizationId],
    references: [organizations.id],
  }),
  tasks: many(tasks),
  baselines: many(baselines),
}));

export const resourceRelations = relations(resources, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [resources.organizationId],
    references: [organizations.id],
  }),
  user: one(user, {
    fields: [resources.userId],
    references: [user.id],
  }),
  assignments: many(resourceAssignments),
  timeEntries: many(timeEntries),
  workSchedules: many(resourceWorkSchedules),
  availabilityPeriods: many(resourceAvailability),
  timeZones: many(resourceTimeZones),
  dayTypeRates: many(resourceDayTypeRates),
}));

export const taskRelations = relations(tasks, ({ one, many }) => ({
  project: one(projects, {
    fields: [tasks.projectId],
    references: [projects.id],
  }),
  parent: one(tasks, {
    fields: [tasks.parentId],
    references: [tasks.id],
    relationName: "taskHierarchy",
  }),
  children: many(tasks, {
    relationName: "taskHierarchy",
  }),
  predecessors: many(taskDependencies, {
    relationName: "predecessorDependencies",
  }),
  successors: many(taskDependencies, {
    relationName: "successorDependencies",
  }),
  assignments: many(resourceAssignments),
  timeEntries: many(timeEntries),
  baselineSnapshots: many(baselineTasks),
}));

export const taskDependencyRelations = relations(taskDependencies, ({ one }) => ({
  predecessor: one(tasks, {
    fields: [taskDependencies.predecessorId],
    references: [tasks.id],
    relationName: "predecessorDependencies",
  }),
  successor: one(tasks, {
    fields: [taskDependencies.successorId],
    references: [tasks.id],
    relationName: "successorDependencies",
  }),
}));

export const resourceAssignmentRelations = relations(resourceAssignments, ({ one }) => ({
  task: one(tasks, {
    fields: [resourceAssignments.taskId],
    references: [tasks.id],
  }),
  resource: one(resources, {
    fields: [resourceAssignments.resourceId],
    references: [resources.id],
  }),
}));

export const baselineRelations = relations(baselines, ({ one, many }) => ({
  project: one(projects, {
    fields: [baselines.projectId],
    references: [projects.id],
  }),
  tasks: many(baselineTasks),
}));

export const baselineTaskRelations = relations(baselineTasks, ({ one }) => ({
  baseline: one(baselines, {
    fields: [baselineTasks.baselineId],
    references: [baselines.id],
  }),
  task: one(tasks, {
    fields: [baselineTasks.taskId],
    references: [tasks.id],
  }),
}));

export const timeEntryRelations = relations(timeEntries, ({ one }) => ({
  task: one(tasks, {
    fields: [timeEntries.taskId],
    references: [tasks.id],
  }),
  resource: one(resources, {
    fields: [timeEntries.resourceId],
    references: [resources.id],
  }),
  user: one(user, {
    fields: [timeEntries.userId],
    references: [user.id],
  }),
}));

// Relations for Enhanced Resource Scheduling Tables

export const resourceWorkScheduleRelations = relations(resourceWorkSchedules, ({ one }) => ({
  resource: one(resources, {
    fields: [resourceWorkSchedules.resourceId],
    references: [resources.id],
  }),
}));

export const resourceAvailabilityRelations = relations(resourceAvailability, ({ one }) => ({
  resource: one(resources, {
    fields: [resourceAvailability.resourceId],
    references: [resources.id],
  }),
}));

export const resourceTimeZoneRelations = relations(resourceTimeZones, ({ one }) => ({
  resource: one(resources, {
    fields: [resourceTimeZones.resourceId],
    references: [resources.id],
  }),
}));

export const resourceDayTypeRateRelations = relations(resourceDayTypeRates, ({ one }) => ({
  resource: one(resources, {
    fields: [resourceDayTypeRates.resourceId],
    references: [resources.id],
  }),
}));

