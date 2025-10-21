# Features

Lista completa delle feature di Plannerinator, organizzate per priorità di sviluppo.

## Phase 1: Foundation (MVP)

### 1.1 Task Management ⭐⭐⭐

**CRUD Operations**
- [x] Create task con form validato
- [x] Edit task (inline e modal)
- [x] Delete task con confirmation
- [x] Mark as complete/incomplete

**Task Fields**
- [x] Titolo (required)
- [x] Descrizione (markdown, optional)
- [x] Due date (optional)
- [x] Start date (optional)
- [x] Duration stimata in minuti (optional)
- [x] Status (todo, in_progress, done, cancelled)
- [x] Priority (low, medium, high, urgent)

**Organization**
- [x] Assegna task a progetto
- [x] Subtasks (parent_task_id)
- [x] Drag & drop ordering

**Views**
- [x] Lista (default)
  - Filtri: status, priority, project, due date range
  - Ordinamento: due date, priority, created date
  - Group by: project, status, priority
- [x] Kanban (todo | in progress | done)
  - Drag & drop tra colonne
  - Colonne configurabili
- [ ] Calendario (task con due date)
  - Vista mese/settimana/giorno
  - Drag & drop per cambio data
- [ ] Timeline (Gantt-like)
  - Task con start/end date
  - Dependencies visualizzate

**Quick Actions**
- [x] Quick add task (Cmd+K → "new task")
- [x] Inline edit title/due date
- [x] Batch actions (mark multiple as done, delete, move to project)

---

### 1.2 Event Management ⭐⭐⭐

**CRUD Operations**
- [x] Create event
- [x] Edit event
- [x] Delete event
- [x] Duplicate event

**Event Fields**
- [x] Titolo (required)
- [x] Descrizione (optional)
- [x] Start time (required)
- [x] End time (optional)
- [x] All-day flag
- [x] Location (text + optional URL)
- [x] Calendar type (personal, work, family, other)

**Organization**
- [x] Assegna event a progetto
- [x] Link event a task

**Views**
- [x] Calendario
  - Vista mese (default)
  - Vista settimana
  - Vista giorno
  - Vista agenda (lista)
- [x] Lista eventi
  - Filtri: calendar type, project, date range
  - Oggi / Questa settimana / Questo mese

**Integrations (Futuro)**
- [ ] Import Google Calendar (read-only)
- [ ] Export .ics file
- [ ] Sync bidirezionale con Google Calendar

---

### 1.3 Note Management ⭐⭐⭐

**CRUD Operations**
- [x] Create note
- [x] Edit note
- [x] Delete note
- [x] Archive note

**Note Fields**
- [x] Titolo (optional)
- [x] Contenuto markdown (required)
- [x] Tipo (note, document, research, idea, snippet)

**Editor**
- [x] Markdown editor con preview
- [x] Syntax highlighting per code blocks
- [x] Toolbar (bold, italic, lists, links, code)
- [x] Autosave (debounced)

**Organization**
- [x] Assegna note a progetto
- [x] Nested notes (parent_note_id)
- [x] Favorites (quick access)

**Views**
- [x] Lista note
  - Filtri: tipo, project, favorite
  - Ordinamento: updated, created, title
- [x] Grid view (card preview)
- [ ] Graph view (connessioni tra note)

**Search**
- [x] Full-text search (title + content)
- [x] Search dentro note aperta (Cmd+F)

---

### 1.4 Project Management ⭐⭐

**CRUD Operations**
- [x] Create project
- [x] Edit project
- [x] Archive/Complete project
- [x] Delete project

**Project Fields**
- [x] Nome (required)
- [x] Descrizione (optional)
- [x] Status (active, on_hold, completed, archived, cancelled)
- [x] Start/end date (optional)
- [x] Colore + icon

**Organization**
- [x] Sub-projects (parent_project_id)
- [x] Project metadata JSONB (budget, client, hours, etc.)

**Views**
- [x] Lista progetti
  - Filtri: status
  - Ordinamento: name, created, start date
- [x] Project detail page
  - Overview (stats, timeline, description)
  - Tasks tab (filtered by project)
  - Events tab (filtered by project)
  - Notes tab (filtered by project)
  - Activity tab (chronological log)

**Stats & Analytics**
- [x] Total tasks / completed tasks
- [x] Total events
- [x] Total notes
- [ ] Progress % (completed tasks / total tasks)
- [ ] Hours tracked (se metadata contiene hours_tracked)
- [ ] Timeline view (start to end date)

---

### 1.5 Universal Features ⭐⭐⭐

**Linking System**
- [x] Link qualsiasi entità a qualsiasi altra
- [x] Relationship types:
  - assigned_to (task → project)
  - documented_by (task → note)
  - scheduled_as (task → event)
  - blocks / depends_on (task → task)
  - related_to (generic)
  - references (note → anything)
  - inspired_by (creative)
- [x] UI per gestire links:
  - Modal "Add link" con entity search
  - Lista links su entity detail
  - Remove link
- [ ] Link suggestions (AI-powered, futuro)

**Tagging System**
- [x] Create/edit/delete tags
- [x] Tag colori personalizzati
- [x] Assegna tags a qualsiasi entità
- [x] Tag autocomplete con frecce
- [x] Filter by tags (multi-select)
- [x] Tag usage count

**Comments**
- [x] Add comment su qualsiasi entità
- [x] Edit/delete proprio comment
- [x] Nested comments (replies)
- [ ] Mentions (@username, futuro quando multi-user)
- [ ] Rich text comments (bold, italic, code)

**Search & Filters**
- [x] Global search (Cmd+K)
  - Search across tasks, events, notes, projects
  - Entity type filters
  - Recent searches
  - Keyboard navigation
- [x] Advanced filters per entity
  - Combine multiple filters (AND logic)
  - Save filter presets (futuro)

---

## Phase 2: Collections & Flexibility

### 2.1 Collections System ⭐⭐

**Collection Management**
- [x] Create collection con schema custom
- [x] Edit collection schema
- [x] Delete collection (cascade items)
- [x] Icon + nome

**Schema Editor**
- [x] Visual schema builder
- [x] Field types supportati:
  - text (single line)
  - textarea (multi line)
  - number
  - date
  - select (single choice)
  - multiselect (multiple choices)
  - checkbox (boolean)
  - url
  - email
- [x] Field properties:
  - Label
  - Required/optional
  - Default value
  - Options (per select/multiselect)
  - Validation rules (min/max per number, regex per text)

**Collection Items**
- [x] Add item con form dinamico basato su schema
- [x] Edit item
- [x] Delete item
- [x] Duplicate item
- [x] Bulk import (CSV, futuro)

**Views**
- [x] Table view (default)
  - Sortable columns
  - Column visibility toggle
  - Column reordering (drag & drop)
  - Pagination
- [x] Card view (grid)
- [x] List view
- [ ] Custom views (salva configurazione colonne/filtri)

**Examples Preset Collections**
- Template "Servizi Freelance"
  - Campi: nome, prezzo, durata, tecnologie, descrizione
- Template "Libri"
  - Campi: titolo, autore, voto, genere, note, data lettura
- Template "Serie TV"
  - Campi: titolo, stagioni, piattaforma, voto, status
- Template "Clienti"
  - Campi: nome, email, telefono, azienda, progetti associati

---

## Phase 3: Advanced Features

### 3.1 Activity Timeline ⭐

**Activity Log**
- [x] Track all entity changes (create, update, delete)
- [x] Store JSON diff per update
- [x] Store full snapshot per undo capability
- [x] Timeline view per user
  - Filtri: entity type, date range, action type
  - Group by day
- [ ] Timeline view per entity
  - Mostra history completa di task/note/etc.

**Undo System (Futuro)**
- [ ] Undo last action (Cmd+Z)
- [ ] Undo history (lista azioni reversibili)
- [ ] Restore deleted entity

---

### 3.2 Data Management ⭐

**Export**
- [ ] Export to JSON (tutte le entità o filtrate)
- [ ] Export to CSV (per collection specifiche)
- [ ] Export to Markdown (note)
- [ ] Export to PDF (report, futuro)

**Import**
- [ ] Import from JSON (backup restore)
- [ ] Import from CSV (collections)
- [ ] Import from Markdown (bulk note creation)

**Backup**
- [ ] Manual backup (download JSON snapshot)
- [ ] Automatic daily backup (Cloudflare R2, futuro)

---

### 3.3 Advanced Search ⭐⭐

**Full-Text Search**
- [x] PostgreSQL full-text search (tsvector)
- [x] Italiano language support
- [x] Search ranking
- [x] Highlight matches

**Semantic Search (Futuro con AI)**
- [ ] Embedding-based search (OpenAI/Cohere)
- [ ] Natural language queries
  - "Mostrami task urgenti del progetto X"
  - "Note su Next.js scritte questo mese"
- [ ] Similar content suggestions

**Saved Searches**
- [ ] Save complex filter combinations
- [ ] Smart searches (dynamic, e.g., "Tasks due this week")
- [ ] Pin favorite searches to sidebar

---

### 3.4 Customization ⭐

**Themes**
- [x] Light/Dark mode
- [ ] Custom color schemes
- [ ] Accent color picker

**Dashboard Layout**
- [ ] Customizable homepage
  - Widget: upcoming tasks
  - Widget: today's events
  - Widget: recent notes
  - Widget: project progress
  - Drag & drop positioning
- [ ] Sidebar customization
  - Reorder menu items
  - Hide/show sections
  - Pin favorite projects/collections

**Notifications (Futuro)**
- [ ] Email reminders per task scadenze
- [ ] In-app notifications
- [ ] Browser notifications (Push API)
- [ ] Configurable per user

---

## Phase 4: Collaboration

### 4.1 Sharing System ⭐⭐

**Share Entity**
- [ ] Share task/event/note/project con altro user
- [ ] Share via email (genera invite link)
- [ ] Permission levels:
  - View (solo lettura)
  - Comment (può commentare)
  - Edit (può modificare)
- [ ] Expiration date per share

**Shared Entities UI**
- [ ] Badge "Shared" su entity card
- [ ] Lista partecipanti su detail page
- [ ] Revoke access
- [ ] Transfer ownership

**Collaboration Features**
- [ ] Real-time presence (chi sta guardando)
- [ ] Real-time updates (quando qualcuno modifica)
- [ ] Comment mentions (@username)
- [ ] Activity feed condiviso

---

### 4.2 Team Workspaces (Futuro, Non Priority)

**Multi-tenancy**
- [ ] Workspaces (organizzazione)
- [ ] Invite team members
- [ ] Roles (owner, admin, member, guest)
- [ ] Workspace-level settings
- [ ] Billing per workspace

---

## Phase 5: AI Assistant

### 5.1 Chat Interface ⭐⭐⭐

**UI**
- [ ] Sidebar chat panel (toggle on/off)
- [ ] Floating chat button
- [ ] Chat history persistente
- [ ] Markdown rendering in chat

**Basic Commands**
- [ ] Create task via natural language
  - "Crea task chiamare Mario domani alle 15"
  - "Aggiungi task fare la spesa per venerdì"
- [ ] Create event
  - "Aggiungi meeting con cliente lunedì ore 10"
- [ ] Create note
  - "Salva questa idea: app per gestire ricette"
- [ ] Search
  - "Mostrami i task del progetto X"
  - "Cerca note su React"

---

### 5.2 Advanced AI Features ⭐⭐

**Smart Parsing**
- [ ] Extract entities da testo libero
  - "Devo chiamare Mario domani alle 15 per il progetto Sito Web"
    → Task + link a progetto
- [ ] Multi-entity creation
  - "Crea progetto X con 3 task: A, B, C"
    → Progetto + 3 task collegati

**Suggestions**
- [ ] Auto-tag suggestions basate su contenuto
- [ ] Link suggestions (detect related entities)
- [ ] Task breakdown
  - "Come posso dividere questo task complesso?"
  - AI suggerisce subtasks

**Query Natural Language**
- [ ] Filtri complessi via chat
  - "Task urgenti del mese scorso non completati"
  - "Eventi di lavoro della prossima settimana"
- [ ] Stats & insights
  - "Quanti task ho completato questo mese?"
  - "Quale progetto ha più task aperti?"

---

### 5.3 AI Automation (Futuro)

**Smart Reminders**
- [ ] AI suggerisce quando lavorare su task
  - Basato su deadline, priority, calendario libero

**Auto-categorization**
- [ ] AI assegna automaticamente tags
- [ ] AI suggerisce progetto per nuovo task

**Templates**
- [ ] AI genera template progetti ricorrenti
  - "Crea progetto come quello fatto per cliente X"

---

## Phase 6: Advanced Integrations

### 6.1 Calendar Sync ⭐

- [ ] Google Calendar sync (bidirezionale)
- [ ] Outlook Calendar sync
- [ ] Apple Calendar (.ics subscription)

### 6.2 Email Integration

- [ ] Forward email → create task
- [ ] Email reminders
- [ ] Daily digest

### 6.3 File Uploads ⭐

**Attachments**
- [ ] Upload file (Cloudflare R2)
- [ ] Attach a qualsiasi entità
- [ ] Supported: immagini, PDF, documenti, video
- [ ] Image preview
- [ ] File size limits (100MB max)

**File Management**
- [ ] Storage usage dashboard
- [ ] Delete unused files
- [ ] File search

### 6.4 API & Webhooks

**Public API**
- [ ] REST API per CRUD operations
- [ ] API keys management
- [ ] Rate limiting
- [ ] API documentation (Swagger)

**Webhooks**
- [ ] Trigger webhook su eventi (task.created, etc.)
- [ ] Webhook management UI
- [ ] Retry logic

---

## Technical Features (Cross-cutting)

### Performance
- [x] Server-side rendering (RSC)
- [x] Server Actions per mutations
- [x] Database connection pooling
- [x] Indexed queries
- [ ] Redis cache (futuro per heavy queries)
- [x] Image optimization (quando aggiungiamo uploads)
- [x] Code splitting
- [x] Lazy loading components

### Security
- [x] Better Auth con RBAC
- [x] CSRF protection
- [x] XSS prevention (React auto-escape)
- [x] SQL injection prevention (Drizzle parametrized queries)
- [x] Rate limiting (Better Auth built-in)
- [ ] Content Security Policy headers
- [ ] Audit log per security events

### Monitoring (Futuro)
- [ ] Error tracking (Sentry)
- [ ] Performance monitoring (Vercel Analytics alternative)
- [ ] Database query monitoring
- [ ] User analytics (privacy-friendly)

### Accessibility
- [x] Keyboard navigation (Cmd+K, Tab, Arrow keys)
- [x] ARIA labels
- [x] Focus management
- [ ] Screen reader support test
- [x] Color contrast (WCAG AA)
- [ ] Reduced motion preference

### Mobile
- [x] Responsive design
- [ ] PWA (install prompt)
- [ ] Offline mode (service worker)
- [ ] Mobile gestures (swipe to delete, etc.)
- [ ] Touch-friendly targets (min 44px)

---

## Feature Flags

Per abilitare feature gradualmente:

```typescript
// lib/features.ts
export const FEATURES = {
  TASKS: true,
  EVENTS: true,
  NOTES: true,
  PROJECTS: true,
  COLLECTIONS: false, // Phase 2
  ACTIVITY_LOG: false, // Phase 3
  SHARING: false, // Phase 4
  AI_ASSISTANT: false, // Phase 5
  FILE_UPLOADS: false, // Phase 6
} as const;
```

Usare in componenti:

```typescript
import { FEATURES } from '@/lib/features';

{FEATURES.COLLECTIONS && <CollectionsMenu />}
```
