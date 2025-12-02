---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
inputDocuments: ["/home/adumain/dev/wale-plan/docs/prd.md", "/home/adumain/dev/wale-plan/docs/epics.md"]
workflowType: 'ux-design'
lastStep: 1
project_name: 'wale-plan'
user_name: 'Alexisdumain'
date: '2025-12-02T00:00:00.000Z'
---

# UX Design Specification wale-plan

**Author:** Alexisdumain
**Date:** 2025-12-02T00:00:00.000Z

---

<!-- UX design content will be appended sequentially through collaborative workflow steps -->

## Executive Summary

### Project Vision

wale-plan is revolutionizing project management by breaking free from uniform week modeling, enabling sophisticated day-specific resource scheduling that matches real-world complexity. The core vision is to deliver Microsoft Project's power with modern web collaboration, eliminating the forced choice between enterprise-grade capabilities and accessible team collaboration.

The key innovation treats each day as a distinct capacity and cost unit - moving beyond the traditional assumption that resources have uniform availability and cost across the week. This enables scenarios like Sarah's premium Mon-Thu rates, Miguel's weekend-first scheduling, and Jamal's cross-time-zone "Follow-the-Sun" resource pools.

### Target Users

**Primary User Personas:**

- **Alexisdumain-types:** Project managers coordinating distributed teams with complex resource patterns across multiple time zones
- **Sarah-types:** Premium developers seeking flexible scheduling, rate transparency, and work-life balance through day-specific patterns
- **Miguel-types:** Weekend warriors and non-traditional workers wanting to leverage unconventional availability patterns
- **Jamal-types:** Multi-project coordinators managing enterprise-scale resource allocation across organizations

**User Context:** These users are currently struggling with rigid tools that can't handle real-world scheduling complexity, forcing them into spreadsheets and manual calculations that waste hours weekly.

### Key Design Challenges

**Cognitive Complexity Management:**
- Making day-specific scheduling patterns intuitive without overwhelming users accustomed to uniform weekly modeling
- Helping users understand rate variations and availability changes without requiring mental calculations
- Balancing MS Project familiarity with revolutionary day-specific concepts

**Cross-Time Zone Coordination:**
- Visualizing resource availability across different time zones without mental gymnastics
- Making "Follow-the-Sun" scheduling patterns immediately understandable
- Ensuring users can see team availability at a glance regardless of geographic distribution

**Migration from Legacy Tools:**
- Managing ingrained MS Project habits while introducing innovative patterns
- Reducing learning curve for complex resource scheduling concepts
- Providing clear value proposition that justifies switching from familiar tools

### Design Opportunities

**Visual Scheduling Intelligence:**
- Pattern-based interfaces that make day-specific variations immediately intuitive
- Heat maps and timeline visualizations that replace complex table-based configuration
- Real-time availability visualization that updates as users modify patterns

**Progressive Feature Disclosure:**
- Starting with familiar MS Project-like interface and revealing day-specific complexity progressively
- Guided onboarding that helps users discover advanced features as their needs evolve
- Contextual help that educates users about day-specific scheduling benefits

**Conflict and Cost Visualization:**
- Real-time conflict detection shown as visual "hot spots" on timelines
- Cost optimization opportunities highlighted as users make scheduling decisions
- Clear ROI visualization for premium rate decisions and schedule changes

## Core User Experience

### Defining Experience

The core experience of wale-plan is the **"Pattern Creation & Impact Visualization" loop** - users create day-specific resource patterns and immediately see the visual, cost, and scheduling impacts across their entire project. This creates an addictive feedback loop where complex scheduling decisions become intuitive exploration rather than tedious calculation.

### Platform Strategy

**Primary Platform:** Responsive web application optimized for desktop use with tablet support
- **Desktop Experience:** Mouse/keyboard focused with drag-and-drop, keyboard shortcuts, and multi-window workflows for complex planning
- **Tablet Support:** Touch-optimized interface for quick updates, approvals, and schedule review
- **Mobile Access:** Limited to status updates and critical notifications
- **Offline Capability:** Full editing capability with automatic sync when reconnected

**Performance Target:** Handle 300+ tasks with complex resource patterns while maintaining sub-100ms interaction response times

### Effortless Interactions

**Zero-Thought Experiences:**
- **Smart Drag-and-Drop:** Moving tasks automatically respects resource availability patterns, time zones, and dependencies
- **Real-Time Cost Ripples:** Rate changes instantly update cost calculations across all affected tasks
- **Automatic Conflict Detection:** Resource overallocation appears as visual heat maps without manual triggering
- **Time Zone Transparency:** Team availability displays in user's local time automatically

**Current Pain Elimination:**
- Eliminate manual recalculation steps required in MS Project
- Remove mental time zone conversion for distributed teams
- Replace spreadsheet-based pattern tracking with visual interface

### Critical Success Moments

**"This is Better" Breakthroughs:**
1. **First Pattern Creation:** User configures a day-specific schedule and sees immediate visual confirmation across project timeline
2. **Cascade Understanding:** User moves one task and watches intelligent rescheduling respect all resource patterns
3. **Global Clarity:** User sees cross-time zone team availability without mental calculations
4. **Migration Victory:** User successfully imports existing MS Project data and discovers enhanced capabilities

**Make-or-Break User Flows:**
- Resource pattern configuration and editing
- Schedule recalculation with visual feedback
- Conflict resolution with suggested solutions
- Cross-time zone collaboration workflows

### Experience Principles

**Pattern-First Thinking:** Every interaction starts from day-specific resource patterns - patterns are the primary user concept, not secondary configuration

**Immediate Visual Impact:** No action should require extra clicks to see consequences - every change shows its impact instantly through visual updates

**Progressive Complexity:** Begin with familiar MS Project-like interface, progressively reveal advanced pattern capabilities as user needs evolve

**Cross-Time Zone Clarity:** Geographic distribution and time zone differences should be handled transparently without requiring user mental calculations

**Migration Confidence:** MS Project users should feel immediately capable while discovering revolutionary new capabilities through guided exploration

## Desired Emotional Response

### Primary Emotional Goals

**Emotional Transformation Journey:** Taking users from "Fighting the Tool" to "Dancing with Intelligence" - transforming project management from a burdensome chore into a strategic advantage. The core emotional shift moves users from frustration, anxiety, and manual labor fatigue to empowerment, delight, and creative flow state.

**Core Feelings to Cultivate:**
- **Empowered & In Control:** Users feel they can finally model real-world complexity without fighting the tool
- **Delighted & Surprised:** Intelligent suggestions and optimizations create moments of discovery
- **Confident & Professional:** Users present schedules that actually work in the real world
- **Relieved & Efficient:** Hours of manual work disappear into automated intelligence

**Word-of-Mouth Emotion:** The "Mind-Blown Clarity" moment when users realize the system finally understands how work actually happens - this is the story they'll tell colleagues.

### Emotional Journey Mapping

**Stage 1 - First Discovery:** **Curious & Hopeful** - "Could this finally solve my scheduling nightmare?"
**Stage 2 - First Pattern Creation:** **Delighted & Empowered** - "It actually understands my real-world needs!"
**Stage 3 - Schedule Recalculation:** **Amazed & Relieved** - "All that manual work just disappeared!"
**Stage 4 - Team Collaboration:** **Connected & Professional** - "I look like a scheduling genius to my team"
**Stage 5 - Error Resolution:** **Supported & Confident** - "The system helps me fix problems, doesn't just report them"
**Stage 6 - Advanced Usage:** **Creative & Strategic** - "I'm exploring possibilities, not just managing constraints"

### Micro-Emotions

**Critical Emotional Balance Points:**

**Trust vs. Skepticism (Most Critical):**
- Users will be skeptical that automation can handle their complex needs
- Build trust through transparent calculations and immediate visual feedback
- Show "why" the system made suggestions, not just "what" it suggests
- Always-visible undo functionality to encourage safe experimentation

**Confidence vs. Confusion:**
- Visual pattern builder prevents confusion during complex configuration
- Real-time impact visualization builds confidence through each step
- Progressive disclosure prevents cognitive overload
- Clear explanations of scheduling logic maintain user confidence

**Accomplishment vs. Frustration:**
- Celebrate each successful pattern configuration with visual confirmation
- Eliminate manual recalculation frustration with instant automation
- Show completed work milestones to reinforce accomplishment feelings
- Transform conflict resolution from frustrating to collaborative problem-solving

**Excitement vs. Anxiety:**
- Create excitement about premium rate optimization and new scheduling possibilities
- Reduce migration anxiety through familiar interface patterns and guided onboarding
- Preview benefits before requiring complex configuration
- Use gamification elements to make advanced feature discovery exciting

### Design Implications

**For Building Trust and Empowerment:**
- **Visual Pattern Builder:** Intuitive drag-and-drop interface for creating day-specific schedules
- **Real-Time Ripple Visualization:** Show exactly how changes cascade through the entire project
- **Transparent Logic Panels:** Click any automated suggestion to see the reasoning behind it
- **Always-Visible Undo:** Users feel safe experimenting with complex patterns

**For Creating Delight and Surprise:**
- **Intelligent Opportunity Detection:** "Sarah, you could earn $400 extra this weekend by switching one task"
- **Conflict Resolution Suggestions:** "Miguel can cover this critical task at 30% less than Sarah's emergency rate"
- **Pattern Learning:** System remembers and suggests common schedule configurations
- **Cost Optimization Highlights:** Visual indicators show money-saving opportunities

**For Professional Confidence:**
- **Export-Ready Visualizations:** Professional Gantt charts and resource timelines for stakeholder presentations
- **Audit Trail Documentation:** Complete history of scheduling decisions and change rationales
- **Stakeholder Reporting:** One-click executive summaries and client-ready reports
- **Professional Interface Design:** Clean, sophisticated aesthetic that builds user credibility

### Emotional Design Principles

**Transparency First:** Never hide scheduling logic - every automated decision should be explainable and visible. Users must understand the "why" behind suggestions to trust the intelligence.

**Immediate Gratification:** Every user action should show visual consequences instantly. No action should require extra clicks or waiting to understand its impact.

**Safe Experimentation:** Users must feel completely safe trying complex patterns and configurations. Make undo always visible and penalty-free.

**Celebration of Intelligence:** Highlight moments when the system makes unexpectedly smart suggestions. Point out optimizations users hadn't considered to create delight.

**Professional Pride:** Every interaction should make users feel more competent and strategic in their roles. The system should amplify their professional capabilities, not replace their judgment.

## UX Pattern Analysis & Inspiration

### Inspiring Products Analysis

**Figma - Direct Manipulation Excellence**
- **Core Problem Solved:** Making complex design tools feel intuitive through visual manipulation
- **Success Factors:** Click-drag-resize workflow, clean workspace, immediate visual feedback
- **Innovation:** Visual representation as source of truth, minimal dialog interference
- **Navigation:** Left panel for layers/tools, main canvas for work, right panel for properties

**Airtable - Approachable Complexity**
- **Core Problem Solved:** Making powerful databases feel simple to non-technical users
- **Success Factors:** Clear column structure, obvious actions, hidden complexity until needed
- **Innovation:** Grid-based interface that scales from simple to complex without overwhelming
- **Navigation:** Tabular data view with intuitive column management

**Google Calendar - Time Interaction Mastery**
- **Core Problem Solved:** Making time manipulation completely intuitive
- **Success Factors:** Drag-and-drop event creation, visual conflict detection, natural duration extension
- **Innovation:** Visual representation of availability and scheduling constraints
- **Navigation:** Month/Week/Day views with consistent interaction patterns

**Excel/Google Sheets - Power User Freedom**
- **Core Problem Solved:** Providing complete data control without feeling restrictive
- **Success Factors:** Flexible table structure, keyboard shortcuts, copy/paste intelligence
- **Innovation:** Balance between power and approachability
- **Navigation:** Grid-based editing with formula bar and ribbon controls

**iOS Settings - Predictable Structure**
- **Core Problem Solved:** Making complex settings feel organized and findable
- **Success Factors:** Logical grouping, minimal visual noise, clear typography
- **Innovation:** Consistent navigation patterns across all settings
- **Navigation:** List-based hierarchy with clear section divisions

**Arc - Modern Aesthetic Excellence**
- **Core Problem Solved:** Creating a focused, premium browser experience
- **Success Factors:** Minimal interface, thoughtful spacing, modern typography
- **Innovation:** Calm, focused environment that reduces cognitive load
- **Navigation:** Sidebar with visual tabs, clean top bar, minimal chrome

### Transferable UX Patterns

**Visual Pattern Creation (from Figma + Google Calendar):**
- **Pattern:** Direct manipulation with immediate visual feedback
- **Application for wale-plan:** Drag-and-drop resource pattern creation with visual timeline representation
- **User Goal:** Making day-specific scheduling feel intuitive like arranging calendar events

**Approachable Data Tables (from Airtable + Excel):**
- **Pattern:** Clean column structure with hidden complexity
- **Application for wale-plan:** Task and resource tables that start simple, reveal power as needed
- **User Goal:** Managing complex scheduling data without feeling overwhelmed

**Time Interaction (from Google Calendar + Figma):**
- **Pattern:** Visual time blocks with natural drag manipulation
- **Application for wale-plan:** Resource availability visualization with drag-to-reschedule
- **User Goal:** Making time-based scheduling decisions visually obvious

**Settings Organization (from iOS Settings):**
- **Pattern:** Logical grouping with minimal visual noise
- **Application for wale-plan:** Project configuration and resource settings organization
- **User Goal:** Finding and managing complex settings without confusion

**Professional Aesthetic (from Arc + Figma):**
- **Pattern:** Clean, modern interface with thoughtful spacing
- **Application for wale-plan:** Overall visual design language and component library
- **User Goal:** Feeling confident and professional while using the tool

### Anti-Patterns to Avoid

**Heavy Modal Dialogs:** Avoid Figma's occasional heavy property panels that disrupt workflow - keep inline editing like Airtable

**Complex Ribbon Interfaces:** Avoid Excel's overwhelming ribbon - use iOS Settings' minimal approach instead

**Information Overload:** Avoid Google Calendar's sometimes-crowded event details - maintain Figma's clean focus

**Inconsistent Navigation:** Avoid Arc's experimental navigation patterns that can confuse users - stick to proven patterns

**Hidden Functionality:** Avoid Airtable's sometimes-hard-to-discover features - use progressive disclosure with clear visual cues

### Design Inspiration Strategy

**What to Adopt:**

**Figma's Direct Manipulation System** - Because it supports our core experience of "Pattern Creation & Impact Visualization" through immediate visual feedback

**Google Calendar's Time Interaction** - Because it makes complex time decisions intuitive through drag-and-drop and visual conflict detection

**Airtable's Progressive Complexity** - Because it aligns with our principle of "Progressive Complexity" for pattern configuration

**What to Adapt:**

**Excel's Power User Features** - Modify for our scheduling context, emphasizing drag-and-drop over formula-based interactions

**iOS Settings' Navigation** - Adapt for web-based project management settings while maintaining logical grouping clarity

**What to Avoid:**

**Complex Toolbars and Ribbons** - Conflicts with our goal of making complex scheduling feel approachable

**Heavy Modal Workflows** - Disrupts the "Immediate Visual Impact" principle we established

**Hidden Advanced Features** - Undermines our "Transparency First" emotional design principle

## Design System Foundation

### Design System Choice

**ShadCN/ui** selected as the primary design system for wale-plan, providing the optimal balance of development speed, modern aesthetic, and customization capabilities needed for our advanced project management solution.

### Rationale for Selection

**Strategic Alignment:**
- **Balance Requirement:** Delivers development speed for MVP while maintaining premium aesthetic differentiation
- **Design Expertise Fit:** Leverages existing design skills for customization without requiring full system creation
- **Competitive Positioning:** Provides familiar interaction patterns with cleaner, more modern visual identity than MS Project
- **Timeline vs Quality:** Enables rapid development without sacrificing long-term architectural quality

**Technical Integration:**
- **Stack Compatibility:** Built specifically for modern React/TypeScript projects using T3 Stack
- **Tailwind CSS Integration:** Seamless integration with existing Tailwind CSS configuration
- **Component Library:** High-quality, accessible components following modern design patterns
- **Customization Foundation:** Highly customizable for unique day-specific scheduling components

**Aesthetic Goals:**
- **Premium Feel:** Minimalist, professional aesthetic similar to Arc/Figma inspiration patterns
- **B2B Credibility:** Clean, sophisticated interface appropriate for enterprise project management
- **Visual Hierarchy:** Thoughtful spacing and typography that supports complex data visualization
- **Modern Appeal:** Contemporary design language that differentiates from legacy tools

### Implementation Approach

**Phase 1 - Foundation Setup:**
- Install and configure ShadCN/ui with existing Tailwind CSS setup
- Establish design tokens for colors, typography, and spacing aligned with professional aesthetic
- Implement core component library (buttons, forms, tables, cards)
- Set up accessibility compliance baseline for enterprise requirements

**Phase 2 - Custom Component Development:**
- Extend ShadCN/ui components for unique scheduling needs
- Develop specialized pattern creation interface components
- Build custom Gantt chart and timeline visualization components
- Create resource availability and conflict detection UI components

**Phase 3 - Integration and Refinement:**
- Integrate custom components with existing component library
- Optimize performance for large datasets (300+ tasks)
- Implement responsive design for tablet support
- Finalize accessibility compliance and cross-browser compatibility

### Customization Strategy

**Visual Identity Customization:**
- **Color Palette:** Professional blue/gray foundation with accent colors for different resource types and conflict indicators
- **Typography:** Clean, readable font system optimized for data-heavy interfaces
- **Spacing System:** Generous white space following Arc/Figma inspiration for reduced cognitive load
- **Component Styling:** Consistent border radius, shadow system, and interaction states

**Specialized Component Extensions:**
- **Pattern Builder:** Drag-and-drop interface for day-specific resource configuration
- **Timeline Components:** Custom Gantt chart with dependency visualization and conflict highlighting
- **Table Enhancements:** Extended data tables with inline editing, sorting, and filtering for complex project data
- **Visual Indicators:** Status icons, progress indicators, and cost optimization highlights

**Accessibility and Performance:**
- **WCAG AA Compliance:** Ensure all components meet enterprise accessibility standards
- **Keyboard Navigation:** Full keyboard support for complex scheduling interactions
- **Performance Optimization:** Virtual scrolling for large datasets and optimized rendering
- **Responsive Design:** Adaptive layouts for desktop and tablet interfaces

## 2. Core User Experience

### 2.1 Defining Experience

**"Modify a resource's day-specific pattern and immediately see the entire project adjust itself—tasks moving, costs updating, conflicts resolving—in real time."**

This is the singular interaction that captures wale-plan's revolutionary value and differentiates it from every legacy project management tool. The moment users see intelligent, automated rescheduling that respects their day-specific patterns is when they understand they've found something completely different.

### 2.2 User Mental Model

**Current Legacy Mental Model:**
- "Schedule changes = Manual, painful recalculation"
- "Resource patterns = Static, inflexible constraints"
- "Conflict resolution = Manual problem-solving and compromises"
- "Cost updates = Spreadsheet recalculations and formulas"

**Desired wale-plan Mental Model:**
- "Schedule changes = Intelligent collaboration with the system"
- "Resource patterns = Dynamic levers that instantly reshape projects"
- "Conflict resolution = Automated harmony restoration with user oversight"
- "Cost updates = Real-time financial intelligence at a glance"

### 2.3 Success Criteria

**"This Just Works" Indicators:**
- User changes Sarah's Friday availability and sees tasks immediately reschedule without clicking "recalculate"
- Cost totals update automatically as resource patterns change
- Conflict indicators appear/disappear in real-time without manual triggering
- Timeline adjusts smoothly while maintaining dependency relationships

**Feeling Smart & Accomplished:**
- User moves one resource pattern and watches 20+ tasks intelligently relocate
- System suggests alternative resource assignments that save money
- User can immediately see the business impact of scheduling decisions

**Instant Success Feedback:**
- Visual progress indicators show changes propagating through the project
- Color-coded status changes (red conflicts → green resolved)
- Running cost totals that update as resources are reassigned
- Tooltip explanations of why specific scheduling decisions were made

### 2.4 Novel UX Patterns

**Real-Time Scheduling Propagation:**
Unlike traditional tools where users make changes then click "calculate," wale-plan shows instant visual propagation of changes across the entire project timeline.

**Intelligent Conflict Auto-Resolution:**
Rather than just flagging problems, the system shows real-time conflict resolution suggestions as users modify patterns.

**Cost Intelligence Overlay:**
Running cost calculations that update in real-time as resource patterns change, providing immediate business impact visibility.

### 2.5 Experience Mechanics

**1. Pattern Modification Initiation:**
- User clicks on resource in timeline or resource table
- Pattern editor appears with day-specific configuration (Mon-Fri, weekend, custom)
- Visual pattern builder shows current schedule with inline editing

**2. Real-Time Ripple Interaction:**
- As user changes hours or rates for specific days, affected tasks immediately highlight
- Task timeline bars smoothly slide to new positions respecting dependencies
- Conflict indicators update in real-time (red → yellow → green)
- Cost totals at top of screen update with subtle animation

**3. Intelligent Feedback System:**
- Tooltips appear explaining scheduling logic: "Sarah's Friday unavailability moved Task A to Monday"
- Alternative suggestions appear: "Miguel could cover this weekend task at 30% less cost"
- Visual indicators show which changes saved money vs. cost more

**4. Completion Flow:**
- User accepts pattern changes with single "Apply" button
- System shows summary of impacts: "3 tasks rescheduled, $1,200 saved, 2 conflicts resolved"
- User can undo entire change set or individual adjustments
- Timeline settles with smooth animations showing final state

**Anti-Patterns Avoided:**
- No "Calculate Schedule" button - everything happens in real-time
- No separate conflict resolution mode - problems are shown and solved inline
- No manual cost recalculation - financial intelligence is always visible

## Visual Design Foundation

### Color System

**Primary Palette - Professional Minimal:**
- **Primary Blue:** `#3B82F6` (ShadCN blue) - Trustworthy, professional for B2B
- **Primary Dark:** `#1E293B` - Professional text, high contrast
- **Primary Light:** `#F8FAFC` - Clean backgrounds, reduced eye strain

**Neutral Foundation - Low-Distraction:**
- **Neutral 50:** `#F8FAFC` - Clean backgrounds
- **Neutral 100:** `#F1F5F9` - Subtle panels, cards
- **Neutral 200:** `#E2E8F0` - Borders, dividers
- **Neutral 300:** `#CBD5E1` - Disabled states, subtle accents
- **Neutral 400:** `#94A3B8` - Secondary text, icons
- **Neutral 500:** `#64748B` - Muted text, placeholders
- **Neutral 600:** `#475569` - Primary text, content
- **Neutral 700:** `#334155` - Headers, emphasis
- **Neutral 800:** `#1E293B` - Dark text, high importance
- **Neutral 900:** `#0F172A` - UI elements, strong contrast

**Semantic Colors - Data Visualization Optimized:**
- **Success/Available:** `#22C55E` - Resource availability, resolved conflicts
- **Warning/Partial:** `#F59E0B` - Partial availability, cost warnings
- **Error/Conflict:** `#EF4444` - Scheduling conflicts, overallocation
- **Info/Pending:** `#3B82F6` - Pending changes, system messages

**Resource Type Colors - Visual Distinction:**
- **Developer Resource:** `#3B82F6` (Primary blue)
- **DevOps/Infrastructure:** `#8B5CF6` (Purple)
- **Designer/UX:** `#EC4899` (Pink)
- **PM/Coordinator:** `#F59E0B` (Amber)
- **Contractor:** `#10B981` (Emerald)

**Timeline Visualization Colors:**
- **Task Bar - Normal:** `#CBD5E1` (Neutral 300)
- **Task Bar - Critical Path:** `#3B82F6` (Primary)
- **Task Bar - Overdue:** `#EF4444` (Error)
- **Task Bar - Completed:** `#22C55E` (Success)
- **Dependency Line:** `#94A3B8` (Neutral 400)
- **Weekend/Non-working:** `#F1F5F9` (Neutral 100)

**Cost Intelligence Colors:**
- **Cost Saving:** `#22C55E` (Success)
- **Cost Increase:** `#EF4444` (Error)
- **Neutral Cost Change:** `#64748B` (Neutral 500)

### Typography System

**Primary Typeface: Inter**
- **Rationale:** Excellent readability for data, modern sans-serif, variable font support
- **Performance:** Optimized for web rendering, extensive character set
- **Accessibility:** Designed for screen readability across sizes

**Type Scale (Optimized for Data Visualization):**
- **Display 1:** 48px / 56px - Dashboard headings
- **Display 2:** 36px / 44px - Page titles
- **H1:** 30px / 38px - Section headers
- **H2:** 24px / 32px - Subsection headers
- **H3:** 20px / 28px - Component headers
- **H4:** 18px / 24px - Small headers
- **Body Large:** 16px / 24px - Primary content
- **Body:** 14px / 20px - Standard content
- **Body Small:** 12px / 16px - Secondary information
- **Caption:** 11px / 16px - Metadata, timestamps

**Typography Weights:**
- **Light (300):** Large display text
- **Normal (400):** Body content, data
- **Medium (500):** Emphasis, UI elements
- **Semi-Bold (600):** Headers, important data
- **Bold (700):** Strong emphasis, CTAs

**Specialized Typography for Data:**
- **Monospace (JetBrains Mono):** Cost figures, time values, IDs
- **Numbers:** Tabular figures for aligned columns
- **Status Text:** Semi-bold weight for visibility

### Spacing & Layout Foundation

**Spacing System:** 8-point grid (0.5rem base)
- **Base Unit:** 8px (0.5rem)
- **Scale:** 4px, 8px, 16px, 24px, 32px, 48px, 64px, 96px

**Component Spacing:**
- **XS:** 4px - Tight element spacing
- **SM:** 8px - Default element spacing
- **MD:** 16px - Component spacing
- **LG:** 24px - Section spacing
- **XL:** 32px - Page sections
- **2XL:** 48px - Major sections

**Layout Grid:**
- **Max Width:** 1440px for optimal desktop viewing
- **Content Padding:** 24px on desktop, 16px on tablet
- **Sidebar Width:** 280px (collapsed: 64px)
- **Main Content:** Flexible with minimum 800px

**Card & Panel Spacing:**
- **Card Padding:** 24px
- **Card Gap:** 16px
- **Section Margin:** 32px
- **Item Height:** 48px minimum for touch targets

**Timeline Specific Spacing:**
- **Gantt Row Height:** 40px for readability
- **Task Bar Height:** 32px for visual prominence
- **Timeline Padding:** 12px for content breathing room
- **Dependency Line Weight:** 2px for clear visibility

### Accessibility Considerations

**Color Contrast Compliance (WCAG AA):**
- **Normal Text:** 4.5:1 minimum ratio
- **Large Text:** 3:1 minimum ratio
- **UI Components:** 3:1 minimum ratio

**Accessibility Features:**
- **Focus Indicators:** 2px blue outline with 4px offset
- **Status Indicators:** Icons + color for colorblind users
- **Keyboard Navigation:** Clear focus states, logical tab order
- **Screen Reader Support:** Semantic HTML, ARIA labels

**Data Visualization Accessibility:**
- **Pattern + Color:** Use patterns/texture with color for critical information
- **High Contrast Mode:** All visual information clear in high contrast
- **Text Alternatives:** Alt text for charts, data tables for complex information

**Motion & Animation:**
- **Reduced Motion:** Respect `prefers-reduced-motion`
- **Animation Duration:** 200-300ms maximum
- **Easing:** `ease-out` for natural feel
- **Purposeful Animations:** Only animate to communicate state changes