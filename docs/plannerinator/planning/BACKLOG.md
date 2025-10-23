# Plannerinator - Backlog

Lista completa di feature ideas e enhancement per Plannerinator. Questo file raccoglie tutte le idee future (post-Phase 3) non ancora schedulate nella roadmap.

> **📋 Per feature in sviluppo attivo (Phase 3), vedi [ROADMAP.md](./ROADMAP.md)**
> **📖 Per storico completato, vedi [CHANGELOG.md](../../../CHANGELOG.md)**

**Legenda:**

- 🔥 **High Priority** - Feature molto richieste, candidati per Phase 4 (3-6 mesi)
- ⭐ **Medium Priority** - Feature utili ma non urgenti (6-12 mesi)
- 💭 **Nice to Have** - Idee interessanti ma bassa priorità (12+ mesi)

---

## 🔥 High Priority (Phase 4 - Next)

### Collaboration & Sharing System ⭐⭐⭐

Sistema completo di condivisione entità tra utenti con permessi granulari.

**Core Features:**

- Share entities con altri utenti (tasks, events, notes, projects)
- Permission levels: view, comment, edit
- Share via link (anyone with link)
- Share via email (invite user)
- Expiration dates per shares
- Revoke access
- Transfer ownership
- Real-time presence (chi sta guardando)

**Use Cases:**

- Condividere progetto con team
- Delegare task a collaboratori
- Condividere note per review
- Calendario condiviso per eventi

📖 **Spec tecnica dettagliata:** [SHARING.md](../future/SHARING.md) (799 righe - database schema, API design, security, UI components)

### Recurring Items

**Recurring Tasks:**

- Task che si ripetono automaticamente (daily, weekly, monthly, custom)
- Pattern: ogni X giorni, giorni della settimana, giorno del mese
- End condition: mai, dopo N ripetizioni, entro data
- Edit singola istanza vs serie completa

**Recurring Events:**

- Eventi ricorrenti con pattern RRULE (iCal standard)
- Supporto exceptions (skip date, modifiche)
- Sync con Google Calendar / Outlook

### Duplicate Functions

Clonare entità esistenti per velocizzare creazione:

- **Duplicate Task:** Clona task con tutti i dati (tags, subtasks, links)
- **Duplicate Event:** Clona evento mantenendo configurazione
- **Duplicate Note:** Clona nota con contenuto
- **Duplicate Project:** Clona progetto con/senza entità collegate

### Templates

Salvare entità come template riutilizzabili:

- **Task Templates:** Onboarding checklist, review process, deploy checklist
- **Event Templates:** 1:1 meeting, standup, demo, interview
- **Note Templates:** Meeting notes, project brief, retrospective con variables ({{date}}, {{project}})
- **Project Templates:** Progetti completi con structure pre-definita

### Time Management

Sistema completo di time tracking integrato:

- **Time Tracking:** Start/stop timer su task, time entries, timesheet reports
- **Estimated vs Actual Time:** Campo stima + confronto con tempo effettivo
- **Time Blocking:** Assegna time slots a task nel calendario
- **Weekly time reports:** Visualizza tempo speso per progetto/tag
- **Productivity insights:** Quando sei più produttivo, tempo medio per task type

### Note Enhancements

- **Autosave:** Salvataggio automatico mentre scrivi (debounced 3s)
- **Version History:** Cronologia modifiche con restore (last 20 versions)
- **Backlinks:** Mostra note che linkano a questa (bidirectional linking)
- **Wikilinks:** `[[Note Name]]` auto-linking syntax (Obsidian-style)
- **Note templates con variables:** {{date}}, {{project}}, {{tag}}

### Data Management Enhancements

- **Trash/Recycle Bin:** Soft delete con restore (30-day recovery)
- **Archive Task:** Soft archive con vista separata (declutter lists)
- **Smart filters:** Salva combinazioni filter+sort come preset

### Productivity Tools

- **Notifications Center:** Centro notifiche (overdue, due soon, mentions, comments)
- **Daily Digest Email:** Email mattutina con agenda e task del giorno
- **Due Soon Warnings:** Badge colorati per task che scadono presto (24h, 3d, 1w)
- **Smart reminders:** Notifiche intelligenti basate su abitudini

### Organization

- **Tag Manager Page:** CRUD completo tags con usage stats e bulk operations
- **Tag Merge/Rename:** Merge duplicate tags, rename con auto-update entities
- **Drag & Drop Ordering:** Riordino manuale task con position field
- **Custom views:** Salva viste personalizzate (filters, sort, display mode)

---

## ⭐ Medium Priority (Phase 5 - 6-12 mesi)

### AI Assistant ⭐⭐⭐

Assistente AI conversazionale integrato per gestione veloce e smart suggestions.

**Core Features:**

- Sidebar chat panel (toggle on/off)
- Natural language commands:
  - "Crea task chiamare Mario domani alle 15"
  - "Mostrami i task del progetto X"
  - "Quanti task ho completato questa settimana?"
- Multi-entity creation (task + event da singolo comando)
- Auto-tag suggestions basate su contenuto
- Auto-categorization (project assignment)
- Smart reminders (AI suggests quando lavorare)
- Project template generation
- Meeting notes summarization
- Semantic search (embedding-based)

**LLM Options:**

- OpenAI GPT-4o (raccomandato - function calling maturo)
- Anthropic Claude 3.5 Sonnet (eccellente reasoning)
- Self-hosted Llama 3.1 70B (privacy, zero API costs)

📖 **Spec tecnica dettagliata:** [AI_ASSISTANT.md](../future/AI_ASSISTANT.md) (947 righe - architettura completa, function calling schema, examples, cost management)

### Advanced Note Features

- **Graph View:** Network graph delle connessioni tra note (D3.js/Cytoscape)
- **Daily Notes:** Nota automatica per ogni giorno (daily journal à la Obsidian)
- **Table of Contents:** TOC auto-generato da headers
- **LaTeX Support:** Formule matematiche in note (KaTeX/MathJax)
- **Mermaid Diagrams:** Flowchart, sequence diagrams embedded
- **Mind Map:** Visualizza progetti/note come mind map

### Project Management Enhancements

- **Milestones:** Tappe intermedie con date per progetti
- **Budget Tracking:** Budget pianificato vs speso per progetti
- **Gantt Chart:** Timeline visualization con dependencies
- **Project Health:** Indicatori: on track / at risk / behind
- **Burndown Chart:** Grafico progressione task
- **Velocity Tracking:** Task completate per settimana, forecast completion
- **Custom Fields:** Campi personalizzati per task/progetti
- **Project dependencies:** Progetto A blocca progetto B

### Productivity Enhancements

- **Pomodoro Timer:** Timer integrato con task tracking (25min work, 5min break)
- **Focus Mode:** Full-screen task view, hide distractions
- **Habit Tracker:** Track daily habits con streak tracking
- **Daily Journal:** End of day reflection note
- **Weekly Review:** Template per review settimanale con stats

### Comments & Collaboration Prep

Features per preparare collaborazione multi-user:

- **Rich Text Comments:** Markdown in comments con preview
- **Edit History:** Show "edited" badge, view edit history
- **Mentions:** @username syntax (when multi-user)
- **Reactions:** Like button + emoji reactions su commenti
- **Resolve Threads:** Mark discussion as resolved (per task/issue)

### Links Enhancements

- **Entity Autocomplete:** Dropdown con search quando crei link
- **Link to External URLs:** External link type con preview
- **Smart Link Suggestions:** Suggest links based on similar tags/content
- **Broken Link Detection:** Detect when target entity deleted
- **Link graph view:** Visualizza tutte le connessioni

### Views & Visualizations

- **Grid View:** Card grid per Projects/Notes
- **Matrix View:** Eisenhower matrix (urgent/important) per task
- **Timeline View:** Vista temporale cross-entity (tasks + events insieme)
- **Calendar heatmap:** Productivity heatmap (GitHub-style)
- **View Presets:** Salva combinazioni filter+sort+display

---

## 💭 Nice to Have (Phase 6+ - 12+ mesi)

### Advanced Integrations

**Calendar Sync:**

- Google Calendar sync (bidirectional)
- Outlook Calendar sync
- Apple Calendar (.ics subscription)
- iCal Export/Import

**Email Integration:**

- Email to Task (forward email → create task)
- Daily digest email con smart suggestions
- Video Call Links (quick join Zoom/Meet links in events)

**Third-party:**

- Zapier integration
- IFTTT triggers
- Webhook support

### File System & Attachments

- Upload files to Cloudflare R2
- Attach to any entity (tasks, notes, projects)
- Supported: images, PDFs, documents, videos
- Storage usage dashboard
- Image preview in notes
- PDF viewer integrato

### Advanced Organization

- **Tag Hierarchies:** Parent/child tags (#work > #work/clients)
- **Tag Analytics Dashboard:** Most used tags, usage over time, tag cloud
- **Workspaces/Contexts:** Cambia contesto (Work/Personal/Side Projects)
- **Saved Searches:** Save frequent searches con filters
- **Smart Collections:** Dynamic collections (auto-add based on rules)

### Mobile & PWA

- **PWA Features:**
  - Install prompt
  - Offline mode (service worker + IndexedDB cache)
  - Push notifications
  - Background sync
- **Mobile Gestures:**
  - Swipe actions (swipe to complete/delete/archive)
  - Pull to refresh
  - Bottom navigation (thumb-friendly)
- **Mobile optimizations:**
  - Touch-friendly targets (min 44px)
  - Native-like animations

### Data & Automation

- **Automatic Backups:** Daily backup to Cloudflare R2
- **Data Retention Policies:** Auto-delete dopo X giorni (GDPR compliance)
- **Webhooks:** Trigger external actions on events (task.created, project.completed)
- **REST API:** Public API for integrations con API keys management
- **Bulk operations:** Advanced bulk edit (regex find/replace, mass reassign)

### Advanced Content Features

- **Rich Text Editor Alternative:** WYSIWYG toolbar con markdown shortcuts (alternative a pure markdown)
- **Code Execution:** Run code snippets in notes (per developers)
- **Embeds:** Embed YouTube, Figma, Loom, etc in notes
- **Collaborative Editing:** Real-time co-editing (OT/CRDT)

### Accessibility & UX

- **Screen Reader Testing:** Complete NVDA/JAWS testing
- **Reduced Motion:** Respect prefers-reduced-motion
- **Keyboard Shortcuts Page:** Lista completa shortcut con search
- **Command Palette Extensions:** More commands in Cmd+K
- **Themes:** Custom color schemes beyond dark/light

### Advanced Project Features

- **Project Templates Marketplace:** Share/download project templates
- **Project Roadmap:** Visual roadmap con milestones
- **Resource Allocation:** Assign hours/budget per task
- **Project Reports:** PDF reports per client con customization
- **Project Portfolio View:** Overview di tutti i progetti

### Team Workspaces (Very Far Future)

Sistema multi-tenancy completo:

- Multi-tenancy (workspaces separati)
- Invite team members
- Workspace roles (owner, admin, member, guest)
- Billing per workspace
- Team analytics
- Workspace settings

---

## 📊 Implementation Complexity

### Quick Wins (1-2 giorni)

- Duplicate functions
- Archive task/project
- Tag Manager page
- Due Soon warnings
- Manual Backup download

### Medium (1 settimana)

- Templates system (task/event/note)
- Trash/Recycle Bin
- Autosave for notes
- Tag filters enhancements
- Custom view presets

### Large (2-4 settimane)

- Recurring Tasks/Events
- Time Tracking system completo
- Note Version History
- Backlinks + Wikilinks
- Gantt Chart
- Pomodoro + Habit Tracker
- Graph View

### Very Large (1-2 mesi)

- **Collaboration System** (sharing, permissions, real-time)
- **AI Assistant** (LLM integration, function calling, chat UI)
- Calendar Sync (Google/Outlook bidirectional)
- Advanced Search (semantic con embeddings)
- PWA with offline mode completo

---

## 🗂️ Feature Categories

Quick reference per trovare feature per tipo di entità:

### Tasks

- Recurring, Templates, Time Tracking, Reminders, Dependencies, Custom Fields, Pomodoro

### Events

- Recurring, Templates, Time Zone Support, Attendees, Video Links, iCal Export, Calendar Sync

### Notes

- Autosave, Version History, Backlinks, Graph View, Daily Notes, LaTeX, Mermaid, Wikilinks, Rich Text

### Projects

- Templates, Milestones, Budget, Gantt, Health, Burndown, Velocity, PDF Reports, Roadmap

### Tags

- Manager Page, Merge/Rename, Hierarchies, Analytics, Smart Suggestions

### Comments

- Rich Text, Mentions, Reactions, Resolve, Edit History

### Links

- Autocomplete, External URLs, Smart Suggestions, Graph View, Broken Detection

### Collections (Phase 3)

- CSV Import/Export, Templates, Advanced filters, Computed fields

---

## 🔗 Related Documentation

- **Current development:** [ROADMAP.md](./ROADMAP.md) (Phase 3 focus)
- **Completed features:** [CHANGELOG.md](../../../CHANGELOG.md) (v0.1.0-v0.3.0)
- **Technical specs:**
  - [AI Assistant](../future/AI_ASSISTANT.md) - 947 lines
  - [Sharing System](../future/SHARING.md) - 799 lines
  - [Architecture](../technical/ARCHITECTURE.md)
  - [Code Quality](../technical/CODE_QUALITY.md)

---

**Ultimo aggiornamento:** 2025-10-23

**Note:** Questo file è un backlog di idee. Per feature in sviluppo attivo, consulta [ROADMAP.md](./ROADMAP.md).

**Contributi:** Hai idee per nuove feature? Aggiungi qui con descrizione, use case e stima complessità.
