# Plannerinator - Feature Enhancements & Ideas

Lista completa di possibili miglioramenti e integrazioni per Plannerinator, organizzata per priorità.

> **📋 Per roadmap ufficiale, vedi [ROADMAP.md](./ROADMAP.md)**
> **📖 Per feature correnti, vedi [FEATURES.md](./FEATURES.md)**

**Legenda:**

- 🟡 **Priorità IMPORTANTE** - Feature desiderabili da implementare nei prossimi 1-2 mesi
- 🟢 **Priorità NICE TO HAVE** - Feature utili ma non essenziali, da considerare in futuro (3+ mesi)

---

## Table of Contents

- [Task Management](#task-management)
- [Event Management](#event-management)
- [Note Management](#note-management)
- [Project Management](#project-management)
- [Universal Features](#universal-features)
- [Dashboard & Navigation](#dashboard--navigation)
- [Productivity Features](#productivity-features)
- [Data Management](#data-management)
- [Views & Visualizations](#views--visualizations)
- [Mobile & Accessibility](#mobile--accessibility)

---

## Task Management

### 🟡 Priorità Importante

#### Duplicate Task

**Descrizione:** Clona una task esistente con tutti i suoi dati
**Use Case:** Ricreare task simili senza riscrivere tutto
**Implementazione:**

- Duplicate button in task detail page
- Copy: title, description, priority, project, tags
- Reset: status (todo), dates, completedAt
- Optional: duplicate subtasks

#### Archive Task

**Descrizione:** Soft delete con possibilità di ripristino
**Use Case:** Rimuovere task completati dalla vista senza perdere dati
**Implementazione:**

- Add `archivedAt` field to schema
- Archive action (set archivedAt = now)
- Exclude archived tasks from default queries
- Archive view page to browse/restore

#### Recurring Tasks

**Descrizione:** Task che si ripetono automaticamente
**Use Case:** Task periodici (daily standup, weekly review, monthly report)
**Implementazione:**

- Add recurrence pattern: daily, weekly, monthly, custom
- On complete, create next instance based on pattern
- Store series ID per linkare task ricorrenti
- Option: complete all, complete single, skip next

#### Task Templates

**Descrizione:** Salva task come template riutilizzabili
**Use Case:** Onboarding checklist, project setup, review process
**Implementazione:**

- Save task as template (store in separate table)
- Template gallery with categories
- Create from template (copy all fields + subtasks)
- Share templates (when multi-user)

#### Drag & Drop Ordering

**Descrizione:** Riordino manuale task con position field
**Use Case:** Prioritizzazione visuale, "do this next"
**Implementazione:**

- Use existing `position` field in schema
- Drag & drop con @dnd-kit
- Update position on drop
- Sort by position in queries

#### Time Tracking

**Descrizione:** Traccia tempo effettivo speso su task
**Use Case:** Timesheet, fatturazione, time management
**Implementazione:**

- Start/stop timer button
- Store time entries (task_id, start, end, duration)
- Total time per task
- Time reports (per project, per day)

#### Estimated Time vs Actual

**Descrizione:** Campo stima tempo + confronto con effettivo
**Use Case:** Migliorare stime, identificare task complessi
**Implementazione:**

- Add `estimatedMinutes` field
- Show estimated vs actual in UI
- Accuracy metrics (% difference)
- Historical data per improve estimates

#### Subtask Progress Indicator

**Descrizione:** Mostra progresso subtasks nella task parent
**Use Case:** "3/5 subtasks completate", progress bar
**Implementazione:**

- Count subtasks by status in parent query
- Progress badge/bar in task card
- Completion percentage
- Auto-complete parent quando tutte le subtasks sono done

### 🟢 Nice to Have

#### Custom Fields

**Descrizione:** Campi personalizzati per task
**Use Case:** Story points, sprint, client, custom metadata
**Implementazione:**

- Use `metadata` JSONB field in schema
- Dynamic form builder for custom fields
- Filter/sort by custom fields
- Field templates per project

#### Reminders

**Descrizione:** Notifiche email/push per task
**Use Case:** "Reminder 1 ora prima del due date"
**Implementazione:**

- Add reminders array to task
- Background job controlla reminders (Cloudflare Workers Cron)
- Email via Resend / Push via Web Push API
- Snooze option

#### Attachments

**Descrizione:** Carica file allegati a task
**Use Case:** Screenshot bug, design mockup, document
**Implementazione:**

- Use existing attachments schema (commentato)
- Upload to Cloudflare R2
- Preview per images/PDFs
- Storage limits per user

#### Batch Edit

**Descrizione:** Modifica multipla campi oltre a status/priority
**Use Case:** Change project, add tag, set due date per 10 tasks
**Implementazione:**

- Extend bulk operations
- Multi-field editor dialog
- Preview changes before apply
- Undo bulk edit

---

## Event Management

### 🟡 Priorità Importante

#### Duplicate Event

**Descrizione:** Clona evento esistente
**Use Case:** Creare eventi simili (weekly meeting setup)
**Implementazione:**

- Duplicate button in event detail
- Copy all fields except dates
- Adjust dates interactively

#### Bulk Operations

**Descrizione:** Delete/update multipli eventi
**Use Case:** Cancellare tutti i meeting di un progetto
**Implementazione:**

- Checkbox selection in event list
- Bulk delete, bulk update calendar type
- Bulk move to project

#### Recurring Events

**Descrizione:** Eventi ripetuti automaticamente
**Use Case:** Weekly team meeting, monthly review
**Implementazione:**

- Recurrence pattern: daily, weekly, monthly
- RRULE standard (iCal)
- Edit single/all instances
- Exception dates (skip specific occurrences)

#### Event Templates

**Descrizione:** Template per meeting ricorrenti
**Use Case:** 1:1 template, standup template, demo template
**Implementazione:**

- Save event as template
- Include description, duration, location
- Quick create from template

#### Reminders

**Descrizione:** Notifiche pre-evento
**Use Case:** "Meeting in 15 minutes"
**Implementazione:**

- Default reminders: 15min, 1h, 1day before
- Custom reminder times
- Email + browser notification
- Snooze reminder

#### Time Zone Support

**Descrizione:** Gestione fusi orari
**Use Case:** Meeting con team internazionale
**Implementazione:**

- Store timezone with event
- Display in user's local timezone
- Timezone converter in form
- "Meeting starts at 3pm PST (midnight your time)"

### 🟢 Nice to Have

#### Attendees/Participants

**Descrizione:** Lista partecipanti evento
**Use Case:** Chi partecipa al meeting (when multi-user)
**Implementazione:**

- attendees array (user IDs)
- Invite via email
- RSVP status (accepted, tentative, declined)
- Show attendee avatars

#### Video Call Links

**Descrizione:** Zoom/Google Meet link prominenti
**Use Case:** Quick join meeting
**Implementazione:**

- Video URL field (separate from location)
- "Join call" button con icon
- Auto-generate Zoom/Meet links (API integration)
- Show time until meeting starts

#### iCal Export/Import

**Descrizione:** Esporta .ics file
**Use Case:** Importare in altri calendari
**Implementazione:**

- Export single event as .ics
- Export all events as .ics
- Import .ics file (parse e create events)
- Download .ics button

#### Calendar Sync

**Descrizione:** Sync con Google Calendar / Outlook
**Use Case:** Mantenersi allineati con calendar principale
**Implementazione:**

- OAuth per Google/Microsoft
- Bidirectional sync (read + write)
- Conflict resolution
- Sync settings (which calendars to sync)

---

## Note Management

### 🟡 Priorità Importante

#### Duplicate Note

**Descrizione:** Clona nota esistente
**Use Case:** Template note, starting point
**Implementazione:**

- Duplicate button in note detail
- Copy title, content, type, tags
- Suffix " (Copy)" to title

#### Note Templates

**Descrizione:** Template riutilizzabili
**Use Case:** Meeting notes, daily log, bug report template
**Implementazione:**

- Save note as template
- Template gallery
- Variables: {{date}}, {{project}}, {{user}}
- Create from template

#### Rich Text Editor

**Descrizione:** Toolbar con formattazione
**Use Case:** Bold, italic, lists senza conoscere markdown
**Implementazione:**

- WYSIWYG toolbar (TipTap or Lexical)
- Still save as markdown behind the scenes
- Markdown shortcuts (Ctrl+B, etc)
- Image paste support

#### Autosave

**Descrizione:** Salvataggio automatico mentre scrivi
**Use Case:** Non perdere modifiche
**Implementazione:**

- Debounced autosave (3 secondi)
- "Saving..." indicator
- Last saved timestamp
- Conflict detection se multi-device

#### Version History

**Descrizione:** Cronologia modifiche con restore
**Use Case:** Ripristinare versione precedente, vedere chi ha modificato cosa
**Implementazione:**

- Store snapshots on update (note_versions table)
- Limit: last 20 versions
- Diff view (show changes)
- Restore to version

#### Backlinks

**Descrizione:** Mostra note che linkano a questa
**Use Case:** Bidirectional linking (Roam/Obsidian style)
**Implementazione:**

- Scan note content for [[Note Name]] syntax
- Store in links table
- Backlinks section in note detail
- Auto-create link on [[name]] save

#### Table of Contents

**Descrizione:** TOC auto-generato da headers
**Use Case:** Navigazione in note lunghe
**Implementazione:**

- Parse markdown headers (H1-H6)
- Generate TOC sidebar
- Anchor links to scroll to section
- Collapsible TOC

### 🟢 Nice to Have

#### Graph View

**Descrizione:** Visualizza connessioni tra note
**Use Case:** Knowledge graph, see related notes
**Implementazione:**

- Use links data
- D3.js or Cytoscape.js for graph
- Node = note, edge = link
- Click node to navigate
- Filter by tag

#### LaTeX Support

**Descrizione:** Formule matematiche
**Use Case:** Note tecniche, equazioni
**Implementazione:**

- KaTeX or MathJax rendering
- Inline: $e=mc^2$ syntax
- Block: $$...$$ syntax
- Math toolbar shortcuts

#### Mermaid Diagrams

**Descrizione:** Diagrammi embedded
**Use Case:** Flowchart, sequence diagrams
**Implementazione:**

- Mermaid.js rendering
- ```mermaid code blocks

  ```
- Preview in markdown preview
- Diagram editor UI (optional)

#### Wikilinks

**Descrizione:** `[[Note Name]]` auto-linking
**Use Case:** Quick linking between notes
**Implementazione:**

- Parse [[...]] syntax
- Autocomplete note names
- Create new note if doesn't exist
- Convert to proper link on save

#### Daily Notes

**Descrizione:** Nota automatica per ogni giorno
**Use Case:** Daily journal, log
**Implementazione:**

- Auto-create note for today on first access
- Template for daily note
- Quick nav: previous/next day
- Calendar picker to jump to date

---

## Project Management

### 🟡 Priorità Importante

#### Duplicate Project

**Descrizione:** Clona progetto con/senza task
**Use Case:** Template project per client
**Implementazione:**

- Duplicate project dialog
- Options: with tasks, with events, with notes
- Reset dates and status
- Deep copy including subtasks

#### Project Templates

**Descrizione:** Template progetti con structure
**Use Case:** "New website project", "Client onboarding"
**Implementazione:**

- Save project as template (include structure)
- Template gallery
- Create from template (copy project + related entities)
- Template variables (client name, etc)

#### Bulk Operations

**Descrizione:** Archive/complete/delete multipli
**Use Case:** Cleanup old projects
**Implementazione:**

- Checkbox selection in project list
- Bulk archive, bulk complete, bulk delete
- Warning per cascade delete

#### Archive View

**Descrizione:** Pagina separata per progetti archiviati
**Use Case:** Browse old projects senza clutterare main view
**Implementazione:**

- Archived Projects page
- Default exclude archived from main list
- Filter to show archived
- Restore from archive action

#### Milestones

**Descrizione:** Tappe intermedie con date
**Use Case:** "Alpha release", "Beta launch", "Go live"
**Implementazione:**

- milestones table (project_id, name, date, status)
- Milestone timeline in project detail
- Link tasks to milestone
- Progress per milestone

#### Budget Tracking

**Descrizione:** Budget pianificato vs speso
**Use Case:** Project profitability, client billing
**Implementazione:**

- Budget field (amount + currency)
- Expenses tracking (expense entries)
- Budget vs actual chart
- Budget alerts (80%, 100% threshold)

#### Time Tracking Aggregation

**Descrizione:** Somma tempo di tutte le task
**Use Case:** Total time spent on project
**Implementazione:**

- Aggregate time entries from all project tasks
- Time breakdown by user (when multi-user)
- Time vs budget comparison
- Billable hours tracking

### 🟢 Nice to Have

#### Gantt Chart / Timeline

**Descrizione:** Visualizza timeline progetti + task
**Use Case:** Project planning, dependencies
**Implementazione:**

- Gantt chart con react-gantt-chart
- Show project + tasks timeline
- Drag to adjust dates
- Dependencies visualization (requires task dependencies)

#### Project Health

**Descrizione:** Indicatori: on track / at risk / behind
**Use Case:** Quick status overview
**Implementazione:**

- Calculate health based on:
  - Tasks overdue %
  - Time vs budget
  - End date proximity
- Color coded health badge
- Health trend chart

#### Burndown Chart

**Descrizione:** Grafico progressione task
**Use Case:** Sprint/project tracking
**Implementazione:**

- Chart.js line graph
- X-axis: time, Y-axis: tasks remaining
- Ideal line vs actual line
- Show scope changes

#### Velocity Tracking

**Descrizione:** Task completate per settimana
**Use Case:** Sprint planning, capacity estimation
**Implementazione:**

- Count tasks done per week
- Average velocity calculation
- Velocity trend chart
- Forecast completion date

#### PDF Reports

**Descrizione:** Export report progetto
**Use Case:** Client reporting, stakeholder updates
**Implementazione:**

- Generate PDF with project stats
- Include: overview, progress, tasks, timeline
- Use Puppeteer or react-pdf
- Customizable template

---

## Universal Features

### Tags System

#### 🟡 Priorità Importante

**Tag Manager Page**

- CRUD completo tags con usage stats
- Edit tag (name, color) con bulk update entities
- Delete tag con reassignment prompt
- Tag usage analytics (most used, unused)

**Tag Merge**

- Merge duplicate tags
- Combine usage counts
- Update all entities using merged tags
- Undo merge option

**Tag Rename with Auto-Update**

- Rename tag globally
- Auto-update all entities
- Preserve tag statistics
- Audit log of rename

#### 🟢 Nice to Have

**Tag Hierarchies**

- Parent/child tags (e.g., #work > #work/clients)
- Breadcrumb display in tag badge
- Filter by tag hierarchy (include children)
- Collapse/expand tag tree

**Tag Analytics Dashboard**

- Most used tags
- Tag usage over time
- Tag combinations (often used together)
- Tag cloud visualization

**Smart Tag Suggestions**

- AI suggests tags based on content
- Learn from user's tagging patterns
- "People also tagged with: ..."
- Auto-tag option

### Comments System

#### 🟡 Priorità Importante

**Rich Text Comments**

- Markdown in comments
- Bold, italic, lists, code
- Preview before post
- Edit preserves formatting

**Edit History**

- Show "edited" badge
- View edit history
- Restore previous version
- Diff view

#### 🟢 Nice to Have

**Mentions**

- @username syntax (when multi-user)
- Autocomplete users
- Notification on mention
- Highlight mentions

**Reactions**

- Like button (👍)
- Emoji reactions (😄 ❤️ 🎉)
- Reaction count
- Who reacted

**Notifications**

- Notify on new comment
- Notify on reply to your comment
- Email digest option
- Mark as read/unread

**Sort Comments**

- Newest first / Oldest first
- Most upvoted (if reactions)
- Toggle sort order
- Persist preference

**Resolve Threads**

- Mark discussion as resolved
- Show resolved badge
- Filter: all / unresolved / resolved
- Reopen resolved thread

### Links System

#### 🟡 Priorità Importante

**Entity Autocomplete**

- Dropdown con search quando crei link
- Fuzzy search
- Show entity type icon + metadata
- Recent entities shortcut

**Link to External URLs**

- External link type
- Store URL + title
- Preview (OpenGraph)
- Link validation (check if URL exists)

**Quick Link Panel**

- Widget per aggiungere link velocemente
- Recent entities for quick linking
- Suggested links based on context
- Keyboard shortcut (Cmd+L)

**Broken Link Detection**

- Detect when target entity deleted
- Show broken link icon
- Cleanup broken links tool
- Notification when link breaks

#### 🟢 Nice to Have

**Graph Visualization**

- Network graph of all links
- Node = entity, edge = link
- Color by entity type
- Cluster by project

**Smart Link Suggestions**

- Suggest links based on:
  - Similar tags
  - Same project
  - Content similarity (AI)
- "You might want to link to..."

**Link Strength**

- Weight links (strong/medium/weak)
- Frequency of access
- Manual importance rating
- Use in graph visualization

**Backlinks Count**

- Show "5 items link to this" badge
- Quick preview of backlinks
- Navigate to linking entities
- Backlinks section

### Global Search

#### 🟡 Priorità Importante

**Entity Type Filters**

- Checkboxes in Cmd+K: Tasks / Events / Notes / Projects
- Show/hide specific entity types
- Remember filter preference
- Keyboard shortcut per entity type

**Recent Searches**

- History of recent searches
- Click to re-run search
- Clear history option
- Persist across sessions

**Search in Specific Fields**

- Search only in title
- Search only in content/description
- Field-specific syntax: title:keyword
- Advanced search builder

**Result Preview**

- Show content snippet in results
- Highlight matching text
- Truncate long content
- Click to expand preview

#### 🟢 Nice to Have

**Saved Searches**

- Save frequent searches
- Name saved search
- Quick access to saved searches
- Share saved searches (when multi-user)

**Search Shortcuts**

- `t:keyword` for tasks only
- `e:keyword` for events only
- `n:keyword` for notes only
- `p:keyword` for projects only
- `tag:tagname` for tag filter

**Advanced Filters**

- Date range picker
- Status filter (in search)
- Priority filter (in search)
- Combined filters (AND/OR)

**Fuzzy Search**

- Tolleranza errori di battitura
- Levenshtein distance
- "Did you mean...?" suggestions
- Phonetic matching

---

## Dashboard & Navigation

### 🟡 Priorità Importante

#### Customizable Widgets

**Descrizione:** Drag & drop dashboard widgets
**Use Case:** Personalizza homepage
**Implementazione:**

- Widget library (Today, Upcoming, Stats, Recent, etc)
- Drag & drop con react-grid-layout
- Resize widgets
- Save layout per user

#### Quick Add FAB

**Descrizione:** Floating Action Button per add veloce
**Use Case:** Create task/event/note da ovunque
**Implementazione:**

- FAB bottom-right corner
- Radial menu (Task / Event / Note / Project)
- Keyboard shortcut (Cmd+Shift+N)
- Quick form modal

#### Recently Viewed

**Descrizione:** Ultimi 10 item visitati
**Use Case:** Quick return to recent work
**Implementazione:**

- Track view history (localStorage or DB)
- Recent items widget in dashboard
- Recent section in Cmd+K
- Clear history option

#### Workspaces/Contexts

**Descrizione:** Cambia contesto (Work/Personal/etc)
**Use Case:** Separate work e life
**Implementazione:**

- Workspace selector in nav
- Filter all data by workspace
- Default workspace per entity
- Switch workspace with keyboard shortcut

### 🟢 Nice to Have

#### Command Bar Actions

**Descrizione:** Azioni rapide in Cmd+K
**Use Case:** Quick complete task, archive project, etc
**Implementazione:**

- Action palette (oltre a search)
- Type action name: "Complete task", "Archive project"
- Keyboard shortcuts for actions
- Recent actions

#### Keyboard Shortcuts Page

**Descrizione:** Lista completa shortcut
**Use Case:** Discoverability
**Implementazione:**

- Keyboard shortcuts overlay (? key)
- Categorized by feature
- Search shortcuts
- Customizable shortcuts (advanced)

#### Custom Sidebar

**Descrizione:** Riordina/nascondi voci menu
**Use Case:** Prioritize frequently used pages
**Implementazione:**

- Drag & drop sidebar items
- Show/hide menu items
- Favorites section
- Reset to default

#### Breadcrumbs

**Descrizione:** Navigation trail
**Use Case:** Know where you are, navigate up
**Implementazione:**

- Show: Project > Task > Subtask
- Clickable breadcrumb links
- Truncate long names
- Collapse middle items if too long

---

## Productivity Features

### 🟡 Priorità Importante

#### Notifications Center

**Descrizione:** Centro notifiche app
**Use Case:** Overdue tasks, upcoming events, mentions
**Implementazione:**

- Notification bell icon (with count)
- Notification dropdown
- Types: overdue, due soon, mention, comment
- Mark as read / clear all

#### Daily Digest Email

**Descrizione:** Email mattutina con agenda
**Use Case:** Start day with clear picture
**Implementazione:**

- Email scheduled 8am user's timezone
- Include: tasks due today, events today, overdue tasks
- Nice HTML template
- Unsubscribe option

#### Due Soon Warnings

**Descrizione:** Badge su task che scadono presto
**Use Case:** Prevent last-minute rush
**Implementazione:**

- Yellow badge: due in 1-2 days
- Orange badge: due tomorrow
- Red badge: due today
- Configurable thresholds

### 🟢 Nice to Have

#### Pomodoro Timer

**Descrizione:** Timer integrato con task tracking
**Use Case:** Timeboxing, focus time
**Implementazione:**

- Timer widget (25min work, 5min break)
- Link to current task
- Auto-track time in time entries
- Sound notification

#### Focus Mode

**Descrizione:** Nascondi distrazioni
**Use Case:** Deep work on single task
**Implementazione:**

- Full-screen task view
- Hide sidebar, nav
- Show only current task + timer
- ESC to exit

#### Time Blocking

**Descrizione:** Assegna time slots a task nel calendario
**Use Case:** Schedule quando lavorare su cosa
**Implementazione:**

- Drag task to calendar to create time block
- Time block = special event type
- Link to task
- Mark task as "scheduled"

#### Habit Tracker

**Descrizione:** Track abitudini quotidiane
**Use Case:** Workout, meditation, reading
**Implementazione:**

- Habit definition (name, frequency, goal)
- Daily check-in (did it / skipped)
- Streak tracking
- Habit heatmap calendar

#### Daily Journal

**Descrizione:** Nota giornaliera automatica
**Use Case:** End of day reflection
**Implementazione:**

- Auto-create daily note
- Template: "What I did", "Wins", "Learnings"
- Link to tasks completed today
- Calendar view of past journals

---

## Data Management

### 🟡 Priorità Importante

#### Export All Data

**Descrizione:** JSON completo di tutto
**Use Case:** Backup, migrate to altro sistema
**Implementazione:**

- Export button in settings
- Generate full JSON dump
- Include all entities + relations
- Download as .json file

#### Import Data

**Descrizione:** Restore da backup JSON
**Use Case:** Restore dopo disaster, migrate
**Implementazione:**

- Upload JSON file
- Validate structure
- Preview import (what will be created)
- Import with conflict resolution

#### Manual Backup

**Descrizione:** Download snapshot
**Use Case:** Before major changes
**Implementazione:**

- Backup button in settings
- Generate timestamped backup file
- Include all data
- One-click download

#### CSV Export

**Descrizione:** Export per entity type
**Use Case:** Excel reports, data analysis
**Implementazione:**

- Export tasks to CSV
- Export events to CSV
- Export projects to CSV
- Configurable columns

#### Markdown Export

**Descrizione:** Export note in .md
**Use Case:** Use notes in other tools (Obsidian, etc)
**Implementazione:**

- Export single note as .md
- Export all notes as .zip of .md files
- Preserve frontmatter (metadata)
- Convert internal links

### 🟢 Nice to Have

#### Automatic Backups

**Descrizione:** Daily backup automatico
**Use Case:** Disaster recovery
**Implementazione:**

- Cloudflare Workers cron job
- Daily backup to R2 storage
- Retention: 30 days
- Restore from backup UI

#### Trash/Recycle Bin

**Descrizione:** Soft delete con restore (30 giorni)
**Use Case:** Undo accidental delete
**Implementazione:**

- Add `deletedAt` field
- Trash page to browse deleted items
- Restore button
- Auto-purge after 30 days
- Empty trash action

#### Data Retention Policies

**Descrizione:** Auto-delete dopo X giorni
**Use Case:** Cleanup old data automatically
**Implementazione:**

- Policy settings per entity type
- "Delete completed tasks after 90 days"
- Dry run preview
- Exclude starred/favorites

#### Archive Old Projects

**Descrizione:** Auto-archive progetti vecchi
**Use Case:** Keep active list clean
**Implementazione:**

- Policy: "Archive completed projects after 6 months"
- Email notification before auto-archive
- Undo auto-archive
- Archive log

#### GDPR Export

**Descrizione:** Export dati personali completo
**Use Case:** Compliance GDPR
**Implementazione:**

- Include user data + all related entities
- Machine-readable format (JSON)
- Human-readable format (PDF)
- Automated on request

---

## Views & Visualizations

### 🟡 Priorità Importante

#### List View Improvements

**Descrizione:** Compact/comfortable/spacious modes
**Use Case:** Show more or less info
**Implementazione:**

- View density toggle (compact / default / comfortable)
- Compact: single line per item
- Comfortable: more padding, larger text
- Remember preference

#### Grid View

**Descrizione:** Card grid per Projects/Notes
**Use Case:** Visual browsing
**Implementazione:**

- Grid layout with cards
- Responsive columns (1-4 based on screen)
- Card preview (image, icon, color)
- Toggle list/grid

#### Sort Options

**Descrizione:** Sort by su tutte le liste
**Use Case:** Different sorting needs
**Implementazione:**

- Sort dropdown: name, date, priority, status
- Ascending / descending
- Multi-level sort (primary + secondary)
- Remember sort preference

#### View Presets

**Descrizione:** Salva combinazioni filter+sort
**Use Case:** Quick switch tra viste comuni
**Implementazione:**

- Save current filters + sort as preset
- Name preset ("Urgent tasks", "This week")
- Quick switch dropdown
- Edit/delete presets

### 🟢 Nice to Have

#### Timeline View

**Descrizione:** Vista temporale cross-entity
**Use Case:** See tasks + events in timeline
**Implementazione:**

- Horizontal timeline
- Show tasks (by due date) + events (by start time)
- Color by entity type
- Zoom (day/week/month)

#### Matrix View

**Descrizione:** Eisenhower matrix (urgent/important)
**Use Case:** Prioritization
**Implementazione:**

- 2x2 grid: urgent+important, urgent, important, neither
- Drag tasks between quadrants
- Auto-update priority field
- Matrix for tasks only

#### Mind Map

**Descrizione:** Visualizza progetti/note come mind map
**Use Case:** Brainstorming, visual planning
**Implementazione:**

- Mind map con react-flow
- Center: project, nodes: tasks/notes
- Drag to arrange
- Edit inline

---

## Mobile & Accessibility

### 🟡 Priorità Importante

#### Touch-Friendly Targets

**Descrizione:** Min 44px per mobile
**Use Case:** Easy tap on mobile
**Implementazione:**

- Audit all buttons (min 44px)
- Increase padding on mobile
- Larger touch zones for actions
- Mobile-optimized dropdowns

#### Swipe Actions

**Descrizione:** Swipe per complete/delete/archive
**Use Case:** Quick actions on mobile
**Implementazione:**

- Swipe right: complete (tasks)
- Swipe left: delete
- Visual feedback (background color reveal)
- Undo toast

#### Pull to Refresh

**Descrizione:** Refresh liste
**Use Case:** Update data on mobile
**Implementazione:**

- Pull down gesture
- Loading spinner
- Refresh data
- Haptic feedback

### 🟢 Nice to Have

#### PWA Improvements

**Descrizione:** Install prompt, offline mode
**Use Case:** App-like experience
**Implementazione:**

- Install prompt (add to home screen)
- Service worker for offline
- Offline data cache (IndexedDB)
- Sync when back online

#### Mobile Navigation

**Descrizione:** Bottom nav bar
**Use Case:** Thumb-friendly navigation
**Implementazione:**

- Bottom nav on mobile (5 tabs max)
- Icons + labels
- Active state
- Swipe between pages

#### Screen Reader Testing

**Descrizione:** Test completo con NVDA/JAWS
**Use Case:** Accessibility for blind users
**Implementazione:**

- Audit with screen reader
- Fix announced labels
- Proper heading hierarchy
- Skip links

#### Reduced Motion

**Descrizione:** Respect prefers-reduced-motion
**Use Case:** Accessibility for motion sensitivity
**Implementazione:**

- Detect @media (prefers-reduced-motion)
- Disable animations if set
- Instant transitions
- No parallax effects

---

## Riepilogo per Priorità

### 🟡 IMPORTANTE (1-2 mesi)

**Top 10 Most Impactful:**

1. Duplicate functions (Task/Event/Note/Project)
2. Recurring tasks + recurring events
3. Templates (Task/Event/Note/Project)
4. Tag Manager page + merge + rename
5. Rich text editor per note
6. Autosave per note
7. Archive task (soft delete)
8. Notifications center
9. Customizable dashboard widgets
10. CSV/JSON/Markdown export

### 🟢 NICE TO HAVE (3+ mesi)

**High Value:**

- Time tracking system
- Gantt charts / timeline visualization
- Pomodoro timer + focus mode
- Habit tracker
- Graph view per notes
- Trash/recycle bin (30-day recovery)

**Low Priority but Interesting:**

- AI features (smart suggestions, auto-categorization)
- Advanced collaboration (real-time, presence)
- Calendar sync (Google/Outlook)
- File attachments system
- Custom fields + dynamic forms

---

**Ultimo aggiornamento:** 2025-01-22

**Note:** Questo file è un backlog di idee. Per feature in sviluppo attivo, consulta [ROADMAP.md](./ROADMAP.md)
