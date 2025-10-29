# Plannerinator - Roadmap

Roadmap delle feature di Plannerinator, focalizzata sul presente e futuro prossimo.

> **📖 Per storico completo delle release, vedi [CHANGELOG.md](../../../CHANGELOG.md)**
> **📋 Per idee e feature future, vedi [BACKLOG.md](./BACKLOG.md)**
> **📚 Per dettagli tecnici, vedi [ARCHITECTURE.md](../technical/ARCHITECTURE.md)**

**Legenda:**

- ✅ Completato e funzionante
- 🚧 In sviluppo
- ⏳ Pianificato (prossimi 1-2 mesi)
- 💭 Futuro (vedi BACKLOG.md)

---

## 📊 Progress Overview

**Overall Progress: ~85%**

- ✅ **Phase 0 (Foundation):** 100% Complete - [v0.1.0](../../../CHANGELOG.md#010)
- ✅ **Phase 1 (Core Entities):** 100% Complete - [v0.2.0](../../../CHANGELOG.md#020)
- ✅ **Phase 2 (Critical UX):** 100% Complete - [v0.3.0](../../../CHANGELOG.md#030)
- ✅ **Phase 2.5 (Dashboard & Kanban):** 100% Complete - [v0.4.0](../../../CHANGELOG.md#040)
- ✅ **Phase 2.6 (Modern Dashboard):** 100% Complete - [v0.5.0](../../../CHANGELOG.md#050)
- ✅ **Phase 2.7 (File Attachments):** 100% Complete - [v0.6.0](../../../CHANGELOG.md#060)
- ✅ **Phase 2.8 (Optimistic UI):** 100% Complete - [v0.7.0](../../../CHANGELOG.md#070)
- ✅ **Phase 2.9 (Trash System):** 100% Complete - [v0.8.0](../../../CHANGELOG.md#080)
- ✅ **Phase 2.10 (Enhanced Detail Pages):** 100% Complete - [v0.9.0](../../../CHANGELOG.md#090)
- ⏳ **Phase 3 (Collections & Advanced):** 0% Complete - **CURRENT FOCUS**
- 💭 **Phase 4+ (Collaboration/AI):** Pianificate - vedi [BACKLOG.md](./BACKLOG.md)

---

## ✅ Completed Phases (Brief Summary)

Le prime tre fasi sono state completate con successo. Per dettagli completi su implementazione, feature e date di rilascio, consulta il [CHANGELOG.md](../../../CHANGELOG.md).

### Phase 0: Foundation (100% - v0.1.0)

Sistema base completo con auth, database, UI infrastructure:

- Better Auth (email/password, reset, verification, RBAC)
- PostgreSQL con Drizzle ORM
- Complete database schema per tutte le entità
- TypeScript strict mode + Zod validation
- Next.js 15 App Router + Tailwind CSS 4
- shadcn/ui components + Dark mode
- Dashboard shell con sidebar navigation
- Vitest setup + Database seeding system
- Cloudflare Workers deployment config

### Phase 1: Core Entities (100% - v0.2.0)

Implementazione CRUD completo per le 4 entità principali + Universal Features:

**Core Entities:**

- ✅ **Task Management:** CRUD completo, subtasks, priority, status, bulk operations, filters
- ✅ **Event Management:** CRUD completo, calendar types, location, all-day support
- ✅ **Note Management:** CRUD completo, markdown, nested notes, favorites, types
- ✅ **Project Management:** CRUD completo, stats, progress tracking, sub-projects

**Universal Features:**

- ✅ **Tagging System:** Create/edit/delete tags, autocomplete, usage statistics
- ✅ **Comments System:** Nested comments, edit/delete, user avatars
- ✅ **Linking System:** 8 relationship types, bidirectional, entity resolution
- ✅ **Global Search:** Command palette (Cmd+K), search across all entities

### Phase 2: Critical UX Improvements (100% - v0.3.0)

Miglioramenti essenziali all'usabilità delle feature esistenti:

- ✅ **Calendar View per Eventi:** react-big-calendar, drag & drop, multiple views
- ✅ **Tag Filters:** Multi-select con AND/OR logic in tutte le entità
- ✅ **Markdown Editor:** Split view, live preview, syntax highlighting, GFM support
- ✅ **Dashboard Homepage:** QuickStats, TodayView, UpcomingDeadlines, QuickActions
- ✅ **Kanban View per Task:** Drag & drop, 3 colonne (Todo/In Progress/Done)

### Phase 2.5: Dashboard & Kanban (100% - v0.4.0)

Miglioramenti alla dashboard e gestione task:

- ✅ **Dashboard Enhancements:** QuickStats, QuickActions, TodayView, UpcomingDeadlines
- ✅ **Kanban Board:** Drag & drop task management, status-based columns
- ✅ **UI/UX Consistency:** PageHeader standardization (100% coverage), EmptyState component, form button patterns

### Phase 2.6: Modern Dashboard Layout (100% - v0.5.0-v0.5.4)

Redesign completo del layout dashboard per ottimizzare spazio e UX:

- ✅ **Collapsible Sidebar:** AppSidebar component con shadcn/ui (Cmd+B shortcut)
- ✅ **Dynamic Breadcrumbs:** Navigazione contestuale con generazione automatica
- ✅ **Layout Separation:** ConditionalLayout per pagine pubbliche vs dashboard
- ✅ **Full-width Dashboard:** Rimossa constraint max-width per migliore utilizzo spazio
- ✅ **Mobile Responsive:** Sidebar come Sheet su mobile con gesture support
- ✅ **Logout Button:** Sidebar footer con user info e azioni
- ✅ **Calendar Styling:** Dedicated calendar.css con CSS custom properties
- ✅ **Filter Improvements:** Better responsive behavior per componenti filtro
- ✅ **Tag Filter UI:** Unified auth page con tabbed interface, tag width matching

### Phase 2.7: File Attachments System (100% - v0.6.0)

Sistema completo di file attachments con Cloudflare R2 storage:

- ✅ **R2 Integration:** Cloudflare R2 per storage cloud sicuro
- ✅ **File Upload:** Drag-and-drop con progress tracking
- ✅ **Image Preview:** Lightbox per immagini caricate
- ✅ **File Management:** AttachmentsSection component per upload, preview, management
- ✅ **Storage Quota:** Per-user quota tracking ed enforcement
- ✅ **Secure Downloads:** Presigned URL generation per download sicuri
- ✅ **Universal Support:** Attachments per tasks, events, notes, projects
- ✅ **Database Migration:** Attachments table con foreign keys a tutte le entità
- ✅ **Components:** ProgressBar, ConfirmDialog, Pagination components
- ✅ **Documentation:** R2_SETUP.md e ATTACHMENTS_IMPLEMENTATION.md

### Phase 2.8: Optimistic UI & Form Improvements (100% - v0.7.0)

Miglioramenti UX con optimistic updates e consistency forms:

- ✅ **Optimistic Comments:** Instant feedback quando si postano commenti con "Posting..." status
- ✅ **Form Consistency:** Calendar type, status, note type visibili in create mode
- ✅ **Project Edit Page:** Dedicated route `/dashboard/projects/[id]/edit`
- ✅ **Layout Improvements:** ProjectCard con flexbox, PageHeader con better gap spacing
- ✅ **Projects Grid:** 2-column layout per better card sizing
- ✅ **Text Overflow Fixes:** Proper word breaking e line-clamping in ProjectCard
- ✅ **Date Handling:** Convert date strings to Date objects in project edit page

### Phase 2.9: Trash System & Entity Helpers (100% - v0.8.0)

Sistema di gestione trash con soft delete e refactoring architetturale:

- ✅ **Trash System:** Soft delete per tasks, events, notes, projects con restore functionality
- ✅ **Trash Page:** `/dashboard/trash` con TrashList component per gestione cestino
- ✅ **Hard Delete:** Opzione per eliminazione permanente da trash
- ✅ **Entity Helpers Library:** `entity-helpers.ts` con utilities condivise per CRUD operations
- ✅ **Code Quality:** Riduzione duplicazione codice del ~40% tramite helpers riutilizzabili
- ✅ **Database Schema:** Campi `deletedAt` e `archivedAt` aggiunti a tutte le entità
- ✅ **Database Indexes:** Indici per `deletedAt` e `archivedAt` per query efficienti
- ✅ **Archive Operations:** `archiveEntity` e `restoreArchivedEntity` helpers
- ✅ **Session & Ownership:** Unified validation tramite `validateSession` e `checkOwnership`
- ✅ **Error Handling:** Standardized error handling con `handleEntityError`

### Phase 2.10: Enhanced Detail Pages & Parent Relationships (100% - v0.9.0)

Miglioramento detail pages con action buttons e gestione parent relationships:

- ✅ **View-Only Detail Pages:** Separazione visualizzazione e modifica con edit su route dedicate
- ✅ **Action Buttons:** Archive, Delete, Edit buttons in page headers per tutte le entità
- ✅ **Parent Relationships:** Parent selection in EventForm, NoteForm, ProjectForm, TaskForm
- ✅ **Parent Display:** Parent relationship cards su detail pages con clickable links
- ✅ **Dedicated Edit Routes:** `/edit` routes per events, notes, tasks
- ✅ **ProjectDetailView:** Component tabbed con overview, tasks, events, notes tabs
- ✅ **Statistics Cards:** Task counts, completion rate, upcoming events in project detail
- ✅ **Task Breakdown:** Status distribution visualization in project overview
- ✅ **Server Actions:** Fetch parent selection options per form dropdowns
- ✅ **Database Migration:** Schema update per parent relationship support
- ✅ **Delete Confirmation:** ConfirmDialog per delete operations su tutte le entità

---

## ⏳ Phase 3: Collections & Advanced Features (CURRENT FOCUS)

**Obiettivo:** Sistema Collections + Activity tracking + data management avanzato.

**Status:** 0% Complete - Database schema pronto, implementazione non ancora iniziata

### 3.1 Collections System ⭐⭐⭐

**Pianificato** - Database schema implementato

Sistema flessibile per creare liste personalizzate con schema definibile dall'utente.

**Core Features:**

- ⏳ Visual schema builder UI (drag & drop field editor)
- ⏳ Dynamic form generation basato su schema
- ⏳ Supported field types: text, textarea, number, date, select, checkbox, url, email
- ⏳ Collection views: Table, Card, List
- ⏳ Template collections (Books, Clients, Services, Recipes)
- 💭 Import/Export CSV

**Use Cases:**

- Freelance services (nome, prezzo, durata, tech stack)
- Books library (titolo, autore, rating, note)
- TV series tracker (titolo, stagioni, piattaforma)
- Clients database (nome, email, telefono, progetti associati)

**Database:**

```sql
-- Schema pronto in db/schema.ts
collection (id, name, description, schema_json, icon, color)
collection_item (id, collection_id, data_json)
```

### 3.2 Activity Timeline ⭐

**Pianificato** - Database schema pronto

Auto-track di tutte le modifiche alle entità per avere uno storico completo.

**Core Features:**

- ⏳ Auto-track all entity changes (create, update, delete)
- ⏳ Store JSON diff for updates
- ⏳ Timeline view per user
- ⏳ Timeline view per entity
- ⏳ Filter by entity type, date range, action
- 💭 Undo system (Cmd+Z)
- 💭 Restore deleted entities

**Database:**

```sql
-- Schema pronto in db/schema.ts
activity_log (id, user_id, entity_type, entity_id, action, changes_json)
```

### 3.3 Data Management ⭐

Strumenti per export/import/backup dei dati.

- ⏳ Export to JSON (all data or filtered)
- ⏳ Export to CSV (collections)
- ⏳ Export to Markdown (notes)
- ⏳ Import from JSON (backup restore)
- ⏳ Manual backup (download JSON snapshot)
- 💭 Automatic daily backup (Cloudflare R2)

### 3.4 Advanced Search ⭐⭐

**Pianificato** - Migliorare ricerca esistente

Potenziamento del sistema di ricerca attuale (Cmd+K).

**Features:**

- ⏳ PostgreSQL full-text search (tsvector)
- ⏳ Search ranking + highlight matches
- ⏳ Search filters (entity type, date range, tags)
- 💭 Saved searches
- 💭 Smart searches (dynamic: "Tasks due this week")
- 💭 Semantic search (AI-powered, embeddings)

**Note:** Search basico già implementato in Phase 1, qui si aggiungono feature avanzate.

---

## 💭 Future Phases (Beyond Phase 3)

Le fasi successive sono pianificate ma non ancora schedulate. Per dettagli completi e priorità, consulta [BACKLOG.md](./BACKLOG.md).

### Phase 4: Collaboration (0%)

Sistema di condivisione entità tra utenti con permessi granulari.

**Key Features:**

- Share entities con altri utenti
- Permission levels (view, comment, edit)
- Real-time collaboration features

📖 **Spec tecnica completa:** [SHARING.md](../future/SHARING.md)

### Phase 5: AI Assistant (0%)

Assistente AI conversazionale per gestione task e automazioni.

**Key Features:**

- Chat interface per creazione/modifica entità
- Natural language commands
- Smart suggestions e auto-categorization

📖 **Spec tecnica completa:** [AI_ASSISTANT.md](../future/AI_ASSISTANT.md)

### Phase 6: Advanced Integrations (0%)

- Calendar Sync (Google Calendar, Outlook)
- Email Integration (forward → task)
- File Uploads (Cloudflare R2)
- API & Webhooks

Vedi [BACKLOG.md](./BACKLOG.md) per lista completa feature ideas.

---

## 🔧 Technical Improvements (Cross-cutting)

> **📖 Per dettagli completi su standard e best practice, vedi [CODE_QUALITY.md](../technical/CODE_QUALITY.md)**

### Performance

- ✅ Server-side rendering (RSC)
- ✅ Server Actions for mutations
- ✅ Database connection pooling + indexes
- ✅ Code splitting
- ✅ Centralized date/time utilities
- ✅ Centralized enum labels
- ⏳ React Query for client-side caching (partial)
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
- ✅ Collapsible sidebar with mobile Sheet support
- ✅ Full-width dashboard layout for optimal space utilization
- ⏳ Touch-friendly targets (min 44px)
- 💭 PWA (install prompt, offline mode)
- 💭 Mobile gestures (swipe actions)

---

## 🎯 Development Priorities

### ✅ Completed (Phases 0-2)

Tutte le feature foundation, core entities e UX improvements sono completate. Vedi [CHANGELOG.md](../../../CHANGELOG.md) per dettagli.

### 🚀 Current Sprint (Phase 3)

**In ordine di priorità:**

1. **Collections System MVP**
   - Schema builder UI
   - Dynamic form generation
   - Basic CRUD operations
   - Template collections

2. **Activity Timeline**
   - Auto-tracking setup
   - Timeline view component
   - Basic filters

3. **Data Export/Import**
   - JSON export/import
   - CSV export for collections
   - Markdown export for notes

4. **Advanced Search**
   - PostgreSQL full-text search
   - Search ranking
   - Advanced filters

### 💭 Phase 4+ (Pianificate)

Vedi [BACKLOG.md](./BACKLOG.md) per:

- Collaboration features (sharing, permissions)
- AI Assistant (chat interface, smart suggestions)
- Advanced integrations (calendar sync, email)

---

## 🚀 Feature Flags

Sistema di feature flags per abilitare/disabilitare funzionalità gradualmente.

> **Per implementazione e usage, vedi [CODE_QUALITY.md](../technical/CODE_QUALITY.md#feature-flags)**

```typescript
// src/lib/features.ts
export const FEATURES = {
  // Phase 1-2 - Core (All enabled)
  TASKS: true,
  EVENTS: true,
  NOTES: true,
  PROJECTS: true,
  TAGS: true,
  COMMENTS: true,
  LINKS: true,
  SEARCH: true,
  FILE_UPLOADS: true, // ✅ Enabled in v0.6.0

  // Phase 3+ (Gradual rollout)
  COLLECTIONS: false,
  ACTIVITY_LOG: false,
  EXPORT_IMPORT: false,

  // Phase 4+
  SHARING: false,
  AI_ASSISTANT: false,
  API_WEBHOOKS: false,
} as const;
```

---

## 📝 Recent Milestones

### v0.9.0 - Enhanced Detail Pages & Parent Relationships (2025-10-27)

Miglioramento detail pages con action buttons e gestione parent relationships:

- Detail pages refactored to view-only con edit su route dedicate
- Archive, Delete, Edit buttons in page headers
- Parent relationship management per tutte le entità
- ProjectDetailView component con interfaccia tabbed
- Statistics cards e task breakdown in project detail
- Database migration per parent relationship support

Dettagli completi: [CHANGELOG.md](../../../CHANGELOG.md#090)

### v0.8.0 - Trash System & Entity Helpers (2025-10-27)

Sistema trash con soft delete e refactoring architetturale:

- Trash system completo con soft delete e restore functionality
- Entity helpers library per ridurre duplicazione codice (~40%)
- Database schema updates (deletedAt, archivedAt fields)
- Unified session validation e ownership checks
- Standardized error handling patterns

Dettagli completi: [CHANGELOG.md](../../../CHANGELOG.md#080)

### v0.7.0 - Optimistic UI & Form Improvements (2025-10-26)

Miglioramenti UX con optimistic updates e form consistency:

- Optimistic UI per commenti con instant feedback
- Form consistency improvements (calendar type, status, note type in create mode)
- Project edit page dedicata
- Layout improvements (ProjectCard, PageHeader, 2-column grid)

Dettagli completi: [CHANGELOG.md](../../../CHANGELOG.md#070)

### v0.5.0-v0.5.4 - Modern Dashboard Layout (2025-10-23/24)

Redesign completo del layout dashboard:

- Collapsible sidebar con shadcn/ui (Cmd+B)
- Full-width content area
- Breadcrumbs dinamici
- Unified auth page con tabs
- Filter UI improvements

Dettagli completi: [CHANGELOG.md](../../../CHANGELOG.md#050)

### v0.4.0 - Dashboard & Kanban (2025-10-23)

Dashboard enhancements e kanban board:

- Dashboard components (QuickStats, TodayView, UpcomingDeadlines, QuickActions)
- Kanban board con drag & drop
- UI/UX consistency improvements

Dettagli completi: [CHANGELOG.md](../../../CHANGELOG.md#040)

### v0.3.0 - Phase 2 Complete

Tutte le 5 feature UX critiche implementate:

- Calendar View, Tag Filters, Markdown Editor, Dashboard, Kanban View

Dettagli completi: [CHANGELOG.md](../../../CHANGELOG.md#030)

### v0.2.0 - Phase 1 Complete

Core entities (Tasks, Events, Notes, Projects) + Universal Features (Tags, Comments, Links, Search)

Dettagli completi: [CHANGELOG.md](../../../CHANGELOG.md#020)

### v0.1.0 - Phase 0 Complete

Foundation completa: Auth, Database, UI, Testing infrastructure

Dettagli completi: [CHANGELOG.md](../../../CHANGELOG.md#010)

---

**Milestone attuale:** Phase 3 - Collections System & Advanced Features (0%)
**Prossima release:** v0.10.0 (Collections MVP o Data Management)

> **📋 Per lista completa di enhancement e feature ideas, vedi [BACKLOG.md](./BACKLOG.md)**
> **📖 Per storico release complete, vedi [CHANGELOG.md](../../../CHANGELOG.md)**
