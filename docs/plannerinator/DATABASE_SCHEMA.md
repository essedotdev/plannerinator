# Database Schema

Schema completo PostgreSQL per Plannerinator utilizzando Drizzle ORM.

## Filosofia dello Schema

**Hybrid Multi-Model Approach:**
1. Tabelle tipizzate per entità core (performance + type safety)
2. Campi JSONB per metadata custom (flessibilità)
3. Tabelle universali per features condivise (links, tags, comments)
4. Indici strategici per query comuni

## Entità Core

### Tasks

```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,

  -- Core fields
  title TEXT NOT NULL,
  description TEXT,

  -- Scheduling
  due_date TIMESTAMP WITH TIME ZONE,
  start_date TIMESTAMP WITH TIME ZONE,
  duration INTEGER, -- minuti stimati

  -- Status & Priority
  status TEXT NOT NULL DEFAULT 'todo'
    CHECK (status IN ('todo', 'in_progress', 'done', 'cancelled')),
  priority TEXT DEFAULT 'medium'
    CHECK (priority IN ('low', 'medium', 'high', 'urgent')),

  -- Completion
  completed_at TIMESTAMP WITH TIME ZONE,

  -- Organization
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  parent_task_id UUID REFERENCES tasks(id) ON DELETE CASCADE, -- subtasks

  -- Ordering
  position INTEGER DEFAULT 0, -- per drag & drop

  -- Metadata custom
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Indexes
  INDEX idx_tasks_user_id (user_id),
  INDEX idx_tasks_project_id (project_id),
  INDEX idx_tasks_status (status),
  INDEX idx_tasks_due_date (due_date),
  INDEX idx_tasks_parent (parent_task_id)
);
```

**Esempi metadata JSONB:**
```json
{
  "recurring": {
    "enabled": true,
    "frequency": "weekly",
    "interval": 1,
    "end_date": "2025-12-31"
  },
  "estimated_difficulty": "hard",
  "actual_duration_minutes": 120,
  "pomodoros_spent": 4
}
```

---

### Events

```sql
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,

  -- Core fields
  title TEXT NOT NULL,
  description TEXT,

  -- Timing (start_time è obbligatorio)
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  all_day BOOLEAN DEFAULT false,

  -- Location
  location TEXT,
  location_url TEXT, -- Google Maps link, Zoom link, etc.

  -- Organization
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,

  -- Calendar
  calendar_type TEXT DEFAULT 'personal'
    CHECK (calendar_type IN ('personal', 'work', 'family', 'other')),

  -- Metadata custom
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Indexes
  INDEX idx_events_user_id (user_id),
  INDEX idx_events_start_time (start_time),
  INDEX idx_events_project_id (project_id),
  INDEX idx_events_calendar_type (calendar_type)
);
```

**Esempi metadata JSONB:**
```json
{
  "meeting_link": "https://zoom.us/j/123456",
  "attendees": ["mario@example.com", "giulia@example.com"],
  "recurring": {
    "frequency": "weekly",
    "days_of_week": [1, 3, 5]
  },
  "color": "#3b82f6"
}
```

---

### Notes

```sql
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,

  -- Core fields
  title TEXT, -- opzionale, alcuni note sono solo content
  content TEXT, -- markdown

  -- Type
  type TEXT DEFAULT 'note'
    CHECK (type IN ('note', 'document', 'research', 'idea', 'snippet')),

  -- Organization
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  parent_note_id UUID REFERENCES notes(id) ON DELETE CASCADE, -- note nidificate

  -- Favorites
  is_favorite BOOLEAN DEFAULT false,

  -- Metadata custom
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Full-text search
  search_vector TSVECTOR GENERATED ALWAYS AS (
    to_tsvector('italian', COALESCE(title, '') || ' ' || COALESCE(content, ''))
  ) STORED,

  -- Indexes
  INDEX idx_notes_user_id (user_id),
  INDEX idx_notes_type (type),
  INDEX idx_notes_project_id (project_id),
  INDEX idx_notes_favorite (user_id, is_favorite) WHERE is_favorite = true,
  INDEX idx_notes_search USING GIN (search_vector)
);
```

**Esempi metadata JSONB:**
```json
{
  "source_url": "https://example.com/article",
  "author": "Mario Rossi",
  "reading_time_minutes": 15,
  "highlights": [
    {"text": "Quote importante", "color": "yellow"}
  ],
  "related_book_isbn": "978-1234567890"
}
```

---

### Projects

```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,

  -- Core fields
  name TEXT NOT NULL,
  description TEXT,

  -- Status
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'on_hold', 'completed', 'archived', 'cancelled')),

  -- Timeline
  start_date DATE,
  end_date DATE,

  -- Visual
  color TEXT DEFAULT '#3b82f6', -- hex color
  icon TEXT, -- emoji o lucide icon name

  -- Organization
  parent_project_id UUID REFERENCES projects(id) ON DELETE SET NULL, -- sub-projects

  -- Metadata custom
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Indexes
  INDEX idx_projects_user_id (user_id),
  INDEX idx_projects_status (status),
  INDEX idx_projects_parent (parent_project_id)
);
```

**Esempi metadata JSONB:**
```json
{
  "client_name": "Acme Corp",
  "budget_eur": 5000,
  "hours_estimated": 40,
  "hours_tracked": 28.5,
  "repository_url": "https://github.com/user/repo",
  "notion_url": "https://notion.so/project-123"
}
```

---

### Collections

Sistema flessibile per liste personalizzate.

```sql
CREATE TABLE collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,

  -- Core fields
  name TEXT NOT NULL,
  description TEXT,

  -- Icon
  icon TEXT, -- emoji o lucide icon

  -- Schema definition (JSON Schema)
  schema JSONB NOT NULL DEFAULT '{"fields": []}',

  -- Settings
  settings JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Indexes
  INDEX idx_collections_user_id (user_id)
);

CREATE TABLE collection_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,

  -- Data based on collection schema
  data JSONB NOT NULL DEFAULT '{}',

  -- Position for manual ordering
  position INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Indexes
  INDEX idx_collection_items_collection (collection_id),
  INDEX idx_collection_items_user (user_id)
);
```

**Esempio schema servizi freelance:**
```json
{
  "fields": [
    {
      "id": "name",
      "label": "Nome Servizio",
      "type": "text",
      "required": true
    },
    {
      "id": "price",
      "label": "Prezzo (EUR)",
      "type": "number",
      "required": true
    },
    {
      "id": "duration_hours",
      "label": "Durata (ore)",
      "type": "number"
    },
    {
      "id": "description",
      "label": "Descrizione",
      "type": "textarea"
    },
    {
      "id": "technologies",
      "label": "Tecnologie",
      "type": "multiselect",
      "options": ["React", "Node.js", "PostgreSQL", "Next.js"]
    }
  ]
}
```

**Esempio item:**
```json
{
  "name": "Sviluppo Landing Page",
  "price": 1500,
  "duration_hours": 20,
  "description": "Landing page responsive con form contatti",
  "technologies": ["React", "Next.js"]
}
```

---

## Features Universali

### Links (Relazioni tra Entità)

```sql
CREATE TABLE links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,

  -- Source entity
  from_type TEXT NOT NULL
    CHECK (from_type IN ('task', 'event', 'note', 'project', 'collection_item')),
  from_id UUID NOT NULL,

  -- Target entity
  to_type TEXT NOT NULL
    CHECK (to_type IN ('task', 'event', 'note', 'project', 'collection_item')),
  to_id UUID NOT NULL,

  -- Relationship type
  relationship TEXT NOT NULL
    CHECK (relationship IN (
      'assigned_to',      -- task → project
      'related_to',       -- generic relationship
      'documented_by',    -- task → note
      'scheduled_as',     -- task → event
      'blocks',           -- task → task (dependency)
      'depends_on',       -- task → task (inverse)
      'references',       -- note → anything
      'inspired_by'       -- creative connections
    )),

  -- Metadata about the relationship
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Prevent duplicates
  UNIQUE(from_type, from_id, to_type, to_id, relationship),

  -- Indexes
  INDEX idx_links_from (from_type, from_id),
  INDEX idx_links_to (to_type, to_id),
  INDEX idx_links_user (user_id)
);
```

**Query esempio - trova tutti i link di un task:**
```sql
SELECT * FROM links
WHERE (from_type = 'task' AND from_id = $taskId)
   OR (to_type = 'task' AND to_id = $taskId);
```

---

### Tags

```sql
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,

  -- Tag info
  name TEXT NOT NULL,
  color TEXT DEFAULT '#6b7280', -- hex color

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Unique per user
  UNIQUE(user_id, name),

  -- Indexes
  INDEX idx_tags_user (user_id)
);

CREATE TABLE entity_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,

  -- Entity reference
  entity_type TEXT NOT NULL
    CHECK (entity_type IN ('task', 'event', 'note', 'project', 'collection_item')),
  entity_id UUID NOT NULL,

  -- Tag reference
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Prevent duplicates
  UNIQUE(entity_type, entity_id, tag_id),

  -- Indexes
  INDEX idx_entity_tags_entity (entity_type, entity_id),
  INDEX idx_entity_tags_tag (tag_id),
  INDEX idx_entity_tags_user (user_id)
);
```

---

### Comments

```sql
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,

  -- Entity reference
  entity_type TEXT NOT NULL
    CHECK (entity_type IN ('task', 'event', 'note', 'project', 'collection_item')),
  entity_id UUID NOT NULL,

  -- Comment content
  content TEXT NOT NULL,

  -- Nested comments (replies)
  parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Indexes
  INDEX idx_comments_entity (entity_type, entity_id),
  INDEX idx_comments_user (user_id),
  INDEX idx_comments_parent (parent_comment_id)
);
```

---

### Attachments (Futuro con R2)

```sql
CREATE TABLE attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,

  -- Entity reference
  entity_type TEXT NOT NULL
    CHECK (entity_type IN ('task', 'event', 'note', 'project', 'collection_item', 'comment')),
  entity_id UUID NOT NULL,

  -- File info
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL, -- bytes
  mime_type TEXT NOT NULL,

  -- Storage
  storage_key TEXT NOT NULL, -- R2 key
  storage_url TEXT NOT NULL, -- public URL

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Indexes
  INDEX idx_attachments_entity (entity_type, entity_id),
  INDEX idx_attachments_user (user_id)
);
```

---

## Activity Log

Track tutte le modifiche per timeline e undo (futuro).

```sql
CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,

  -- Action info
  action TEXT NOT NULL
    CHECK (action IN ('create', 'update', 'delete', 'restore')),

  -- Entity reference
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,

  -- Changes (JSON diff per update)
  changes JSONB,

  -- Snapshot (stato completo per undo)
  snapshot JSONB,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Indexes
  INDEX idx_activity_user (user_id, created_at DESC),
  INDEX idx_activity_entity (entity_type, entity_id)
);
```

---

## Sharing (Futuro)

```sql
CREATE TABLE shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,

  -- Entity being shared
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,

  -- Who it's shared with
  shared_with_user_id TEXT REFERENCES user(id) ON DELETE CASCADE,
  shared_with_email TEXT, -- per invite via email

  -- Permissions
  permission TEXT NOT NULL
    CHECK (permission IN ('view', 'comment', 'edit')),

  -- Share settings
  expires_at TIMESTAMP WITH TIME ZONE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Indexes
  INDEX idx_shares_owner (owner_id),
  INDEX idx_shares_shared_with (shared_with_user_id),
  INDEX idx_shares_entity (entity_type, entity_id)
);
```

---

## Indici e Performance

### Indici Full-Text Search (futuro)

```sql
-- Note già ha search_vector

-- Tasks
ALTER TABLE tasks ADD COLUMN search_vector TSVECTOR
  GENERATED ALWAYS AS (
    to_tsvector('italian', COALESCE(title, '') || ' ' || COALESCE(description, ''))
  ) STORED;

CREATE INDEX idx_tasks_search ON tasks USING GIN (search_vector);

-- Events
ALTER TABLE events ADD COLUMN search_vector TSVECTOR
  GENERATED ALWAYS AS (
    to_tsvector('italian', COALESCE(title, '') || ' ' || COALESCE(description, ''))
  ) STORED;

CREATE INDEX idx_events_search ON events USING GIN (search_vector);
```

### Indici JSONB (se necessari)

```sql
-- Cerca nei metadata
CREATE INDEX idx_tasks_metadata ON tasks USING GIN (metadata);
CREATE INDEX idx_notes_metadata ON notes USING GIN (metadata);
```

---

## Vincoli di Integrità

### Trigger per updated_at

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Ripeti per tutte le tabelle con updated_at
```

### Trigger per completed_at

```sql
CREATE OR REPLACE FUNCTION update_task_completed_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'done' AND OLD.status != 'done' THEN
    NEW.completed_at = NOW();
  ELSIF NEW.status != 'done' THEN
    NEW.completed_at = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_task_completed_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_task_completed_at();
```

---

## Esempi Query Comuni

### Task con tags e project

```sql
SELECT
  t.*,
  p.name as project_name,
  p.color as project_color,
  ARRAY_AGG(DISTINCT tag.name) as tags
FROM tasks t
LEFT JOIN projects p ON t.project_id = p.id
LEFT JOIN entity_tags et ON et.entity_type = 'task' AND et.entity_id = t.id
LEFT JOIN tags tag ON et.tag_id = tag.id
WHERE t.user_id = $userId
  AND t.status != 'done'
GROUP BY t.id, p.id
ORDER BY t.due_date ASC NULLS LAST;
```

### Eventi del mese con location

```sql
SELECT
  e.*,
  p.name as project_name,
  COUNT(c.id) as comment_count
FROM events e
LEFT JOIN projects p ON e.project_id = p.id
LEFT JOIN comments c ON c.entity_type = 'event' AND c.entity_id = e.id
WHERE e.user_id = $userId
  AND e.start_time >= DATE_TRUNC('month', CURRENT_DATE)
  AND e.start_time < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
GROUP BY e.id, p.id
ORDER BY e.start_time ASC;
```

### Note collegate a un task

```sql
SELECT n.*
FROM notes n
INNER JOIN links l ON (
  (l.from_type = 'note' AND l.from_id = n.id AND l.to_type = 'task' AND l.to_id = $taskId)
  OR
  (l.to_type = 'note' AND l.to_id = n.id AND l.from_type = 'task' AND l.from_id = $taskId)
)
WHERE n.user_id = $userId;
```

### Statistiche progetto

```sql
SELECT
  p.*,
  COUNT(DISTINCT t.id) as total_tasks,
  COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'done') as completed_tasks,
  COUNT(DISTINCT e.id) as total_events,
  COUNT(DISTINCT n.id) as total_notes
FROM projects p
LEFT JOIN tasks t ON t.project_id = p.id
LEFT JOIN events e ON e.project_id = p.id
LEFT JOIN notes n ON n.project_id = p.id
WHERE p.id = $projectId
  AND p.user_id = $userId
GROUP BY p.id;
```
