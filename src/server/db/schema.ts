import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  pgTable,
  pgTableCreator,
  text,
  timestamp,
  integer,
  varchar,
  date,
  time,
  primaryKey,
  numeric,
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

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified")
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const session = pgTable("session", {
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

export const account = pgTable("account", {
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

export const verification = pgTable("verification", {
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

export const userRelations = relations(user, ({ many }) => ({
  account: many(account),
  session: many(session),
  organizationMemberships: many(organizationMembers),
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
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [
    index("organization_name_idx").on(t.name),
    index("organization_slug_idx").on(t.slug),
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
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
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
    index("task_dep_predecessor_idx").on(t.predecessorId),
    index("task_dep_successor_idx").on(t.successorId),
    index("task_dep_type_idx").on(t.dependencyType),
    // Prevent duplicate dependencies
    primaryKey({
      columns: [t.predecessorId, t.successorId],
      name: "task_dep_unique",
    }),
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
    description: d.text(),
    cost: d.numeric({ precision: 10, scale: 2 }),
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
  ],
);

// Relations
export const organizationRelations = relations(organizations, ({ many }) => ({
  members: many(organizationMembers),
  projects: many(projects),
  resources: many(resources),
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

