# Plannerinator

Sistema completo per la gestione di tutti gli aspetti della vita: task, eventi, note, progetti e collezioni personalizzate.

## Filosofia del Progetto

**Flessibilità totale senza caos**

Plannerinator adotta un approccio **hybrid multi-model**:

- **Entità core rigide** (task, eventi, note) con campi specifici e type-safe
- **Sistema di linking universale** per connettere qualsiasi entità a qualsiasi altra
- **Metadata JSONB** per campi custom senza sacrificare performance
- **Collections dinamiche** per liste personalizzate (libri, servizi, ricerche, etc.)

## Entità Principali

### 1. Tasks

Cose da fare, con o senza scadenza, assegnabili a progetti, collegabili a note/eventi.

**Campi core:**

- Titolo, descrizione
- Data di scadenza (opzionale)
- Durata stimata (opzionale)
- Status (todo, in_progress, done, cancelled)
- Priorità (low, medium, high, urgent)

### 2. Events

Eventi nel tempo, visualizzabili in calendario o lista.

**Campi core:**

- Titolo, descrizione
- Data/ora inizio (obbligatorio)
- Data/ora fine (opzionale)
- Location
- All-day flag

### 3. Notes

Note, documenti, ricerche, knowledge base.

**Campi core:**

- Titolo (opzionale)
- Contenuto (markdown)
- Tipo (note, document, research, idea)

### 4. Projects

Contenitori logici per organizzare task/eventi/note.

**Campi core:**

- Nome, descrizione
- Status (active, archived, completed)
- Date inizio/fine (opzionali)
- Colore

### 5. Collections

Liste personalizzate con schema definibile dall'utente.

**Esempi:**

- Pacchetti servizi freelance (nome, prezzo, descrizione, durata)
- Libri letti (titolo, autore, voto, note)
- Serie TV (titolo, stagioni viste, piattaforma)
- Clienti (nome, email, telefono, progetti associati)

## Sistema di Linking

Qualsiasi entità può essere collegata a qualsiasi altra con una relazione tipizzata:

**Esempi:**

- Task → Project (relationship: "assigned_to")
- Task → Note (relationship: "documented_by")
- Task → Event (relationship: "scheduled_as")
- Task → Task (relationship: "blocks" o "depends_on")
- Note → Collection Item (relationship: "related_to")

## Features Universali

Tutte le entità supportano:

- **Tags** - organizzazione flessibile (#urgent, #work, #personal)
- **Comments** - conversazioni su qualsiasi risorsa
- **Attachments** - file collegati (futuro con R2)
- **Activity log** - storico modifiche
- **Search** - full-text search su tutti i contenuti

## Tech Stack

- **Framework:** Next.js 15 (App Router, Server Components, Server Actions)
- **Database:** PostgreSQL (Neon) + Drizzle ORM
- **UI:** Tailwind CSS + shadcn/ui + Lucide icons
- **Forms:** React Hook Form + Zod validation
- **Auth:** Better Auth con RBAC
- **Deploy:** Cloudflare Workers

## Roadmap

### Phase 0: Foundation ✅

- Database schema
- Better Auth (RBAC, email/password)
- UI infrastructure (Tailwind, shadcn/ui)
- Server Actions & Server Components

### Phase 1: Core Entities ✅

- Tasks (CRUD, subtasks, bulk operations)
- Events (CRUD, calendar types)
- Notes (CRUD, markdown, favorites)
- Projects (CRUD, stats, progress tracking)

### Phase 2: Universal Features ✅

- Tags system (create, autocomplete, usage stats)
- Comments system (nested, edit/delete)
- Links system (8 relationship types)
- Global search (Cmd+K command palette)

### Phase 2.5: UX Improvements ✅

- Calendar view per eventi
- Tag filters (multi-select AND/OR)
- Markdown editor (split view, live preview)
- Dashboard (QuickStats, TodayView)
- Kanban board per task

### Phase 3: Collections & Advanced 🚧 (Current)

- Collections system (schema builder, dynamic forms)
- Activity timeline (auto-tracking, history)
- Data export/import (JSON, CSV, Markdown)
- Advanced search (full-text, ranking)

### Phase 4: Collaboration 📋

- Sharing system (permissions granulari)
- Real-time collaboration
- Comments & mentions avanzati

### Phase 5: AI Assistant 📋

- Chat interface per gestione entità
- Natural language commands
- Smart suggestions
- Semantic search

## Documentazione

### 📋 Planning

- [Roadmap](./planning/ROADMAP.md) - Status attuale e priorità
- [Backlog](./planning/BACKLOG.md) - Feature ideas e enhancement futuri

### 🔧 Technical Reference

- [Database Schema](./technical/DATABASE_SCHEMA.md) - Schema completo con esempi e query
- [Architecture](./technical/ARCHITECTURE.md) - Architettura applicazione e data flow
- [Code Quality & Standards](./technical/CODE_QUALITY.md) - Best practice e convenzioni

### 💡 Development

Per pattern di sviluppo (Server Actions, componenti, validazione), consulta direttamente il codice:

- **Server Actions:** `src/features/*/actions.ts` - Pattern auth, validation, revalidation
- **Schemas:** `src/features/*/schema.ts` - Zod validation con 143 tests
- **Components:** `src/components/*/` - Server Components + Client Components patterns
- **Utilities:** `src/lib/` - Date formatting, labels, auth, permissions

Il codice è auto-documentato con commenti e type safety completo.

### 💭 Future Features

- [AI Assistant](./future/AI_ASSISTANT.md) - Integrazione AI (Phase 5)
- [Sharing System](./future/SHARING.md) - Sistema di condivisione (Phase 4)
