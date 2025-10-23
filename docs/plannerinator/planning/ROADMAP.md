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

**Overall Progress: ~70%**

- ✅ **Phase 0 (Foundation):** 100% Complete - [v0.1.0](../../../CHANGELOG.md#010---2025-01-21)
- ✅ **Phase 1 (Core Entities):** 100% Complete - [v0.2.0](../../../CHANGELOG.md#020---2025-10-22)
- ✅ **Phase 2 (Critical UX):** 100% Complete - [v0.3.0](../../../CHANGELOG.md#030---2025-10-23)
- ⏳ **Phase 3 (Collections & Advanced):** 5% Complete - **CURRENT FOCUS**
- 💭 **Phase 4+ (Collaboration/AI):** Pianificate - vedi [BACKLOG.md](./BACKLOG.md)

---

## ✅ Completed Phases (Brief Summary)

Le prime tre fasi sono state completate con successo. Per dettagli completi su implementazione, feature e date di rilascio, consulta il [CHANGELOG.md](../../../CHANGELOG.md).

### Phase 0: Foundation (100% - v0.1.0)

**Completata:** Gennaio 21, 2025

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

**Completata:** Ottobre 22, 2025

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

**Completata:** Ottobre 23, 2025

Miglioramenti essenziali all'usabilità delle feature esistenti:

- ✅ **Calendar View per Eventi:** react-big-calendar, drag & drop, multiple views
- ✅ **Tag Filters:** Multi-select con AND/OR logic in tutte le entità
- ✅ **Markdown Editor:** Split view, live preview, syntax highlighting, GFM support
- ✅ **Dashboard Homepage:** QuickStats, TodayView, UpcomingDeadlines, QuickActions
- ✅ **Kanban View per Task:** Drag & drop, 3 colonne (Todo/In Progress/Done)

---

## ⏳ Phase 3: Collections & Advanced Features (CURRENT FOCUS)

**Obiettivo:** Sistema Collections + Activity tracking + data management avanzato.

**Status:** 5% Complete - Database schema pronto, implementazione in corso

**Timeline stimata:** 1-2 mesi

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
- ⏳ Touch-friendly targets (min 44px)
- 💭 PWA (install prompt, offline mode)
- 💭 Mobile gestures (swipe actions)

---

## 🎯 Development Priorities

### ✅ Completed (Phases 0-2)

Tutte le feature foundation, core entities e UX improvements sono completate. Vedi [CHANGELOG.md](../../../CHANGELOG.md) per dettagli.

### 🚀 Current Sprint (Phase 3)

**Prossimi 1-2 mesi - In ordine di priorità:**

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

### 💭 Next Quarter (Phase 4+)

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

  // Phase 3+ (Gradual rollout)
  COLLECTIONS: false,
  ACTIVITY_LOG: false,
  EXPORT_IMPORT: false,

  // Phase 4+
  SHARING: false,
  AI_ASSISTANT: false,
  FILE_UPLOADS: false,
  API_WEBHOOKS: false,
} as const;
```

---

## 📝 Recent Milestones

### UI/UX Consistency Improvements (Ottobre 23, 2025)

Standardizzazione completa dell'interfaccia utente per massima consistenza:

- **PageHeader standardizzato** in tutte le 15 pagine (100% coverage)
- **Back buttons** aggiunti a tutte le detail pages
- **EmptyState component** applicato a tutte le liste
- **Form button layout** unificato in tutti i form
- **Error colors** semantici (`text-destructive`)

**Risultato:** UI/UX consistency al 95%+ con pattern chiari e documentati

Dettagli completi: [CHANGELOG.md](../../../CHANGELOG.md#unreleased)

### v0.3.0 - Phase 2 Complete (Ottobre 23, 2025)

Tutte le 5 feature UX critiche implementate:

- Calendar View, Tag Filters, Markdown Editor, Dashboard, Kanban View

Dettagli completi: [CHANGELOG.md](../../../CHANGELOG.md#030---2025-10-23)

### v0.2.0 - Phase 1 Complete (Ottobre 22, 2025)

Core entities (Tasks, Events, Notes, Projects) + Universal Features (Tags, Comments, Links, Search)

Dettagli completi: [CHANGELOG.md](../../../CHANGELOG.md#020---2025-10-22)

### v0.1.0 - Phase 0 Complete (Gennaio 21, 2025)

Foundation completa: Auth, Database, UI, Testing infrastructure

Dettagli completi: [CHANGELOG.md](../../../CHANGELOG.md#010---2025-01-21)

---

**Ultimo aggiornamento:** 2025-10-23
**Milestone attuale:** Phase 3 - Collections System & Advanced Features (5%)
**Prossimo release:** v0.4.0 (Collections MVP)

> **📋 Per lista completa di enhancement e feature ideas, vedi [BACKLOG.md](./BACKLOG.md)**
> **📖 Per storico release complete, vedi [CHANGELOG.md](../../../CHANGELOG.md)**
