# Project Structure Classification

## Repository Overview
- **Repository Type**: Monolith
- **Project Type**: Web Application
- **Detection Method**: Key file pattern matching

## Project Part Metadata

### Primary Part: main
- **Part ID**: main
- **Root Path**: `/Users/alexisdumain/development/wale-plan`
- **Project Type ID**: web
- **Technology Stack**: Next.js + TypeScript + Drizzle ORM + tRPC

## Detection Evidence

### Key File Patterns Matched
- ✅ `package.json` - Next.js application manifest
- ✅ `tsconfig.json` - TypeScript configuration
- ✅ `next.config.js` - Next.js configuration
- ✅ `src/` directory - Source code organization
- ✅ `app/` directory - Next.js App Router structure

### Technology Markers
- **Framework**: Next.js 15.2.3
- **Language**: TypeScript 5.8.2
- **Database**: Drizzle ORM with PostgreSQL
- **API**: tRPC for type-safe APIs
- **Styling**: Tailwind CSS 4.0.15
- **UI Components**: Radix UI components

### Directory Structure Analysis
```
wale-plan/
├── src/
│   ├── app/          # Next.js App Router pages
│   ├── components/   # React components
│   ├── lib/          # Utility libraries
│   ├── server/       # Server-side code
│   ├── styles/       # Global styles
│   └── trpc/         # tRPC API setup
├── drizzle/          # Database schema and migrations
├── public/           # Static assets
└── docs/             # Documentation output
```

## Integration Points
- **Single Application**: All components integrated within one Next.js application
- **Database Integration**: Drizzle ORM connecting to PostgreSQL
- **API Integration**: tRPC providing type-safe client-server communication