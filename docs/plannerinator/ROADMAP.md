# Plannerinator - Roadmap

Roadmap high-level delle feature di Plannerinator, organizzata per priorità di sviluppo.

> **📖 Per dettagli tecnici completi di ogni feature, vedi [FEATURES.md](./FEATURES.md)**
> **📋 Per standard e best practice del codice, vedi [CODE_QUALITY.md](./CODE_QUALITY.md)**

**Legenda:**

- ✅ Completato e funzionante
- 🚧 In sviluppo
- ⏳ Pianificato
- 💭 Idea futura (bassa priorità)

---

## 📊 Progress Overview

**Overall Progress: ~50%**

- ✅ **Phase 0 (Foundation):** 100% Complete
- ✅ **Phase 1 (Core Entities):** 100% Complete
- ⏳ **Phase 2 (Critical UX Improvements):** 0% - **PROSSIMA PRIORITÀ**
- ⏳ **Phase 3 (Collections & Advanced):** 5% Complete
- 💭 **Phase 4+ (Collaboration/AI):** 0%

---

## ✅ Phase 0: Foundation (COMPLETATO)

Sistema base completo con auth, database, UI infrastructure.

### Key Features

- ✅ Better Auth (email/password, reset, verification, RBAC)
- ✅ PostgreSQL con Drizzle ORM
- ✅ Complete database schema per tutte le entità
- ✅ TypeScript strict mode + Zod validation
- ✅ Next.js 15 App Router + Tailwind CSS 4
- ✅ shadcn/ui components + Dark mode
- ✅ Dashboard shell con sidebar navigation
- ✅ Vitest setup + Database seeding system
- ✅ Cloudflare Workers deployment config

---

## ✅ Phase 1: Core Entities (COMPLETATO)

Implementazione CRUD completo per le 4 entità principali + Universal Features.

### 1. Task Management ✅

**Status:** 100% Complete - [Dettagli →](./FEATURES.md#task-management)

Sistema completo per gestione task con subtasks, priorità, stati.

**Core Features:**

- CRUD completo con validazione
- Status: todo, in_progress, done, cancelled
- Priority: low, medium, high, urgent
- Subtasks (parent-child relationship)
- Assign to project
- Bulk operations (delete, complete, update status/priority)
- Filters (status, priority, project, date range, search)
- Overdue detection con visual highlight
- Responsive UI con toast notifications

### 2. Event Management ✅

**Status:** 100% Complete - [Dettagli →](./FEATURES.md#event-management)

Sistema completo per gestione eventi con location e tipi.

**Core Features:**

- CRUD completo con validazione
- Calendar types: personal, work, family, other
- Start/end time, all-day flag
- Location con optional map URL
- Assign to project
- Filters (calendar type, all-day, date range, search)
- Responsive UI

### 3. Note Management ✅

**Status:** 100% Complete - [Dettagli →](./FEATURES.md#note-management)

Sistema completo per gestione note con markdown e gerarchie.

**Core Features:**

- CRUD completo con validazione
- Note types: note, document, research, idea, snippet
- Markdown content (title optional)
- Nested notes (parent-child)
- Favorites (toggle + filter)
- Bulk operations (delete, favorite, update type, move to project)
- Filters (type, favorites, search)
- Responsive UI

### 4. Project Management ✅

**Status:** 100% Complete - [Dettagli →](./FEATURES.md#project-management)

Sistema completo per gestione progetti con stats e progress tracking.

**Core Features:**

- CRUD completo con validazione
- Status: active, on_hold, completed, archived, cancelled
- Start/end dates, color, icon
- Sub-projects (parent-child)
- Progress tracking (% tasks completed)
- Task breakdown by status
- Entity counts (tasks, events, notes)
- Overdue detection
- Detail page con tabs (Overview, Tasks, Events, Notes)
- Quick actions (archive, complete, delete)

### 5. Universal Features ✅

**Status:** 100% Complete - [Dettagli →](./FEATURES.md#universal-features)

Feature che funzionano su tutte le entità.

#### Tagging System ✅

- Create/edit/delete tags con colors
- Assign tags to any entity (polymorphic)
- Autocomplete search + create inline
- Tag usage statistics

#### Comments System ✅

- Add comment on any entity
- Edit/delete own comments
- Nested comments (replies)
- User avatars + timestamps
- Pagination support

#### Linking System ✅

- Link any entity to any other (bidirectional)
- 8 relationship types (assigned_to, documented_by, blocks, etc.)
- Duplicate prevention
- Entity resolution (fetch titles/names)
- Outgoing/incoming link views

#### Global Search ✅

- Command palette (Cmd+K / Ctrl+K)
- Search across all entities
- Recent items when query is empty
- Debounced search (300ms)
- Keyboard navigation
- Entity icons and metadata display

---

## ⏳ Phase 2: Critical UX Improvements (PROSSIMO)

**Obiettivo:** Miglioramenti essenziali all'usabilità delle feature esistenti.

**Status:** 0% - Pianificato come priorità #1

**Stima:** 2-3 settimane

### 2.1 Calendar View per Eventi ⭐⭐⭐ 🔴 CRITICO

**Pianificato** - Fondamentale per rendere gli eventi realmente usabili

**Core Features:**

- ⏳ Calendar view (month/week/day/agenda) con react-big-calendar
- ⏳ Drag & drop eventi per cambio date
- ⏳ Click su giorno per creare evento
- ⏳ Color coding per calendar type
- ⏳ Mini calendario sidebar per navigazione rapida
- ⏳ Today button + date picker navigation

**Benefici:**

- Visualizzazione naturale per eventi temporali
- Quick creation direttamente dal calendario
- Drag & drop per rescheduling veloce

### 2.2 Tag Filters ⭐⭐⭐ 🔴 CRITICO

**Pianificato** - Tag system è completo ma manca il filtering

**Core Features:**

- ⏳ Multi-select tag filter in Tasks list
- ⏳ Multi-select tag filter in Events list
- ⏳ Multi-select tag filter in Notes list
- ⏳ Multi-select tag filter in Projects list
- ⏳ Tag filter combo (AND/OR logic)
- ⏳ URL sync per tag filters
- ⏳ Tag filter badge in UI con count

**Benefici:**

- Rende il tag system realmente utilizzabile
- Filtering potente cross-entity
- Organizzazione migliorata

### 2.3 Markdown Preview per Note ⭐⭐⭐ 🔴 CRITICO

**Pianificato** - Editor attuale troppo limitato

**Core Features:**

- ⏳ Split view (edit | preview) o tabs
- ⏳ Live preview rendering con react-markdown
- ⏳ Syntax highlighting per code blocks (prism.js)
- ⏳ Toggle preview mode (edit / preview / split)
- ⏳ Markdown toolbar (bold, italic, headers, lists, code)
- ⏳ Markdown shortcuts (Ctrl+B, Ctrl+I, Ctrl+K)

**Benefici:**

- UX professionale per note-taking
- Verifica immediata della formattazione
- Editor paragonabile a Notion/Obsidian

### 2.4 Dashboard Homepage ⭐⭐⭐ 🔴 CRITICO

**Pianificato** - Dashboard attuale è vuota

**Core Widgets:**

- ⏳ Today View (task + eventi di oggi)
- ⏳ Upcoming Deadlines (prossimi 7 giorni)
- ⏳ Quick Stats (tasks done today, overdue, total active)
- ⏳ Recent Items (ultimi 5 item visitati)
- ⏳ Week Overview (task/eventi settimana)
- ⏳ Quick Add buttons (New Task/Event/Note)

**Benefici:**

- Landing page utile con overview giornaliera
- Quick actions per productivity
- Hub centrale per navigazione

### 2.5 Kanban View per Task ⭐⭐⭐ 🔴 CRITICO

**Pianificato** - Vista board molto richiesta

**Core Features:**

- ⏳ Kanban board con colonne (Todo / In Progress / Done)
- ⏳ Drag & drop tra colonne (aggiorna status)
- ⏳ Card compatte con title, priority, due date, project
- ⏳ Filter per project, priority, tags (sidebar)
- ⏳ Quick edit inline (title, priority, due date)
- ⏳ Toggle tra List view e Kanban view

**Benefici:**

- Workflow visuale per task management
- Drag & drop naturale per cambio status
- Vista preferita da developer/PM

---

## ⏳ Phase 3: Collections & Advanced Features

**Obiettivo:** Sistema Collections + Activity tracking + data management.

### 3.1 Collections System ⭐⭐

**Pianificato** - [Dettagli →](./FEATURES.md#collections-system)

- ⏳ Visual schema builder UI
- ⏳ Dynamic form generation basato su schema
- ⏳ Supported field types: text, textarea, number, date, select, checkbox, url, email
- ⏳ Collection views: Table, Card, List
- ⏳ Template collections (Books, Clients, Services, Recipes)
- 💭 Import/Export CSV

**Use Cases:**

- Freelance services (name, price, duration, tech stack)
- Books library (title, author, rating, notes)
- TV series tracker (title, seasons, platform)
- Clients database (name, email, phone, company)

### 3.2 Activity Timeline ⭐

**Pianificato** - [Dettagli →](./FEATURES.md#activity-timeline)

- ⏳ Auto-track all entity changes (create, update, delete)
- ⏳ Store JSON diff for updates
- ⏳ Timeline view per user
- ⏳ Timeline view per entity
- ⏳ Filter by entity type, date range, action
- 💭 Undo system (Cmd+Z)
- 💭 Restore deleted entities

### 3.3 Data Management ⭐

- ⏳ Export to JSON (all data or filtered)
- ⏳ Export to CSV (collections)
- ⏳ Export to Markdown (notes)
- ⏳ Import from JSON (backup restore)
- ⏳ Manual backup (download JSON snapshot)
- 💭 Automatic daily backup (Cloudflare R2)

### 3.4 Advanced Search ⭐⭐

**Pianificato** - [Dettagli →](./FEATURES.md#advanced-search)

- ⏳ PostgreSQL full-text search (tsvector)
- ⏳ Search ranking + highlight matches
- ⏳ Search filters (entity type, date range, tags)
- 💭 Saved searches
- 💭 Smart searches (dynamic: "Tasks due this week")
- 💭 Semantic search (AI-powered, embeddings)

### 3.5 Customization ⭐

- ✅ Light/Dark mode
- 💭 Custom color schemes
- 💭 Customizable dashboard widgets (drag & drop)
- 💭 Notifications (email reminders, push)

---

## 💭 Phase 4: Collaboration

**Obiettivo:** Condivisione e collaborazione multi-user.

**Status:** 0% - Database schema pronto ma commentato

### 4.1 Sharing System ⭐⭐

**Futuro** - [Dettagli →](./FEATURES.md#collaboration)

- 💭 Share entities con altri utenti
- 💭 Permission levels (view, comment, edit)
- 💭 Expiration dates + revoke access
- 💭 Transfer ownership
- 💭 Real-time presence (chi sta guardando)
- 💭 Conflict resolution

### 4.2 Team Workspaces (Bassa Priorità)

- 💭 Multi-tenancy (workspaces)
- 💭 Invite team members
- 💭 Workspace roles (owner, admin, member, guest)
- 💭 Billing per workspace

---

## 💭 Phase 5: AI Assistant

**Obiettivo:** Assistente AI per creazione veloce e automazioni.

**Status:** 0%

### 5.1 Chat Interface ⭐⭐⭐

**Futuro** - [Dettagli →](./FEATURES.md#ai-assistant)

- 💭 Sidebar chat panel (toggle on/off)
- 💭 Natural language commands:
  - "Crea task chiamare Mario domani alle 15"
  - "Mostrami i task del progetto X"
- 💭 Multi-entity creation
- 💭 Auto-tag suggestions
- 💭 Smart reminders (AI suggests when to work)

### 5.2 Advanced AI Features ⭐⭐

- 💭 Auto-categorization (tags, project assignment)
- 💭 Project template generation
- 💭 Meeting notes summarization
- 💭 Semantic search (embedding-based)

---

## 💭 Phase 6: Advanced Integrations

### 6.1 Calendar Sync ⭐

- 💭 Google Calendar sync (bidirectional)
- 💭 Outlook Calendar sync
- 💭 Apple Calendar (.ics subscription)

### 6.2 Email Integration

- 💭 Forward email → create task
- 💭 Daily digest email

### 6.3 File Uploads ⭐

- ✅ Database schema (attachments table - commentato)
- 💭 Upload to Cloudflare R2
- 💭 Attach to any entity
- 💭 Supported: images, PDFs, documents
- 💭 Storage usage dashboard

### 6.4 API & Webhooks

- 💭 REST API per CRUD operations
- 💭 API keys management + rate limiting
- 💭 Webhooks on events (task.created, etc.)

---

## 🔧 Technical Improvements (Cross-cutting)

> **📖 Per dettagli completi su standard e best practice, vedi [CODE_QUALITY.md](./CODE_QUALITY.md)**

### Performance

- ✅ Server-side rendering (RSC)
- ✅ Server Actions for mutations
- ✅ Database connection pooling + indexes
- ✅ Code splitting
- ✅ Centralized date/time utilities
- ✅ Centralized enum labels
- ⏳ React Query for client-side caching
- 💭 Redis cache per heavy queries
- 💭 Virtual scrolling per long lists

### Security

- ✅ Better Auth with RBAC
- ✅ CSRF protection + XSS prevention
- ✅ SQL injection prevention (Drizzle)
- ✅ Rate limiting (database-backed)
- ⏳ Content Security Policy headers
- 💭 Audit log per security events

### Testing

- ✅ Vitest setup con path aliases
- ✅ Factory functions per dati di test
- ✅ Database seeding system
- ✅ Validation schemas tests (143 tests total)
- ❌ Server Actions/Queries tests (skipped - focus su feature)
- 💭 E2E tests con Playwright

### Accessibility

- ✅ Keyboard navigation (Tab, Arrow keys)
- ✅ ARIA labels + focus management
- ✅ Color contrast (WCAG AA)
- ⏳ Screen reader testing completo
- 💭 Reduced motion preference support

### Mobile

- ✅ Responsive design (mobile-first)
- ⏳ Touch-friendly targets (min 44px)
- 💭 PWA (install prompt, offline mode)
- 💭 Mobile gestures (swipe actions)

---

## 🎯 Development Priorities

### ✅ Completed (Phase 0-1)

1. ✅ Foundation complete (Auth, DB, UI, Testing infrastructure)
2. ✅ Task Management CRUD + UI
3. ✅ Event Management CRUD + UI
4. ✅ Note Management CRUD + UI
5. ✅ Project Management CRUD + UI
6. ✅ Tags System (integration su 4 entità)
7. ✅ Comments System (nested replies, integration su 4 entità)
8. ✅ Links System (8 relationship types, integration su 4 entità)
9. ✅ Global Search (Cmd+K command palette)

### 🚧 Next Steps (2-3 settimane) - **PHASE 2 CRITICO**

**Priority 1:** Calendar View per Eventi 🔴

- Calendar view con react-big-calendar (month/week/day/agenda)
- Drag & drop per rescheduling
- Click per creare eventi
- Color coding per calendar type

**Priority 2:** Tag Filters 🔴

- Multi-select tag filter in tutte le liste (Tasks/Events/Notes/Projects)
- URL sync + AND/OR logic
- Tag filter UI con count

**Priority 3:** Markdown Preview per Note 🔴

- Split view (edit | preview)
- Live preview con react-markdown
- Syntax highlighting per code blocks
- Markdown toolbar + shortcuts

**Priority 4:** Dashboard Homepage 🔴

- Today View (tasks + eventi)
- Upcoming Deadlines widget
- Quick Stats (done today, overdue)
- Recent Items + Quick Add buttons

**Priority 5:** Kanban View per Task 🔴

- Kanban board (Todo / In Progress / Done)
- Drag & drop tra colonne
- Toggle List/Kanban view

### Medium Term (1-2 mesi) - **PHASE 3**

- Collections System MVP (schema builder, dynamic forms)
- Activity Timeline (tracking automatico + timeline view)
- Data Export/Import (JSON, CSV, Markdown)
- Advanced Search (PostgreSQL tsvector)

### Long Term (3+ mesi) - **PHASE 4+**

- Collaboration features (sharing, permissions)
- AI Assistant (chat interface, smart suggestions)
- Advanced integrations (calendar sync, email)

---

## 📈 Timeline

### Completed

- ✅ **Phase 0-1:** Jan 21-22, 2025

### Estimated

- **Phase 2 (Critical UX):** 2-3 settimane ⭐ **PROSSIMO**
- **Phase 3 (Collections & Advanced):** 4-6 settimane
- **Phase 4+ (Collaboration/AI):** 6+ mesi

---

## 📝 Recent Milestones

### Week of Jan 21-22, 2025

- ✅ Task Management: CRUD completo + UI + bulk operations
- ✅ Event Management: CRUD completo + UI
- ✅ Note Management: CRUD completo + UI + bulk operations + favorites
- ✅ Project Management: CRUD completo + UI + stats + progress tracking
- ✅ Tags System: CRUD + autocomplete + integration su 4 entità
- ✅ Comments System: CRUD + nested replies + integration su 4 entità
- ✅ Links System: CRUD + 8 relationship types + integration su 4 entità
- ✅ Global Search: Cmd+K command palette + debounced search + recent items
- ✅ Code Quality: Labels consistency fix (4 pagine), date utilities centralized

### Database Seeding System (Jan 22)

- ✅ Factory functions riutilizzabili
- ✅ Dev seed script con dati realistici
- ✅ Script npm (`db:seed`, `db:clean`)
- ✅ Genera 2 utenti + 3 progetti + ~42 task + 19 eventi + 24 note

---

## 🚀 Feature Flags

Sistema di feature flags per abilitare/disabilitare funzionalità gradualmente.

> **Per implementazione e usage, vedi [CODE_QUALITY.md](./CODE_QUALITY.md#feature-flags)**

```typescript
// src/lib/features.ts
export const FEATURES = {
  // Phase 1 - Core (All enabled)
  TASKS: true,
  EVENTS: true,
  NOTES: true,
  PROJECTS: true,
  TAGS: true,
  COMMENTS: true,
  LINKS: true,
  SEARCH: true,

  // Phase 2+
  COLLECTIONS: false,
  ACTIVITY_LOG: false,
  EXPORT_IMPORT: false,
  SHARING: false,
  AI_ASSISTANT: false,
  FILE_UPLOADS: false,
  API_WEBHOOKS: false,
} as const;
```

---

**Ultimo aggiornamento:** 2025-01-22
**Prossimo milestone:** Phase 2 - Critical UX Improvements (Calendar View, Tag Filters, Markdown Preview, Dashboard, Kanban) 🔴
**Note:** Phase 1 (Core Entities + Universal Features) completata al 100%! 🎉

> **📋 Per lista completa di enhancement e feature ideas, vedi [ENHANCEMENTS.md](./ENHANCEMENTS.md)**
