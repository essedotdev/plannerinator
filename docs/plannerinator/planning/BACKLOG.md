# Plannerinator - Backlog

Lista di feature ideas e enhancement non ancora pianificate nella roadmap ufficiale.

> **📋 Per roadmap ufficiale con timeline, vedi [ROADMAP.md](./ROADMAP.md)**

**Legenda:**

- 🔥 **High Priority** - Feature molto richieste, da considerare nei prossimi 3-6 mesi
- ⭐ **Medium Priority** - Feature utili ma non urgenti (6-12 mesi)
- 💭 **Nice to Have** - Idee interessanti ma bassa priorità (12+ mesi)

---

## 🔥 High Priority (3-6 mesi)

### Recurring Items

- **Recurring Tasks** - Task che si ripetono automaticamente (daily, weekly, monthly)
- **Recurring Events** - Eventi ricorrenti con pattern RRULE (iCal standard)

### Duplicate Functions

- **Duplicate Task** - Clona task con tutti i dati
- **Duplicate Event** - Clona evento
- **Duplicate Note** - Clona nota
- **Duplicate Project** - Clona progetto con/senza entità collegate

### Templates

- **Task Templates** - Salva task come template riutilizzabili (onboarding checklist, review process)
- **Event Templates** - Template per meeting ricorrenti (1:1, standup, demo)
- **Note Templates** - Template note con variables ({{date}}, {{project}})
- **Project Templates** - Template progetti completi con structure

### Time Management

- **Time Tracking** - Start/stop timer, time entries per task, timesheet reports
- **Estimated vs Actual Time** - Campo stima + confronto con tempo effettivo
- **Time Blocking** - Assegna time slots a task nel calendario

### Note Enhancements

- **Autosave** - Salvataggio automatico mentre scrivi (debounced 3s)
- **Version History** - Cronologia modifiche con restore (last 20 versions)
- **Backlinks** - Mostra note che linkano a questa (bidirectional linking)
- **Wikilinks** - `[[Note Name]]` auto-linking syntax

### Data Management

- **Trash/Recycle Bin** - Soft delete con restore (30-day recovery)
- **Archive Task** - Soft archive con vista separata
- **Manual Backup** - Download snapshot JSON completo

### Productivity

- **Notifications Center** - Centro notifiche (overdue, due soon, mentions, comments)
- **Daily Digest Email** - Email mattutina con agenda e task del giorno
- **Due Soon Warnings** - Badge colorati per task che scadono presto

### Organization

- **Tag Manager Page** - CRUD completo tags con usage stats e bulk operations
- **Tag Merge/Rename** - Merge duplicate tags, rename con auto-update entities
- **Drag & Drop Ordering** - Riordino manuale task con position field

---

## ⭐ Medium Priority (6-12 mesi)

### Advanced Note Features

- **Graph View** - Network graph delle connessioni tra note (D3.js/Cytoscape)
- **Daily Notes** - Nota automatica per ogni giorno (daily journal)
- **Table of Contents** - TOC auto-generato da headers
- **Rich Text Editor** - WYSIWYG toolbar con markdown shortcuts

### Project Management

- **Milestones** - Tappe intermedie con date per progetti
- **Budget Tracking** - Budget pianificato vs speso
- **Gantt Chart** - Timeline visualization con dependencies
- **Project Health** - Indicatori: on track / at risk / behind
- **Burndown Chart** - Grafico progressione task

### Productivity Tools

- **Pomodoro Timer** - Timer integrato con task tracking
- **Focus Mode** - Full-screen task view, hide distractions
- **Habit Tracker** - Track daily habits con streak tracking
- **Daily Journal** - End of day reflection note

### Comments & Collaboration Prep

- **Rich Text Comments** - Markdown in comments
- **Edit History** - Show "edited" badge, view edit history
- **Mentions** - @username syntax (when multi-user)
- **Reactions** - Like button + emoji reactions
- **Resolve Threads** - Mark discussion as resolved

### Links Enhancements

- **Entity Autocomplete** - Dropdown con search quando crei link
- **Link to External URLs** - External link type con preview
- **Smart Link Suggestions** - Suggest links based on similar tags/content
- **Broken Link Detection** - Detect when target entity deleted

### Views & Visualizations

- **Grid View** - Card grid per Projects/Notes
- **Matrix View** - Eisenhower matrix (urgent/important) per task
- **Timeline View** - Vista temporale cross-entity (tasks + events)
- **View Presets** - Salva combinazioni filter+sort

---

## 💭 Nice to Have (12+ mesi)

### Advanced Content

- **LaTeX Support** - Formule matematiche in note (KaTeX/MathJax)
- **Mermaid Diagrams** - Flowchart, sequence diagrams embedded
- **Mind Map** - Visualizza progetti/note come mind map
- **Syntax Highlighting** - Code blocks con highlighting

### Advanced Project Features

- **Velocity Tracking** - Task completate per settimana, forecast completion
- **PDF Reports** - Export report progetto per client
- **Custom Fields** - Campi personalizzati per task/progetti

### Integrations

- **Calendar Sync** - Google Calendar / Outlook sync (bidirectional)
- **iCal Export/Import** - Esporta .ics file
- **Email to Task** - Forward email → create task
- **Video Call Links** - Quick join Zoom/Meet links in events

### Advanced Organization

- **Tag Hierarchies** - Parent/child tags (#work > #work/clients)
- **Tag Analytics Dashboard** - Most used tags, usage over time, tag cloud
- **Workspaces/Contexts** - Cambia contesto (Work/Personal/etc)
- **Saved Searches** - Save frequent searches

### Mobile & PWA

- **Swipe Actions** - Swipe per complete/delete/archive
- **Pull to Refresh** - Refresh liste
- **Bottom Navigation** - Thumb-friendly navigation
- **Offline Mode** - Service worker + IndexedDB cache

### Data & Automation

- **Automatic Backups** - Daily backup to R2 storage
- **Data Retention Policies** - Auto-delete dopo X giorni
- **Smart Tag Suggestions** - AI suggests tags based on content
- **Reminders** - Email/push notifications per task/eventi

### Accessibility

- **Screen Reader Testing** - Complete NVDA/JAWS testing
- **Reduced Motion** - Respect prefers-reduced-motion
- **Keyboard Shortcuts Page** - Lista completa shortcut con search

---

## 🗂️ Feature Categories

### Per Entity Type

**Tasks:**

- Recurring, Templates, Time Tracking, Reminders, Dependencies, Custom Fields, Attachments

**Events:**

- Recurring, Templates, Time Zone Support, Attendees, Video Links, iCal Export, Calendar Sync

**Notes:**

- Autosave, Version History, Backlinks, Graph View, Daily Notes, LaTeX, Mermaid, Wikilinks

**Projects:**

- Templates, Milestones, Budget, Gantt, Health, Burndown, Velocity, PDF Reports

**Tags:**

- Manager Page, Merge/Rename, Hierarchies, Analytics, Smart Suggestions

**Comments:**

- Rich Text, Mentions, Reactions, Resolve, Edit History

**Links:**

- Autocomplete, External URLs, Smart Suggestions, Graph View, Broken Detection

---

## 📊 Implementation Complexity

### Quick Wins (1-2 giorni)

- Duplicate functions
- Archive task
- Tag Manager page
- Due Soon warnings
- Manual Backup

### Medium (1 settimana)

- Templates system
- Trash/Recycle Bin
- Autosave
- Notifications Center
- Tag filters

### Large (2-4 settimane)

- Recurring Tasks/Events
- Time Tracking system
- Version History
- Backlinks + Graph View
- Gantt Chart
- Pomodoro + Habit Tracker

### Very Large (1-2 mesi)

- Calendar Sync
- Advanced Search (semantic)
- Real-time collaboration
- PWA with offline mode

---

**Ultimo aggiornamento:** 2025-01-22

**Note:** Questo file è un backlog di idee. Per feature in sviluppo attivo, consulta [ROADMAP.md](./ROADMAP.md)
