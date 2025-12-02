# Development Guide - Wale Plan

*Generated as part of comprehensive project documentation*

## Development Setup

This guide provides comprehensive instructions for setting up the Wale Plan development environment, understanding the project architecture, and contributing to the codebase.

### Prerequisites

**Required Software:**
- **Node.js**: Version 18.17 or later (recommended: latest LTS)
- **npm**: Version 11.6.1 or later (comes with Node.js)
- **PostgreSQL**: Version 14 or later
- **Docker**: Latest version (or Podman as alternative)
- **Git**: Latest version for version control

**Optional Tools:**
- **VS Code**: Recommended code editor with extensions
- **PostgreSQL Client**: pgAdmin, DBeaver, or similar
- **Drizzle Studio**: Built-in database management tool

### Quick Start

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd wale-plan
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start Database**
   ```bash
   ./start-database.sh
   ```

5. **Run Migrations**
   ```bash
   npm run db:migrate
   ```

6. **Start Development Server**
   ```bash
   npm run dev
   ```

7. **Open Application**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Environment Configuration

### Required Environment Variables

Create a `.env` file in the project root with the following variables:

```bash
# Database Configuration
DATABASE_URL="postgresql://postgres:password@localhost:5432/wale-plan"

# Authentication
BETTER_AUTH_SECRET="your-super-secret-key-change-in-production"
BETTER_AUTH_URL="http://localhost:3000"

# Application Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"

# Optional: Skip environment validation (useful for Docker builds)
# SKIP_ENV_VALIDATION="true"
```

### Environment Variable Validation

The project uses `@t3-oss/env-nextjs` for type-safe environment variables:

- **Build-time Validation**: Server variables are validated at startup
- **Client Variables**: Must be prefixed with `NEXT_PUBLIC_`
- **Error Handling**: Clear error messages for missing or invalid variables

## Database Setup

### Automated Database Setup

The project includes a comprehensive database setup script:

```bash
./start-database.sh
```

**Script Features:**
- **Cross-platform**: Works on Linux, macOS, and Windows (WSL)
- **Container Management**: Uses Docker or Podman automatically
- **Password Generation**: Creates secure random passwords
- **Persistence**: Maintains data across container restarts
- **Health Checks**: Ensures database is ready before proceeding

### Manual Database Setup

If you prefer manual setup:

1. **Start PostgreSQL**
   ```bash
   # Using Docker
   docker run --name wale-plan-db \
     -e POSTGRES_DB=wale-plan \
     -e POSTGRES_USER=postgres \
     -e POSTGRES_PASSWORD=password \
     -p 5432:5432 \
     -d postgres:15

   # Using Podman
   podman run --name wale-plan-db \
     -e POSTGRES_DB=wale-plan \
     -e POSTGRES_USER=postgres \
     -e POSTGRES_PASSWORD=password \
     -p 5432:5432 \
     -d postgres:15
   ```

2. **Update Environment**
   ```bash
   DATABASE_URL="postgresql://postgres:password@localhost:5432/wale-plan"
   ```

### Database Operations

**Generate Migrations:**
```bash
npm run db:generate
```

**Apply Migrations:**
```bash
npm run db:migrate
```

**Push Schema Changes:**
```bash
npm run db:push
```

**Reset Database:**
```bash
npm run db:fresh
```

**Database Studio:**
```bash
npm run db:studio
```

## Development Commands

### Core Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build production application |
| `npm start` | Start production server |
| `npm run preview` | Build and preview production build |

### Code Quality

| Command | Description |
|---------|-------------|
| `npm run check` | Run linting and type checking |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Auto-fix ESLint issues |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run format:check` | Check code formatting |
| `npm run format:write` | Format code with Prettier |

### Database Commands

| Command | Description |
|---------|-------------|
| `npm run db:generate` | Generate Drizzle migrations |
| `npm run db:migrate` | Apply pending migrations |
| `npm run db:push` | Push schema changes to database |
| `npm run db:studio` | Open Drizzle Studio |
| `npm run db:fresh` | Fresh database setup (deletes data) |

## Project Architecture

### Technology Stack

**Frontend:**
- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Component library built on Radix UI
- **React Hook Form**: Form state management with Zod validation

**Backend:**
- **tRPC**: Type-safe API layer
- **Drizzle ORM**: Type-safe database queries
- **Better Auth**: Authentication system
- **PostgreSQL**: Primary database

**Development Tools:**
- **ESLint**: Code linting and style checking
- **Prettier**: Code formatting
- **Turbo**: Build system and development server

### Directory Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API route handlers
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Main application
│   └── layout.tsx         # Root layout
├── components/            # React components
│   └── ui/               # Design system components
├── lib/                  # Utility functions
├── server/               # Server-side code
│   ├── api/              # tRPC procedures
│   ├── db/               # Database configuration
│   └── better-auth/      # Authentication setup
├── styles/               # Global CSS
└── trpc/                 # tRPC client configuration
```

### Key Architectural Patterns

**Server-First Architecture:**
- Server Components handle data fetching
- Client Components manage interactivity
- API layer provides type-safe communication

**Type Safety:**
- End-to-end TypeScript from database to UI
- Generated types for database schema
- Type-safe API procedures with tRPC

**Component Composition:**
- Small, reusable components
- Design system with consistent patterns
- Accessibility built-in with Radix UI

## Code Style and Standards

### ESLint Configuration

**Key Rules:**
- **Next.js Core Web Vitals**: Performance optimization
- **TypeScript Strict Mode**: Maximum type safety
- **Drizzle Security**: Enforce safe database operations
- **Import Organization**: Consistent import ordering

**Security Rules:**
```json
{
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-non-null-assertion": "error",
    "drizzle/enforce-delete-with-where": "error",
    "drizzle/enforce-update-with-where": "error"
  }
}
```

### Prettier Configuration

**Formatting Standards:**
- 2-space indentation
- Single quotes for strings
- Trailing commas where required
- Automatic Tailwind CSS class sorting

### TypeScript Configuration

**Strict Settings:**
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true
  }
}
```

**Path Aliases:**
```json
{
  "paths": {
    "~/*": ["./src/*"]
  }
}
```

## Testing Strategy

**Current State**: Testing framework not yet configured

**Recommended Testing Setup:**

```bash
# Install testing dependencies
npm install -D vitest @testing-library/react @testing-library/jest-dom
npm install -D jsdom @vitejs/plugin-react
```

**Vitest Configuration** (`vitest.config.ts`):
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './src'),
    },
  },
});
```

**Testing Commands** (add to package.json):
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

## Contributing Workflow

### Git Workflow

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**
   - Follow code style guidelines
   - Add tests for new functionality
   - Update documentation as needed

3. **Run Quality Checks**
   ```bash
   npm run check
   npm run typecheck
   ```

4. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   ```

5. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

### Commit Message Convention

**Format**: `type(scope): description`

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring without feature changes
- `test`: Adding or updating tests
- `chore`: Build process or dependency changes

**Examples:**
```bash
git commit -m "feat(auth): add multi-factor authentication"
git commit -m "fix(db): resolve migration failure issue"
git commit -m "docs: update development setup guide"
```

### Code Review Guidelines

**Review Checklist:**
- [ ] Code follows style guidelines
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] TypeScript types are correct
- [ ] No console.log statements in production code
- [ ] Environment variables are properly handled
- [ ] Database queries are safe and efficient

## Debugging

### Common Issues

**Database Connection Errors:**
```bash
# Check if database is running
./start-database.sh

# Verify connection string
echo $DATABASE_URL

# Reset database if needed
npm run db:fresh
```

**TypeScript Errors:**
```bash
# Clear TypeScript cache
npm run typecheck

# Check for path resolution issues
# Verify tsconfig.json paths are correct
```

**Environment Variable Errors:**
```bash
# Check .env file exists
ls -la .env

# Validate environment variables
npm run dev  # Will show validation errors
```

### Debug Tools

**Drizzle Studio:**
```bash
npm run db:studio
```

**Next.js Debug Mode:**
```bash
NODE_OPTIONS='--inspect' npm run dev
```

**Chrome DevTools:**
- React Developer Tools
- Redux DevTools (if using state management)
- Network tab for API debugging

## Performance Optimization

### Development Performance

**Turbo Mode:**
- Automatic with `npm run dev`
- Fast refresh for components
- Incremental builds

**Database Optimization:**
- Use Drizzle Studio for query analysis
- Check slow queries with database logs
- Optimize indexes for common queries

### Build Optimization

**Bundle Analysis:**
```bash
npm run build
# Analyze bundle size with webpack-bundle-analyzer
```

**Code Splitting:**
- Automatic with Next.js App Router
- Use dynamic imports for large components
- Optimize third-party library usage

## Deployment

**Current State**: Deployment configuration not yet implemented

**Recommended Deployment Options:**

### Vercel Deployment
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to Vercel
vercel

# Set environment variables in Vercel dashboard
```

### Docker Deployment

**Create Dockerfile** (recommended):
```dockerfile
FROM node:18-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS runner
WORKDIR /app
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT 3000
CMD ["node", "server.js"]
```

**Build and Run:**
```bash
docker build -t wale-plan .
docker run -p 3000:3000 wale-plan
```

### Environment-Specific Configuration

**Production Variables:**
```bash
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/db
BETTER_AUTH_SECRET=super-secure-production-secret
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## Troubleshooting

### Common Development Issues

**Port Already in Use:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
```

**Database Migration Issues:**
```bash
# Reset and re-migrate
npm run db:fresh

# Check migration status
npm run db:migrate -- --dry-run
```

**TypeScript Path Issues:**
```bash
# Restart TypeScript server in VS Code
Cmd+Shift+P > TypeScript: Restart TS Server
```

**Dependency Issues:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Getting Help

**Community Resources:**
- [Next.js Documentation](https://nextjs.org/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team)
- [tRPC Documentation](https://trpc.io)
- [Better Auth Documentation](https://better-auth.com)

**Project-Specific Help:**
- Check existing GitHub issues
- Review README.md for project-specific information
- Consult code comments and TypeScript documentation

---

*This development guide provides comprehensive information for setting up, developing, and contributing to the Wale Plan project. Regular updates to this documentation are recommended as the project evolves.*