# Plannerinator - Features Documentation

Documentazione tecnica dettagliata di tutte le feature implementate e pianificate.

> **Per roadmap high-level e timeline, vedi [ROADMAP.md](./ROADMAP.md)**

---

## Table of Contents

- [Core Entities](#core-entities)
  - [Task Management](#task-management)
  - [Event Management](#event-management)
  - [Note Management](#note-management)
  - [Project Management](#project-management)
- [Universal Features](#universal-features)
  - [Tagging System](#tagging-system)
  - [Comments System](#comments-system)
  - [Linking System](#linking-system)
  - [Global Search](#global-search)
- [Future Features](#future-features)

---

# Core Entities

## Task Management

### Overview

Sistema completo per gestione task con subtasks, priorità, stati, e collegamenti a progetti.

### Status: ✅ Completato (MVP)

### File Structure

```
src/
├── features/tasks/
│   ├── schema.ts         # Zod validation (34 tests)
│   ├── actions.ts        # Server Actions (~330 LOC)
│   └── queries.ts        # Database queries (~320 LOC)
├── components/tasks/
│   ├── TaskList.tsx      # Lista task con empty state
│   ├── TaskCard.tsx      # Card singola task con actions
│   ├── TaskForm.tsx      # Form create/edit con validation
│   └── TaskFilters.tsx   # Filtri con URL sync
└── app/dashboard/tasks/
    ├── page.tsx          # Lista task
    ├── [id]/page.tsx     # Dettaglio + edit
    └── new/page.tsx      # Creazione
```

### Features Implemented

**Core Fields:**

- ✅ Title (required)
- ✅ Description (optional, rich text)
- ✅ Due date (optional)
- ✅ Start date (optional)
- ✅ Duration in minutes (optional)
- ✅ Status: `todo`, `in_progress`, `done`, `cancelled`
- ✅ Priority: `low`, `medium`, `high`, `urgent` (optional)

**Relationships:**

- ✅ Assign to project (foreign key + JOIN)
- ✅ Subtasks (parent-child relationship via `parentTaskId`)
- ✅ Parent task display

**Actions:**

- ✅ Create task
- ✅ Update task (with auto `completedAt` management)
- ✅ Delete task
- ✅ Mark as complete/incomplete (quick toggle)
- ✅ Bulk operations:
  - Bulk delete
  - Bulk complete
  - Bulk update status
  - Bulk update priority

**Queries:**

- ✅ Get tasks with filters:
  - Status (single or multiple)
  - Priority (single or multiple)
  - Project ID
  - Date range (due date)
  - Search query (title + description full-text)
  - Parent task ID (for subtasks)
- ✅ Get single task with relations (project, subtasks, parent)
- ✅ Get subtasks for task
- ✅ Get tasks by project
- ✅ Get tasks due today
- ✅ Get overdue tasks
- ✅ Search tasks (full-text)

**UI Features:**

- ✅ Task card with:
  - Checkbox per quick completion
  - Status badge con colori
  - Priority badge con colori
  - Project badge con colore custom
  - Due date con overdue detection
  - Actions menu (edit, delete, mark complete)
- ✅ Filters con URL sync:
  - Status filter (multi-select)
  - Priority filter (multi-select)
  - Search input (debounced)
- ✅ Empty states
- ✅ Toast notifications
- ✅ Responsive design (mobile-friendly)
- ✅ Overdue detection con visual highlight

**Database Indexes:**

```typescript
index("task_user_id_idx").on(table.userId);
index("task_project_id_idx").on(table.projectId);
index("task_due_date_idx").on(table.dueDate);
index("task_status_idx").on(table.status);
index("task_parent_task_id_idx").on(table.parentTaskId);
```

### API Reference

**Server Actions:**

```typescript
// Create
createTask(data: CreateTaskInput): Promise<{ id: string }>

// Update (auto-manages completedAt)
updateTask(id: string, data: UpdateTaskInput): Promise<void>

// Delete
deleteTask(id: string): Promise<void>

// Quick actions
markTaskComplete(id: string): Promise<void>
markTaskIncomplete(id: string): Promise<void>

// Bulk operations
bulkTaskOperations(operation: BulkTaskOperation): Promise<void>
// Operations: 'delete' | 'complete' | 'updateStatus' | 'updatePriority'
```

**Queries:**

```typescript
// Get tasks with filters
getTasks(filters?: TaskFilters): Promise<Task[]>
// Filters: status, priority, projectId, dueDateFrom, dueDateTo, search, parentTaskId, limit, offset

// Get single task
getTaskById(id: string): Promise<TaskWithRelations | null>
// Returns: task + project + subtasks + parentTask

// Specialized queries
getTasksByProject(projectId: string): Promise<Task[]>
getTasksDueToday(userId: string): Promise<Task[]>
getOverdueTasks(userId: string): Promise<Task[]>
searchTasks(query: string): Promise<Task[]>
```

### User Stories

- ✅ As a user, I can create a task with title and optional description
- ✅ As a user, I can set a due date and priority for my tasks
- ✅ As a user, I can assign tasks to projects
- ✅ As a user, I can create subtasks under a parent task
- ✅ As a user, I can quickly mark tasks as complete with a checkbox
- ✅ As a user, I can filter tasks by status, priority, and project
- ✅ As a user, I can search tasks by title or description
- ✅ As a user, I can see overdue tasks highlighted in red
- ✅ As a user, I can bulk delete or complete multiple tasks
- ✅ As a user, I can edit and update task details

### Limitations / Known Issues

- ⚠️ No drag & drop ordering yet
- ⚠️ No recurring tasks
- ⚠️ No time tracking
- ⚠️ No task dependencies (blocked by / blocks)
- ⚠️ No assignees (single user app for now)

### Future Enhancements

- 💭 Kanban view (todo/in_progress/done columns)
- 💭 Calendar view (tasks con due date)
- 💭 Timeline view (Gantt-like)
- 💭 Drag & drop ordering
- 💭 Recurring tasks
- 💭 Reminders
- 💭 Time tracking
- 💭 Task dependencies via Links system

---

## Event Management

### Overview

Sistema completo per gestione eventi con calendario, location, e tipi personalizzabili.

### Status: ✅ Completato (MVP)

### File Structure

```
src/
├── features/events/
│   ├── schema.ts         # Zod validation (35 tests)
│   ├── actions.ts        # Server Actions (~320 LOC)
│   └── queries.ts        # Database queries (~310 LOC)
├── components/events/
│   ├── EventList.tsx     # Lista eventi con empty state
│   ├── EventCard.tsx     # Card singola evento
│   ├── EventForm.tsx     # Form create/edit
│   └── EventFilters.tsx  # Filtri con URL sync
└── app/dashboard/events/
    ├── page.tsx          # Lista eventi
    ├── [id]/page.tsx     # Dettaglio + edit
    └── new/page.tsx      # Creazione
```

### Features Implemented

**Core Fields:**

- ✅ Title (required)
- ✅ Description (optional)
- ✅ Start time (required)
- ✅ End time (optional)
- ✅ Location (optional)
- ✅ Location URL (optional, for maps)
- ✅ All day flag (boolean)
- ✅ Calendar type: `personal`, `work`, `family`, `other`

**Relationships:**

- ✅ Assign to project (foreign key + JOIN)

**Actions:**

- ✅ Create event
- ✅ Update event
- ✅ Delete event

**Queries:**

- ✅ Get events with filters:
  - Calendar type (single or multiple)
  - All day filter
  - Date range (start/end time)
  - Project ID
  - Search query (title + description + location)
- ✅ Get single event with relations (project)
- ✅ Get events by date range (for calendar view)
- ✅ Get upcoming events
- ✅ Get events by project
- ✅ Get today's events
- ✅ Search events (full-text)

**UI Features:**

- ✅ Event card with:
  - Calendar type badge con colori
  - Start/end time display
  - Location with optional map link
  - Project badge con colore custom
  - Actions menu (edit, delete)
  - All-day badge
- ✅ Filters con URL sync:
  - Calendar type filter
  - All day toggle
  - Search input (debounced)
- ✅ Empty states
- ✅ Toast notifications
- ✅ Responsive design

**Database Indexes:**

```typescript
index("event_user_id_idx").on(table.userId);
index("event_project_id_idx").on(table.projectId);
index("event_start_time_idx").on(table.startTime);
index("event_calendar_type_idx").on(table.calendarType);
```

### API Reference

**Server Actions:**

```typescript
createEvent(data: CreateEventInput): Promise<{ id: string }>
updateEvent(id: string, data: UpdateEventInput): Promise<void>
deleteEvent(id: string): Promise<void>
```

**Queries:**

```typescript
getEvents(filters?: EventFilters): Promise<Event[]>
getEventById(id: string): Promise<EventWithRelations | null>
getEventsByDateRange(from: Date, to: Date): Promise<Event[]>
getUpcomingEvents(userId: string, limit?: number): Promise<Event[]>
getTodaysEvents(userId: string): Promise<Event[]>
```

### Limitations / Known Issues

- ⚠️ No recurring events
- ⚠️ No reminders
- ⚠️ No attendees
- ⚠️ No calendar sync (Google, Outlook)

### Future Enhancements

- 💭 Calendar view (month/week/day/agenda) con react-big-calendar
- 💭 Recurring events
- 💭 Reminders (email/push)
- 💭 Google Calendar sync (read-only)
- 💭 Export .ics file
- 💭 Attendees/participants

---

## Note Management

### Overview

Sistema completo per gestione note con markdown, tipi, gerarchie, e favorites.

### Status: ✅ Completato (MVP)

### File Structure

```
src/
├── features/notes/
│   ├── schema.ts         # Zod validation (39 tests)
│   ├── actions.ts        # Server Actions (~380 LOC)
│   └── queries.ts        # Database queries (~340 LOC)
├── components/notes/
│   ├── NoteList.tsx      # Lista note con empty state
│   ├── NoteCard.tsx      # Card singola nota
│   ├── NoteForm.tsx      # Form create/edit
│   └── NoteFilters.tsx   # Filtri con URL sync
└── app/dashboard/notes/
    ├── page.tsx          # Lista note
    ├── [id]/page.tsx     # Dettaglio + edit
    └── new/page.tsx      # Creazione
```

### Features Implemented

**Core Fields:**

- ✅ Title (optional - note can have only content)
- ✅ Content (markdown, required if no title)
- ✅ Type: `note`, `document`, `research`, `idea`, `snippet`
- ✅ Is favorite (boolean)

**Relationships:**

- ✅ Assign to project (foreign key + JOIN)
- ✅ Nested notes (parent-child via `parentNoteId`)

**Actions:**

- ✅ Create note
- ✅ Update note
- ✅ Delete note
- ✅ Toggle favorite
- ✅ Bulk operations:
  - Bulk delete
  - Bulk favorite
  - Bulk unfavorite
  - Bulk update type
  - Bulk move to project

**Queries:**

- ✅ Get notes with filters:
  - Type (single or multiple)
  - Is favorite
  - Project ID
  - Parent note ID
  - Search query (title + content full-text)
- ✅ Get single note with relations (project, child notes)
- ✅ Get favorite notes
- ✅ Get recent notes
- ✅ Get notes by project
- ✅ Get child notes (hierarchical)
- ✅ Search notes (full-text)

**UI Features:**

- ✅ Note card with:
  - Type badge
  - Favorite star (toggle)
  - Project badge con colore custom
  - Content preview (truncated)
  - Actions menu (edit, delete, favorite)
- ✅ Filters con URL sync:
  - Type filter
  - Favorites toggle
  - Search input (debounced)
- ✅ Empty states
- ✅ Toast notifications
- ✅ Responsive design
- ✅ Bulk selection and actions

**Database Indexes:**

```typescript
index("note_user_id_idx").on(table.userId);
index("note_project_id_idx").on(table.projectId);
index("note_parent_note_id_idx").on(table.parentNoteId);
index("note_type_idx").on(table.type);
index("note_is_favorite_idx").on(table.isFavorite);
```

### API Reference

**Server Actions:**

```typescript
createNote(data: CreateNoteInput): Promise<{ id: string }>
updateNote(id: string, data: UpdateNoteInput): Promise<void>
deleteNote(id: string): Promise<void>
toggleNoteFavorite(id: string): Promise<void>
bulkNoteOperations(operation: BulkNoteOperation): Promise<void>
```

**Queries:**

```typescript
getNotes(filters?: NoteFilters): Promise<Note[]>
getNoteById(id: string): Promise<NoteWithRelations | null>
getFavoriteNotes(userId: string): Promise<Note[]>
getRecentNotes(userId: string, limit?: number): Promise<Note[]>
getChildNotes(parentNoteId: string): Promise<Note[]>
```

### Limitations / Known Issues

- ⚠️ Basic textarea editor (no markdown preview in edit mode)
- ⚠️ No syntax highlighting per code blocks
- ⚠️ No autosave
- ⚠️ No version history

### Future Enhancements

- 💭 Markdown editor avanzato con toolbar e preview (react-markdown)
- 💭 Syntax highlighting per code blocks
- 💭 Autosave (debounced)
- 💭 Full-text search con PostgreSQL tsvector
- 💭 Graph view (connections)
- 💭 Note templates
- 💭 Version history

---

## Project Management

### Overview

Sistema completo per gestione progetti con stats, progress tracking, e gerarchie.

### Status: ✅ Completato (MVP)

### File Structure

```
src/
├── features/projects/
│   ├── schema.ts         # Zod validation (35 tests)
│   ├── actions.ts        # Server Actions (~340 LOC)
│   └── queries.ts        # Database queries (~420 LOC)
├── components/projects/
│   ├── ProjectList.tsx        # Grid progetti
│   ├── ProjectCard.tsx        # Card singolo progetto
│   ├── ProjectForm.tsx        # Form create/edit con color picker
│   ├── ProjectFilters.tsx     # Filtri
│   └── DeleteProjectButton.tsx # Conferma delete
└── app/dashboard/projects/
    ├── page.tsx               # Lista progetti
    ├── [id]/page.tsx          # Dettaglio con tabs
    └── new/page.tsx           # Creazione
```

### Features Implemented

**Core Fields:**

- ✅ Name (required)
- ✅ Description (optional)
- ✅ Status: `active`, `on_hold`, `completed`, `archived`, `cancelled`
- ✅ Start date (optional)
- ✅ End date (optional)
- ✅ Color (hex color picker)
- ✅ Icon (emoji picker)
- ✅ Metadata (JSONB for custom fields)

**Relationships:**

- ✅ Sub-projects (parent-child via `parentProjectId`)
- ✅ Related tasks (reverse relation)
- ✅ Related events (reverse relation)
- ✅ Related notes (reverse relation)

**Actions:**

- ✅ Create project
- ✅ Update project
- ✅ Delete project (cascade to tasks, events, notes)
- ✅ Archive/unarchive project
- ✅ Complete project (sets status + completedAt)

**Queries:**

- ✅ Get projects with filters:
  - Status (single or multiple)
  - Parent project ID
  - Date range (start/end date)
  - Search query (name + description)
- ✅ Get single project with relations
- ✅ Get project statistics:
  - Task counts by status
  - Completion percentage
  - Upcoming events count
  - Notes count
- ✅ Get subprojects
- ✅ Get active projects (for dropdowns)
- ✅ Get root projects (no parent)
- ✅ Search projects (full-text)

**UI Features:**

- ✅ Project card with:
  - Color border/badge
  - Icon display
  - Status badge con colori
  - Progress bar (% tasks completed)
  - Task breakdown (todo/in_progress/done)
  - Overdue detection (days until end date)
  - Actions menu (edit, archive, complete, delete)
- ✅ Detail page with tabs:
  - Overview (stats, completion %)
  - Tasks tab (filtered by project)
  - Events tab (filtered by project)
  - Notes tab (filtered by project)
- ✅ Filters con URL sync:
  - Status filter
  - Search input
- ✅ Color picker in form
- ✅ Delete confirmation dialog
- ✅ Empty states
- ✅ Toast notifications
- ✅ Responsive design

**Database Indexes:**

```typescript
index("project_user_id_idx").on(table.userId);
index("project_parent_project_id_idx").on(table.parentProjectId);
index("project_status_idx").on(table.status);
```

### API Reference

**Server Actions:**

```typescript
createProject(data: CreateProjectInput): Promise<{ id: string }>
updateProject(id: string, data: UpdateProjectInput): Promise<void>
deleteProject(id: string): Promise<void>
archiveProject(id: string): Promise<void>
unarchiveProject(id: string): Promise<void>
completeProject(id: string): Promise<void>
```

**Queries:**

```typescript
getProjects(filters?: ProjectFilters): Promise<Project[]>
getProjectById(id: string): Promise<ProjectWithRelations | null>
getProjectStats(options: { projectId: string }): Promise<ProjectStats>
getActiveProjects(userId: string): Promise<Project[]>
getRootProjects(userId: string): Promise<Project[]>
```

### Limitations / Known Issues

- ⚠️ No budget tracking
- ⚠️ No time tracking
- ⚠️ No team members (single user)
- ⚠️ No milestones

### Future Enhancements

- 💭 Timeline visualization (Gantt chart)
- 💭 Budget tracking
- 💭 Time tracking
- 💭 Milestones
- 💭 Team members (when multi-user)

---

# Universal Features

## Tagging System

### Overview

Sistema di tagging polimorfico per categorizzare qualsiasi entità.

### Status: ✅ Completato

### File Structure

```
src/
├── features/tags/
│   ├── schema.ts         # Zod validation
│   ├── actions.ts        # Tag CRUD + assignment (~280 LOC)
│   └── queries.ts        # Tag queries (~220 LOC)
└── components/tags/
    ├── TagInput.tsx      # Autocomplete + create inline
    └── TagBadge.tsx      # Display tag con color
```

### Features Implemented

**Core:**

- ✅ Tag creation con nome e colore
- ✅ Duplicate name check
- ✅ Tag colors (customizable hex colors)
- ✅ Polymorphic assignment (via `entity_tags` join table)
- ✅ Tag usage count
- ✅ Popular tags query

**Supported Entities:**

- ✅ Tasks
- ✅ Events
- ✅ Notes
- ✅ Projects

**UI:**

- ✅ TagInput component con:
  - Autocomplete search (debounced)
  - Create tag inline
  - Assign/remove tags
  - Color badges
- ✅ Integration in detail pages

**API:**

```typescript
// Tag management
createTag(data: CreateTagInput): Promise<{ id: string }>
updateTag(id: string, data: UpdateTagInput): Promise<void>
deleteTag(id: string): Promise<void>

// Assignment
assignTagsToEntity(entityType, entityId, tagIds): Promise<void>
removeTagsFromEntity(entityType, entityId, tagIds): Promise<void>

// Queries
getTags(filters?: TagFilters): Promise<Tag[]>
getEntityTags(entityType, entityId): Promise<Tag[]>
getPopularTags(limit?: number): Promise<Tag[]>
searchTags(query: string): Promise<Tag[]>
```

### Future Enhancements

- 💭 Filter by tags (multi-select in list views)
- 💭 Tag analytics dashboard
- 💭 Tag hierarchies (parent tags)
- 💭 Smart tag suggestions (AI)

---

## Comments System

### Overview

Sistema di commenti polimorfico con nested replies.

### Status: ✅ Completato

### File Structure

```
src/
├── features/comments/
│   ├── schema.ts         # Zod validation
│   ├── actions.ts        # Comment CRUD (~250 LOC)
│   └── queries.ts        # Comment queries (~180 LOC)
└── components/comments/
    ├── CommentThread.tsx # Thread view con nested replies
    ├── CommentForm.tsx   # Create/edit form
    └── CommentCard.tsx   # Display single comment
```

### Features Implemented

**Core:**

- ✅ Comment on any entity (polymorphic)
- ✅ Edit/delete own comments (ownership check)
- ✅ Nested comments (replies via `parentCommentId`)
- ✅ Character limit (5000 chars)
- ✅ Pagination support

**Supported Entities:**

- ✅ Tasks
- ✅ Events
- ✅ Notes
- ✅ Projects

**UI:**

- ✅ CommentThread component con:
  - Thread view with nested replies
  - User avatars (Next/Image)
  - Timestamp ("2 hours ago" con date-fns)
  - Edit/delete actions (own comments only)
  - Reply button
  - Empty states
- ✅ Character counter (max 5000)
- ✅ Integration in detail pages

**API:**

```typescript
createComment(data: CreateCommentInput): Promise<{ id: string }>
updateComment(id: string, data: UpdateCommentInput): Promise<void>
deleteComment(id: string): Promise<void> // Cascade to replies

getEntityComments(entityType, entityId, options?): Promise<CommentResponse>
getCommentById(id: string): Promise<Comment | null>
getCommentReplies(parentCommentId: string): Promise<Comment[]>
getCommentCount(entityType, entityId): Promise<number>
```

### Future Enhancements

- 💭 Rich text comments (markdown/WYSIWYG)
- 💭 Mentions (@username, when multi-user)
- 💭 Reactions (like, emoji)
- 💭 Comment notifications

---

## Linking System

### Overview

Sistema di linking bidirezionale tra entità con relationship types.

### Status: ✅ Completato

### File Structure

```
src/
├── features/links/
│   ├── schema.ts         # Zod validation + relationship types
│   ├── actions.ts        # Link CRUD (~220 LOC)
│   └── queries.ts        # Link queries with entity resolution (~280 LOC)
└── components/links/
    ├── EntityLinksSection.tsx # Outgoing/incoming links
    ├── AddLinkDialog.tsx      # Select entity + relationship
    └── LinkCard.tsx           # Display link con entity info
```

### Features Implemented

**Relationship Types:**

1. ✅ `assigned_to` - Task → Project
2. ✅ `documented_by` - Task → Note
3. ✅ `scheduled_as` - Task → Event
4. ✅ `blocks` - Task → Task (dependency)
5. ✅ `depends_on` - Task → Task (reverse dependency)
6. ✅ `related_to` - Generic relationship
7. ✅ `references` - Note → Anything
8. ✅ `inspired_by` - Creative inspiration

**Core:**

- ✅ Link any entity to any other (polymorphic bidirectional)
- ✅ Duplicate link prevention
- ✅ Relationship labels and descriptions
- ✅ Entity resolution (fetch titles/names)

**Supported Entities:**

- ✅ Tasks ↔ Tasks, Events, Projects, Notes
- ✅ Events ↔ Projects, Notes
- ✅ Projects ↔ Projects (sub-projects alternative)
- ✅ Notes ↔ Notes, Tasks, Events, Projects

**UI:**

- ✅ EntityLinksSection con:
  - Outgoing links (this → other)
  - Incoming links (other → this)
  - Relationship badges
  - Entity preview (title/name)
  - Delete button
- ✅ AddLinkDialog con:
  - Entity type selector
  - Entity ID input (autocomplete future)
  - Relationship type selector
  - Link preview before creation
- ✅ Empty states
- ✅ Integration in detail pages

**API:**

```typescript
createLink(data: CreateLinkInput): Promise<{ id: string }>
updateLink(id: string, data: UpdateLinkInput): Promise<void>
deleteLink(id: string): Promise<void>

getEntityLinks(entityType, entityId, direction?): Promise<LinkWithEntities[]>
// direction: 'outgoing' | 'incoming' | 'both'
getLinkById(id: string): Promise<Link | null>
```

### Future Enhancements

- 💭 Smart link suggestions (AI-powered)
- 💭 Graph visualization of links
- 💭 Link strength/weight
- 💭 Auto-link detection (detect references in text)

---

## Global Search

### Overview

Command palette (Cmd+K) per ricerca veloce cross-entity.

### Status: ✅ Completato

### File Structure

```
src/
├── features/search/
│   └── queries.ts        # Global search queries (~370 LOC)
└── components/search/
    └── CommandPalette.tsx # Cmd+K component (~340 LOC)
```

### Features Implemented

**Core:**

- ✅ Command palette con Cmd+K (macOS) / Ctrl+K (Windows)
- ✅ Search across all entities (Tasks, Events, Notes, Projects)
- ✅ Full-text search (title + description/content)
- ✅ Debounced search (300ms)
- ✅ Recent items (quando query vuota)
- ✅ Keyboard navigation (↑↓ Enter Esc)

**UI:**

- ✅ Entity icons (CheckSquare, Calendar, FileText, FolderOpen)
- ✅ Entity type grouping (Tasks, Events, Notes, Projects)
- ✅ Metadata display:
  - Status, priority badges (tasks)
  - Calendar type badge (events)
  - Note type badge (notes)
  - Project status badge (projects)
  - Project badges con colori
  - Dates (due date, start time)
- ✅ Loading state
- ✅ Empty state
- ✅ Keyboard shortcuts legend

**Search Fields:**

- Tasks: title, description
- Events: title, description, location
- Notes: title, content
- Projects: name, description

**API:**

```typescript
globalSearch(query: string, options?: {
  limit?: number;
  entityTypes?: SearchEntityType[];
}): Promise<GroupedSearchResults>

getRecentItems(limit?: number): Promise<GroupedSearchResults>
```

### Limitations

- ⚠️ No advanced filters (entity type, date range)
- ⚠️ No search history
- ⚠️ No saved searches

### Future Enhancements

- 💭 Entity type filters (show only tasks/events/etc)
- 💭 Recent searches history
- 💭 Saved searches
- 💭 Search highlighting
- 💭 Fuzzy search
- 💭 Search shortcuts (e.g., "t:" for tasks only)

---

# Future Features

## Collections System

### Status: ⏳ Pianificato (Phase 2)

Sistema flessibile per liste personalizzate con schema definibile dall'utente.

**Planned Features:**

- Visual schema builder
- Dynamic form generation
- Multiple view types (table, card, list)
- Template collections (books, clients, services, recipes)
- Import/Export CSV
- Custom validation rules

**Use Cases:**

- Freelance services (name, price, duration, tech stack)
- Books library (title, author, rating, genre, notes)
- TV series tracker (title, seasons, platform, status)
- Clients database (name, email, phone, company)
- Recipes collection (name, ingredients, instructions, prep time)

---

## Activity Timeline

### Status: ⏳ Next (Phase 3)

Sistema di tracking automatico di tutte le modifiche.

**Planned Features:**

- Auto-track create/update/delete per tutte le entità
- JSON diff per updates
- Timeline view per user
- Timeline view per entity
- Filter by entity type, date range, action
- Undo system (Cmd+Z)
- Restore deleted entities

---

## Advanced Search

### Status: 💭 Future (Phase 3)

**Planned Features:**

- PostgreSQL full-text search (tsvector)
- Search ranking
- Highlight matches
- Saved searches
- Smart searches ("Tasks due this week")
- Semantic search (AI-powered, embeddings)

---

## Collaboration

### Status: 💭 Future (Phase 4)

Sistema di condivisione e collaborazione multi-user.

**Planned Features:**

- Share entities con altri utenti
- Permission levels (view, comment, edit)
- Expiration dates
- Transfer ownership
- Real-time presence
- Real-time updates
- Team workspaces

---

## AI Assistant

### Status: 💭 Future (Phase 5)

Assistente AI per automazione e insights.

**Planned Features:**

- Chat interface (sidebar)
- Natural language task creation
- Auto-categorization (tags, projects)
- Smart suggestions
- Meeting notes summarization
- Project template generation

---

**Ultimo aggiornamento:** 2025-01-22
