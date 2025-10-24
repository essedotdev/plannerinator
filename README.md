# Plannerinator

Complete life management system for tasks, events, notes, projects, and custom collections.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)](https://nextjs.org/)
[![Better Auth](https://img.shields.io/badge/Better%20Auth-1.3-green.svg)](https://better-auth.com/)

## 🎯 Philosophy

**Flexibility without chaos** - Plannerinator adopts a hybrid multi-model approach:

- **Rigid core entities** (tasks, events, notes, projects) with specific, type-safe fields
- **Universal linking system** to connect any entity to any other
- **JSONB metadata** for custom fields without sacrificing performance
- **Dynamic collections** for custom lists (books, services, research, etc.)

## ✨ Core Entities

### Tasks

Things to do, with or without deadlines, assignable to projects, linkable to notes/events.

**Core fields**: title, description, due date, duration, status, priority, subtasks

### Events

Time-based events, viewable in calendar or list format.

**Core fields**: title, description, start/end time, location, all-day flag, calendar type

### Notes

Notes, documents, research, knowledge base with markdown support.

**Core fields**: title, content (markdown), type (note/document/research/idea)

### Projects

Logical containers to organize tasks, events, and notes.

**Core fields**: name, description, status, dates, color, icon

### Collections

Custom lists with user-definable schemas (e.g., freelance services, books, clients).

**Schema editor**: Visual builder for defining custom fields per collection

## 🔗 Universal Features

- **Linking System**: Connect any entity to any other (task → project, task → note, etc.)
- **Tags**: Flexible organization with colored tags
- **Comments**: Discussion threads on any entity
- **Search**: Full-text search across all content
- **Activity Log**: Complete change history (future)
- **Sharing**: Collaborate with other users (future)

## 🛠️ Tech Stack

### Core

- **Next.js 15** - App Router, Server Components, Server Actions
- **React 19** - Latest React features
- **TypeScript** - Strict mode for full type safety
- **Tailwind CSS 4** - Utility-first styling
- **shadcn/ui** - Beautiful, accessible components

### Database & Auth

- **Drizzle ORM** - TypeScript-first ORM with edge support
- **Neon PostgreSQL** - Serverless Postgres
- **Better Auth** - Modern authentication with RBAC

### Deployment

- **Cloudflare Workers** - Edge deployment
- **OpenNext** - Next.js adapter for Cloudflare

### Developer Experience

- **Turbopack** - Fast development builds
- **ESLint + Prettier** - Code quality
- **React Hook Form + Zod** - Type-safe form validation

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/essedev/plannerinator.git
cd plannerinator
pnpm install
```

### 2. Environment Setup

Create `.env` file:

```bash
# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://..."

# Better Auth
BETTER_AUTH_URL="http://localhost:3000"
BETTER_AUTH_SECRET="run: openssl rand -base64 32"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Email (optional - mock by default)
ADMIN_EMAIL="admin@yourdomain.com"
# RESEND_API_KEY="re_xxxxx" # Uncomment to enable real emails
```

Generate Better Auth secret:

```bash
openssl rand -base64 32
```

### 3. Database Setup

```bash
# Generate migration
pnpm db:generate

# Push to database
pnpm db:push

# Open Drizzle Studio (optional)
pnpm db:studio
```

### 4. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth pages (login, register)
│   ├── dashboard/         # Protected dashboard
│   └── api/auth/          # Better Auth handler
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── layout/            # Navbar, Footer, Sidebar
│   ├── tasks/             # Task components (future)
│   ├── events/            # Event components (future)
│   └── notes/             # Note components (future)
├── features/
│   ├── auth/              # Authentication logic
│   ├── profile/           # Profile management
│   ├── users/             # User management (admin)
│   ├── tasks/             # Task management (future)
│   └── events/            # Event management (future)
├── lib/
│   ├── auth.ts            # Better Auth config
│   ├── auth-client.ts     # Client auth hooks
│   └── permissions.ts     # RBAC helpers
├── db/
│   ├── schema.ts          # Drizzle schema
│   └── index.ts           # Database client
└── types/                 # TypeScript types
```

## 📜 Available Scripts

```bash
# Development
pnpm dev              # Start dev server
pnpm build            # Production build
pnpm start            # Start production server

# Code Quality
pnpm lint             # Run ESLint
pnpm format           # Format with Prettier
pnpm format:check     # Check formatting
pnpm typecheck        # TypeScript checking

# Database
pnpm db:generate      # Generate migrations
pnpm db:push          # Push schema to database
pnpm db:studio        # Open Drizzle Studio

# Deployment
pnpm deploy           # Deploy to Cloudflare
pnpm preview          # Preview Cloudflare build
```

## 🗺️ Project Status

**Current Phase:** Phase 1 In Progress

**Overall Progress:** ~26%

### ✅ Phase 0: Foundation (100% Complete)

- ✅ Better Auth with email/password, password reset, email verification
- ✅ RBAC system (user/admin roles)
- ✅ Complete database schema for all entities (tasks, events, notes, projects, collections, links, tags, comments)
- ✅ Type-safe validation (Zod schemas, branded types, type guards)
- ✅ Dashboard shell with responsive navigation
- ✅ Profile & user management

### 🚧 Phase 1: Core Entities (35% Complete)

**Completed:**

- ✅ Database schemas for all entities
- ✅ Zod validation schemas
- ✅ TypeScript type definitions
- ✅ **Task Management CRUD** (2025-01-21)
  - ✅ Server Actions (create, update, delete, bulk operations)
  - ✅ Database queries (filters, search, relations)
  - ✅ Task list page with filters
  - ✅ Task detail/edit page
  - ✅ Task creation page
  - ✅ Components (TaskCard, TaskList, TaskForm, TaskFilters)
  - ✅ Features: completion, priority badges, overdue detection, project assignment

**In Progress:**

- ⏳ Event Management CRUD
- ⏳ Note Management CRUD
- ⏳ Project Management CRUD
- ⏳ Universal features (tags, comments, links, search)

**Next Steps:**

1. Setup testing infrastructure (Vitest) for Task Management
2. Implement Event Management (Server Actions + UI components)
3. Implement Notes with markdown editor
4. Implement Projects with stats dashboard

### 📋 Future Phases

- **Phase 2:** Collections system with dynamic schemas
- **Phase 3:** Activity timeline, advanced search, data export/import
- **Phase 4:** Collaboration & sharing
- **Phase 5:** AI Assistant with natural language commands

See [ROADMAP.md](./docs/plannerinator/ROADMAP.md) for detailed feature breakdown and timeline estimates.

## 📚 Documentation

### Core Documentation

- 📍 **[ROADMAP.md](./docs/plannerinator/ROADMAP.md)** - Complete roadmap with progress tracking
- 🏗️ **[ARCHITECTURE.md](./docs/plannerinator/ARCHITECTURE.md)** - Application architecture
- 🗄️ **[DATABASE_SCHEMA.md](./docs/plannerinator/DATABASE_SCHEMA.md)** - Complete database schema

### Technical Docs

- 🎨 **[UI_PATTERNS.md](./docs/plannerinator/UI_PATTERNS.md)** - UI/UX patterns
- ⚡ **[API_DESIGN.md](./docs/plannerinator/API_DESIGN.md)** - Server Actions design
- 🔐 **[AUTHENTICATION.md](./docs/AUTHENTICATION.md)** - Better Auth setup
- 👥 **[RBAC.md](./docs/RBAC.md)** - Role-based access control
- 📧 **[EMAIL_SYSTEM.md](./docs/EMAIL_SYSTEM.md)** - Email configuration

## 🚢 Deployment

### Cloudflare Workers

```bash
# First-time setup
pnpm wrangler login

# Set secrets
pnpm wrangler secret put DATABASE_URL
pnpm wrangler secret put BETTER_AUTH_SECRET

# Deploy
pnpm deploy
```

Configuration in `wrangler.jsonc`

## 🤝 Contributing

This is a personal project, but contributions are welcome! Please open an issue first to discuss proposed changes.

## 📝 License

MIT License - feel free to use this for your own projects.

## 🙏 Credits

Built with:

- [Next.js](https://nextjs.org)
- [Drizzle ORM](https://orm.drizzle.team)
- [Better Auth](https://better-auth.com)
- [shadcn/ui](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com)
- [Cloudflare Workers](https://workers.cloudflare.com)

---

Made with ❤️ by [@essedev](https://github.com/essedev)
