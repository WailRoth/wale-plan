---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
lastStep: 11
inputDocuments: [
  "/.clavix/outputs/advanced-project-management/full-prd.md",
  "/.clavix/outputs/advanced-project-management/quick-prd.md",
  "/.clavix/outputs/advanced-project-management/tasks.md"
]
workflowType: 'prd'
lastStep: 1
project_name: 'wale-plan'
user_name: 'Alexisdumain'
date: '2025-12-01T17:51:00.000Z'
---

# Product Requirements Document - Advanced Project Management Solution

**Author:** Alexisdumain
**Date:** 2025-12-01T17:51:00.000Z
**Collaborative Analysis:** Built upon comprehensive analysis with Mary via Clavix Planning Mode

## Executive Summary

Build a flexible, web-based project management solution that matches Microsoft Project's power while solving key limitations: inflexibility, high cost, and poor collaboration. Target organizations needing advanced project planning with complex resource management and multi-user access.

## Problem Statement

Existing project management tools like Microsoft Project are inflexible, expensive, and lack proper web-based collaboration capabilities with complex resource management. Organizations need a modern, accessible solution that enables sophisticated project planning while supporting distributed teams.

## Core Value Proposition

**🎯 Strategic Advantage:** Microsoft Project's power with modern web collaboration
**💰 Economic Benefit:** Lower total cost of ownership with superior flexibility
**🌐 Accessibility:** Web-based with multi-user synchronization and organization management

## Target Users & Use Cases

**Primary Users:** Project managers, team leads, resource managers in organizations with:
- Multiple projects requiring advanced resource allocation
- Complex scheduling with day-specific work patterns and variable rates
- Need for baseline comparisons and progress tracking
- Distributed teams requiring web-based collaboration

## Must-Have Features (Prioritized)

### 1. **Gantt Charts with Task Dependencies** 🔥 HIGH
- Visual timeline with predecessor/successor relationships
- Drag-and-drop task scheduling
- Critical path visualization
- WBS hierarchy display

### 2. **Advanced Resource Management** 🔥 HIGH
- Sophisticated resource availability system with day-specific work schedules
- Variable daily hours and rates (Mon-Fri, weekends, custom patterns)
- Time zone support and non-working period management
- Resource allocation with conflict detection

### 3. **Multi-User Organization Management** 🔥 HIGH
- Organizations containing multiple users and multiple projects
- Role-based access control and permissions
- Data synchronization across team members

### 4. **Comprehensive Task Management** 🔥 MEDIUM
- Task hierarchy (summary tasks with child relationships)
- Manual and auto-scheduled tasks with status tracking
- Task constraints (start/finish dates, deadlines)
- Progress percentage and milestone identification

### 5. **Time Tracking & Reporting** 🔥 MEDIUM
- Actual vs planned time comparison
- Budget tracking based on variable resource rates
- Baseline save/restore functionality
- Progress reports with visual indicators

## Project Vision & Strategic Context

### Vision Statement
To deliver Microsoft Project's power with modern web collaboration, eliminating the forced choice between enterprise-grade capabilities and accessible team collaboration.

### Core Innovation: Advanced Resource Management
Our key differentiator is a sophisticated resource scheduling system that enables:
- Day-specific work patterns (Mon-Fri, weekends, custom schedules)
- Variable daily hours and rates per workday type
- Time zone support and non-working period management
- Dynamic cost calculation based on workday patterns

### Target Market
Organizations requiring advanced project planning with complex resource allocation needs, particularly those with distributed teams and sophisticated scheduling requirements.

## Project Classification

**Technical Type:** saas_b2b
**Domain:** general (standard software practices)
**Complexity:** high (advanced scheduling algorithms, multi-user synchronization)

**Key Technical Challenges:**
- Complex scheduling algorithms with resource availability constraints
- Real-time data synchronization across organizations
- Sophisticated database schema for resource relationships
- Performance optimization for large project datasets

**Strategic Advantage:** Combining enterprise-grade project management capabilities with modern web accessibility and team collaboration features.

## Success Criteria

### User Success (Personal Usability First)

**Core Success Moment:**
- **"I can manage a complex project end-to-end without switching to MS Project or spreadsheets"**
- **Complete workflow from project creation through resource scheduling, task assignment, and progress tracking**

**Specific Personal Success Metrics:**
- **Project Setup**: Create a new project, define resources with day-specific schedules, and build a task hierarchy in under 30 minutes
- **Resource Management**: Configure 3+ resources with different work patterns (Mon-Fri, weekends, custom) and see immediate schedule impact
- **Task Scheduling**: Create 20+ tasks with dependencies and see them auto-reschedule around resource availability
- **Conflict Resolution**: Identify and resolve resource conflicts without losing manual scheduling control
- **Progress Tracking**: Update task progress and see baseline comparisons work correctly

### Business Success (Foundation Stage)

**Personal Business Success Metrics:**
- **Dogfooding Success**: You've used wale-plan to manage development of wale-plan
- **Demo Readiness**: You can confidently demonstrate the core differentiator (day-specific scheduling)
- **Feature Validation**: All high-priority features from your task list work for your personal use cases

### Technical Success (For You!)

**Personal Technical Success Metrics:**
- **No More Spreadsheets**: You haven't opened Excel for project tracking in 2+ weeks
- **Confidence in Scheduling**: You can trust the scheduling engine for real project deadlines
- **Cross-Device Access**: You can check project status from any device without losing functionality
- **Data Security**: You're comfortable storing real project data in the system

### Measurable Outcomes

**Success Threshold (Personal Usability):**
- Complete 3 personal projects using only wale-plan
- Zero fallback to MS Project or spreadsheets for 30+ days
- Demonstrate day-specific scheduling benefits to at least 1 peer
- System handles 50+ tasks with 5+ resources without performance issues

## Product Scope

### MVP - Personal Project Management
**What must work for YOU to find this useful?**
- ✅ Core resource scheduling with day-specific patterns
- ✅ Basic task management with dependencies
- ✅ Gantt chart visualization
- ✅ Single user (you) managing personal projects

### Growth Features (Post-Personal Success)
- Multi-user collaboration
- Organization management
- Advanced reporting
- Integration capabilities

### Vision (Future)
- Enterprise deployment replacing MS Project

## User Journeys

### Journey 1: Alexisdumain - The Distributed Development Orchestra Conductor

**Opening Scene:**
Alexisdumain is leading a distributed development team across multiple time zones. His senior developer, Sarah, works Mon-Thu 9-5 EST with premium rates, while junior developer Miguel works weekends 20 hours/week at standard rates. Their part-time DevOps consultant, Priya, works only Mon&Fri with specialized infrastructure rates. Alexisdumain spends hours each week manually calculating resource availability, tracking who's available when, and constantly updating spreadsheets when schedules change.

**The Pain:** Last week, Sarah had a family emergency and needed to work Wed-Fri instead, but the project timeline didn't automatically adjust. Miguel wanted to pick up extra hours on Tuesday, but the system couldn't handle his weekend-only pattern shifting mid-week. Priya's Monday infrastructure work conflicted with a deployment that needed her Friday availability, but nobody saw the conflict until it was too late.

**Rising Action:**
Late one night, while manually recalculating the sprint timeline after another schedule change, Alexisdumain discovers wale-plan. He starts a new project called "E-Commerce Platform Redesign" and sets up his team with their actual work patterns - Sarah's Mon-Thu premium schedule, Miguel's weekend pattern, Priya's Mon&Fri infrastructure availability.

The breakthrough comes when he configures Sarah's schedule: Instead of uniform daily hours, he sets Mon-Thu at 8 hours/day at $150/hour, then adds a weekend option at $200/hour for emergency work. For Miguel, he creates a weekend-only pattern with 10 hours/day at $80/hour. Priya gets Mon&Fri at 6 hours/day at $175/hour for specialized DevOps work.

**Climax:**
When Sarah requests to work that Friday instead of her usual Thursday, Alexisdumain simply toggles her Friday availability to "active" and sees the immediate impact on the project timeline. The system automatically shows that Miguel is available for extra weekend work to cover the gap, and Priya's Friday DevOps availability creates a perfect sync for the deployment window.

The real magic happens when he adds a critical security task requiring weekend work - the system instantly calculates that Sarah can handle it at her emergency weekend rate, while Miguel can provide backup at his standard weekend rate, giving Alexisdumain both coverage and cost optimization options.

**Resolution:**
Six weeks later, the E-Commerce Platform Redesign is completed 3 days ahead of schedule. Alexisdumain hasn't touched a project management spreadsheet in weeks. His team loves the clarity of their schedules, and Sarah appreciates the flexibility to shift her work days while maintaining premium compensation. More importantly, Alexisdumain can confidently take on a second complex project because the resource scheduling overhead has been virtually eliminated.

### Journey 2: Sarah Chen - The Premium Developer Who Values Flexibility

**Opening Scene:**
Sarah Chen is a senior full-stack developer who charges premium rates because she delivers exceptional quality. She's worked with Alexisdumain for two years and loves the technical challenges, but she's frustrated by rigid project management systems that don't accommodate real life. When her son's school schedule changes, she needs to shift from Mon-Thu to Tue-Fri, but the current system requires a week of email chains and manual spreadsheet updates that nobody enjoys.

**The Pain:** Last month, Sarah's daughter had a doctor appointment on Wednesday, but she couldn't easily swap her work day without causing project timeline chaos. The project management system treated every day identically, ignoring her willingness to work weekends at premium rates or her preference for 4-hour focused blocks on administrative tasks. She felt like a cog in a machine rather than a valued team member whose schedule patterns could actually benefit the project.

**Rising Action:**
Alexisdumain introduces the new system, and Sarah receives her first personalized schedule invitation. Instead of a generic calendar, she sees a visual interface showing her current Mon-Thu pattern with rate breakdowns: Monday-Thursday: 8 hours at $150/hour (development), Friday-Sunday: 4 hours at $200/hour (emergency/premium).

The revelation comes when she needs to take Wednesday off for her daughter's appointment. She logs into the system, sees her current week's tasks, and simply toggles Wednesday to "unavailable" and Saturday to "available" - same hours, same premium rate. The system immediately shows her which tasks are affected and suggests alternatives: " Miguel can cover Wednesday's code review, or you can complete it Saturday morning at premium rate."

**Climax:**
Two weeks later, a critical production bug requires immediate attention on Friday afternoon. Sarah receives a notification: "Urgent Fix Needed - Premium Weekend Rate Available." Instead of feeling pressured, she sees the opportunity clearly: 3 hours Saturday at $250/hour (emergency weekend rate) vs. Miguel at $100/hour. She accepts the Saturday slot, and the system automatically updates the project timeline.

The breakthrough moment comes when she requests to work a compressed 4-day week during summer break. She sets up a new pattern: Mon-Thu at 10 hours/day, Friday-Sunday at emergency rates only. The system shows her exactly how this affects the sprint timeline and gives the team time to adjust, rather than creating last-minute chaos.

**Resolution:**
Three months later, Sarah feels more valued and productive than ever. She's earned an extra $4,000 in premium rates by strategically offering weekend availability during critical phases, while maintaining her work-life balance through flexible day scheduling. She can see exactly how her availability impacts project timelines and makes informed decisions about when to offer premium availability vs. when to protect her personal time.

### Journey 3: Miguel Rodriguez - The Weekend Warrior Developer

**Opening Scene:**
Miguel Rodriguez is a junior developer who's building his portfolio while working a day job. His available hours are Saturday and Sunday, 10-6, with some weekday evenings when projects are urgent. He's frustrated by project management systems that assume everyone works Mon-Fri 9-5, constantly asking him to update availability or marking him as "overallocated" when he's actually perfectly available on weekends.

**The Pain:** Last month, Miguel was assigned to a critical bug fix, but the system kept flagging him as "unavailable" because it couldn't understand his weekend-first schedule. The project manager manually overrode the system, creating confusion about deadlines. Worse, Miguel missed opportunities to help during the week when he actually had 3 free hours on Tuesday evening, but the system never offered him the chance because his "primary pattern" was weekends.

**Rising Action:**
When Alexisdumain moves to wale-plan, Miguel gets his first weekend-first resource profile. Instead of fighting a Mon-Fri bias, he sees his natural schedule: Saturday-Sunday: 10am-6pm at $80/hour, Weekday Evenings: 7pm-10pm at $100/hour (premium for disruption).

The system immediately assigns him to weekend tasks, but the breakthrough comes mid-week when a critical production issue arises. Instead of defaulting to Sarah's premium rates, the system sends Miguel a notification: "Urgent Task Available - Weekday Evening Premium Rate $100/hour. Can you take 2 hours tonight?"

Miguel accepts and logs his work from 8-10pm Tuesday. The system doesn't just record the hours - it updates his availability pattern temporarily, shows the project manager the cost savings vs. Sarah's emergency rates, and recalculates the timeline based on actual completion.

**Climax:**
The real test comes when Miguel wants to grow his skills. He sees that Sarah is working on advanced API architecture and sets a goal: "I want to take on API tasks to learn from Sarah." The system notices this and starts suggesting related weekend tasks: "API Documentation Task Available - Builds Architecture Skills - Saturday 2pm-4pm."

But the critical insight happens when Miguel requests to take Thursday off from his day job to work on the project full-time. He creates a one-time exception: Thursday 10am-6pm at his standard $80/hour. The system handles this elegantly - no pattern changes, no permanent modifications, just a single-day override that clearly communicates to the team his special availability.

**Resolution:**
Six months later, Miguel has doubled his weekend rates to $120/hour based on demonstrated value. He's taken on increasingly complex tasks, building his portfolio while providing the team with flexible, cost-effective development capacity. The system has helped him transition from "weekend helper" to "strategic development resource" with clear growth paths.

### Journey 4: Jamal Williams - The Multi-Project Configuration Manager

**Opening Scene:**
Jamal Williams is the Director of Engineering Operations at a mid-sized software company that just acquired wale-plan for their 50-person development team. He's responsible for onboarding 4 project managers, 40 developers, and coordinating 12 concurrent projects. His immediate challenge is migrating from their chaotic mix of Jira, spreadsheets, and custom tools to a unified system without disrupting ongoing work.

**The Pain:** Jamal has seen failed tool rollouts before. Last year's "project management solution" failed because it couldn't handle their complex rate structure: senior developers had different rates for client projects vs. internal projects, some teams worked compressed 4-day weeks, and their European team followed completely different holiday calendars. The previous system assumed one-size-fits-all scheduling and collapsed under the complexity.

**Rising Action:**
Jamal begins the wale-plan configuration and discovers it's built for real-world complexity. He starts by creating resource templates instead of individual profiles:

**Resource Templates Created:**
- "Senior Developer - Client Projects": Mon-Thu 9-5, $150/hour
- "Senior Developer - Internal Projects": Mon-Fri 9-5, $120/hour
- "Junior Developer - Weekend": Sat-Sun 10-6, $80/hour
- "DevOps Contractor": Mon&Fri only, $175/hour
- "European Team": Mon-Fri 9-5 CET with EU holiday calendar

The breakthrough comes when he sets up the organization's global policies. He configures cross-project resource pools so their star architect, Elena, can be allocated 60% to the flagship product and 40% to new client projects. The system automatically prevents overallocation and shows Elena's availability across all projects in real-time.

**Climax:**
Jamal faces his biggest test when the CEO requests a "resource efficiency report" showing utilization rates across all teams. Instead of spending days compiling spreadsheets, he uses the system's organization dashboard. He discovers that their European team is consistently underutilized during US morning hours, while the West Coast team has capacity during European afternoons.

He creates a new "Follow-the-Sun" support rotation template, allocating European developers to cover morning shifts and West Coast developers for evening shifts. The system automatically handles the time zone differences and shows cost savings of $200,000 annually compared to hiring additional staff.

The critical moment comes when he needs to migrate 8 active projects from legacy systems. Jamal uses the project import templates, mapping existing task structures and resource assignments to wale-plan's day-specific patterns. The system identifies 23 scheduling conflicts during migration and provides resolution options before any disruption occurs.

**Resolution:**
Three months post-implementation, Jamal's company has achieved 92% resource utilization across all teams, reduced project delays by 40%, and eliminated the manual scheduling department. He manages all configuration through the admin dashboard, adding new resource templates when they hire specialized roles and adjusting rate policies as the company grows.

### Journey Requirements Summary

From our four comprehensive journeys, we've identified the complete capability spectrum needed for wale-plan:

**Project Planning & Orchestration:**
- Day-specific resource scheduling and pattern management
- Real-time schedule impact visualization
- Multi-rate resource management with cost optimization
- Cross-system resource integration and conflict detection

**Individual Resource Flexibility:**
- Personal resource dashboards with schedule editing
- Rate transparency and premium opportunity notifications
- Schedule change impact visualization for resources
- Task assignment communication and confirmation workflows

**Scheduling Engine Stress Testing:**
- Weekend-first calendar visualization and UI design
- Inverted week pattern handling in scheduling algorithms
- Opportunistic availability notifications and suggestions
- One-time schedule exceptions without pattern disruption

**Platform Scalability & Administration:**
- Resource template creation and management
- Organization-wide policy configuration
- Cross-project resource pools and allocation
- Multi-calendar and timezone management
- Role-based access control and permissions

## Innovation & Novel Patterns

### Core Structural Innovation: Day-Specific Scheduling Engine

**The Paradigm Shift:**
- **Traditional Assumption:** Resources have uniform availability and cost across the week (MS Project model)
- **Wale-Plan Innovation:** Each day is a distinct capacity and cost unit with dynamic, granular patterns

**What Makes It Unique:**
- **Breaks from uniform week modeling** - No more static calendars with same daily hours
- **Dynamic per-day patterns** - Can change week to week, not just permanent templates
- **Multi-dimensional resource profiles** - Combines availability, rates, and patterns per day
- **Real-time recalculation** - Immediate impact visualization when day patterns change

**Revolutionary Capabilities Enabled:**
- Weekend-first schedules (Miguel's journey)
- Rotating shift patterns (Jamal's Follow-the-Sun model)
- Compressed work weeks (Sarah's 4-day summer schedule)
- Multi-rate resource profiles (Sarah's premium vs standard rates)
- High-variance contractor management (Priya's Mon&Fri availability)

### Market Context & Competitive Landscape

**Current Tool Limitations:**
- **MS Project:** Static calendars, uniform daily assumptions
- **Modern SaaS Tools:** Oversimplified scheduling, no day-specific granularity
- **Enterprise Solutions:** Rigid templates, can't handle dynamic week-to-week changes

**Innovation Validation:**
Your user journeys prove market need:
- **Sarah's premium flexibility** - Traditional tools can't handle rate variation by day
- **Miguel's weekend-first pattern** - Existing systems assume Mon-Fri bias
- **Jamal's cross-time-zone rotation** - Requires per-day capacity modeling

### Validation Approach

**Technical Validation:**
- ✅ Journey scenarios demonstrate real scheduling problems solved
- ✅ Decision Tree Mapping revealed workflow validity
- ✅ Resource-task integration logic proven through brainstorming

**Market Validation Needed:**
- **User Testing:** Planners managing complex schedules test day-specific UI
- **Performance Testing:** System handles 100+ resources with per-day patterns
- **Adoption Metrics:** Users successfully transition from MS Project habits

### Risk Mitigation

**Primary Risk: UX Complexity**
- **Mitigation:** MS Project-like table interface hides algorithmic complexity
- **Validation:** Usability testing with project managers familiar with traditional tools
- **Fallback:** Simplified view options for users who want basic patterns

**Technical Risk: Algorithm Complexity**
- **Mitigation:** Modular scheduling engine with clear separation between UI and logic
- **Validation:** Stress testing with complex pattern combinations
- **Fallback:** Graceful degradation to simpler scheduling if needed

**Market Risk: User Resistance**
- **Mitigation:** Gradual adoption path - start simple, reveal complexity progressively
- **Validation:** Change management workflows for teams transitioning from MS Project
- **Fallback:** Template library that pre-configures common day-specific patterns

## SaaS B2B Specific Requirements

### Multi-Tenancy Architecture
- **Complete data isolation** per organization at database level
- **Shared infrastructure** with strict logical separation
- **Tenant-scoped authorization** for all data access
- **Future migration support** between hosting options

### Role-Based Access Control (RBAC)
- **Organization Admin:** Full tenant control, billing, templates, policies
- **Project Manager:** Project creation, resource assignment, scheduling management
- **Resource:** Personal availability, task viewing, time logging, premium opportunities
- **Viewer:** Read-only access to specific projects/dashboards

### Subscription Tiers & Feature Matrix
- **Starter:** Single user, personal projects, basic scheduling
- **Team:** Multi-user, resource assignment, basic templates, notifications
- **Business:** Day-specific patterns, cross-project resources, advanced scheduling, import/export
- **Enterprise:** SSO, advanced reporting, audit logs, custom integrations, dedicated support

### Integration Strategy (Prioritized)
**Phase 1 (Migration Critical):**
- MS Project XML import/export
- CSV/Excel data migration tools

**Phase 2 (Business Ready):**
- Google Workspace SSO
- Microsoft 365 SSO
- Slack notifications
- Microsoft Teams notifications

**Phase 3 (Scale Ready):**
- Google Calendar sync
- Outlook integration
- Jira/GitHub development tools
- Okta SSO

### Compliance Requirements
- **GDPR compliance** for EU customer data protection
- **Audit logging** for all configuration changes
- **SOC 2-aligned security practices** for enterprise readiness
- **Single-region data residency** initially, expandable later

### Implementation Considerations
- **Per-user pricing model** keeps adoption friction low and matches market expectations
- **Migration tools are critical** for enterprise adoption from existing systems
- **Integration prioritization** supports disciplined MVP approach while enabling scale
- **Compliance foundation** enables enterprise sales without over-engineering initially

## Project Scoping & Phased Development

### MVP Strategy & Philosophy

**MVP Approach:** Experience-First Validation
**Resource Requirements:** Solo founder or 1-2 developers, 3-4 month development cycle
**Core Philosophy:** Validate day-specific scheduling innovation through personal usability before scaling

### MVP Feature Set (Phase 1)

**Core User Journeys Supported:**
- **Alexisdumain (Project Manager):** Basic project orchestration with day-specific resource scheduling
- **Sarah (Resource):** Personal availability management and task assignment visibility
- **Miguel (Resource):** Weekend-first scheduling validation

**Must-Have Capabilities:**
- **Day-specific scheduling engine** - Core innovation with per-day availability patterns
- **Resource table with pattern configuration** - Mon-Fri, weekend, custom schedules
- **Task table with dependencies** - Predecessor/successor relationships, WBS structure
- **Manual vs auto-scheduled task types** - MS Project parity for scheduling behavior
- **Basic recalculation with warnings** - Conflict detection without automatic corrections
- **Personal workspace with project management** - Single user managing multiple projects

**Explicitly Out of Scope (Post-MVP):**
- Multi-user collaboration and real-time updates
- SaaS multi-tenancy and organization management
- Advanced reporting and analytics
- Import/export tools and integrations
- Admin dashboards and template management

### Post-MVP Features

**Phase 2 (Growth - Team Collaboration):**
- Multi-user support with role-based permissions
- Team collaboration features and notifications
- Basic organization management
- Simple import/export tools for migration
- Enhanced reporting and progress tracking

**Phase 3 (Expansion - Enterprise SaaS):**
- Full SaaS B2B platform with multi-tenancy
- Advanced admin dashboards and resource templates
- Enterprise integrations (SSO, audit logs, compliance)
- Advanced reporting and analytics
- Custom integrations and API access

### Risk Mitigation Strategy

**Technical Risks:**
- **Scheduling Engine Complexity:** Start with single-tenant architecture, simplify advanced scheduling rules for MVP
- **Performance Concerns:** Optimize database after validation, use proven patterns for large datasets
- **UI Complexity:** MS Project-like table interface hides algorithmic complexity

**Market Risks:**
- **Adoption Resistance:** Personal usability success proves concept value before team rollout
- **Competition:** Day-specific scheduling innovation creates defensible market position
- **Learning Curve:** Familiar MS Project interaction patterns reduce adoption friction

**Resource Risks:**
- **Solo Development:** Focused MVP scope enables single founder execution
- **Feature Creep:** Strict MVP boundaries prevent scope expansion
- **Timeline Pressure:** Success criteria tied to personal project completion, not artificial deadlines

## Functional Requirements

### Project & Workspace Management
- FR1: User can create new projects with custom names and settings
- FR2: User can manage multiple personal projects in a workspace
- FR3: User can switch between different projects for management

### Resource Management
- FR4: User can create resources with custom names and base rates
- FR5: User can configure day-specific availability patterns (Mon-Fri, weekends, custom)
- FR6: User can set different work hours and rates for specific days
- FR7: User can create one-time availability exceptions for specific dates
- FR8: User can view resource availability across project timeline

### Task Management
- FR9: User can create tasks with names, durations, and work breakdown structure
- FR10: User can establish predecessor/successor dependencies between tasks
- FR11: User can assign tasks to specific resources
- FR12: User can specify tasks as manual or auto-scheduled
- FR13: User can mark tasks as milestones with zero duration
- FR14: User can update task progress and completion status
- FR15: User can set task duration in days or hours
- FR16: User can set "Start No Earlier Than" constraints

### Scheduling Engine
- FR17: User can trigger manual recalculation of project schedules
- FR18: System detects and displays scheduling conflicts and overallocations
- FR19: System updates task dates based on resource availability changes
- FR20: System maintains manual task dates despite dependency changes
- FR21: System provides visual warnings for scheduling problems
- FR22: Scheduling engine computes earliest possible start date based on dependencies + resource availability
- FR23: User can undo the last scheduling recalculation

### User Interface & Experience
- FR24: User can interact with resources through table-based interface
- FR25: User can interact with tasks through table-based interface
- FR26: User can view project timeline with Gantt chart visualization
- FR27: User can see resource availability and assignments in calendar view
- FR28: User can edit task and resource fields inline without opening modals

### Calendar & Time Management
- FR29: System uses a default project calendar (working days + base hours)
- FR30: User can override the project calendar with custom working days

## Non-Functional Requirements

### Performance Requirements
- NFR1: Recalculation completes in under 1 second for projects under 200 tasks
- NFR2: Table interactions respond in under 100ms per edit
- NFR3: Gantt chart rendering remains smooth for up to 300 tasks
- NFR4: All edits persist within 200ms

### Security Requirements
- NFR5: All data at rest encrypted using standard database-level encryption
- NFR6: All data in transit uses HTTPS/TLS 1.2 or higher
- NFR7: CRUD actions enforce authentication and resource-based authorization
- NFR8: System follows basic GDPR principles (portability, deletion, minimal data storage)

### Accessibility Requirements
- NFR9: All table interactions support full keyboard navigation
- NFR10: UI meets WCAG AA color contrast standards
- NFR11: Interface provides text equivalents for non-text elements
