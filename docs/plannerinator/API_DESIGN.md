# API Design

Design delle API (Server Actions) per Plannerinator.

## Filosofia

**Type-Safe Server Actions**
- Ogni mutation è un Server Action
- Validation con Zod prima di database ops
- Return type consistente `{ success, data?, error? }`
- Auth check in ogni action
- Revalidate cache dopo mutations

---

## Response Pattern

Tutte le actions seguono questo pattern:

```typescript
type ActionResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string | ZodFormattedError };
```

**Esempi:**

```typescript
// Success
return { success: true, data: newTask };

// Validation error
return { success: false, error: parsed.error.format() };

// Generic error
return { success: false, error: 'Failed to create task' };
```

---

## Tasks API

### Create Task

```typescript
// features/tasks/actions.ts
'use server';

import { auth } from '@/lib/auth';
import { db } from '@/db';
import { tasks } from '@/db/schema';
import { createTaskSchema } from './schema';
import { revalidatePath } from 'next/cache';

export async function createTask(input: unknown) {
  // 1. Auth
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: 'Unauthorized' };
  }

  // 2. Validation
  const parsed = createTaskSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.format() };
  }

  // 3. Database
  try {
    const [task] = await db.insert(tasks).values({
      userId: session.user.id,
      ...parsed.data,
    }).returning();

    // 4. Revalidate
    revalidatePath('/tasks');
    if (parsed.data.projectId) {
      revalidatePath(`/projects/${parsed.data.projectId}`);
    }

    return { success: true, data: task };
  } catch (error) {
    console.error('Create task error:', error);
    return { success: false, error: 'Failed to create task' };
  }
}
```

**Schema:**

```typescript
// features/tasks/schema.ts
import { z } from 'zod';

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500),
  description: z.string().max(10000).optional(),
  dueDate: z.date().optional(),
  startDate: z.date().optional(),
  duration: z.number().int().positive().optional(), // minutes
  status: z.enum(['todo', 'in_progress', 'done', 'cancelled']).default('todo'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  projectId: z.string().uuid().optional(),
  parentTaskId: z.string().uuid().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
```

---

### Update Task

```typescript
export async function updateTask(id: string, input: unknown) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: 'Unauthorized' };
  }

  const parsed = updateTaskSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.format() };
  }

  try {
    // Check ownership
    const existing = await db.query.tasks.findFirst({
      where: (tasks, { eq, and }) => and(
        eq(tasks.id, id),
        eq(tasks.userId, session.user.id)
      ),
    });

    if (!existing) {
      return { success: false, error: 'Task not found' };
    }

    // Update
    const [task] = await db.update(tasks)
      .set({
        ...parsed.data,
        updatedAt: new Date(),
      })
      .where(eq(tasks.id, id))
      .returning();

    // Revalidate
    revalidatePath('/tasks');
    revalidatePath(`/tasks/${id}`);
    if (task.projectId) {
      revalidatePath(`/projects/${task.projectId}`);
    }

    return { success: true, data: task };
  } catch (error) {
    console.error('Update task error:', error);
    return { success: false, error: 'Failed to update task' };
  }
}
```

**Schema:**

```typescript
export const updateTaskSchema = createTaskSchema.partial();
```

---

### Delete Task

```typescript
export async function deleteTask(id: string) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    // Check ownership
    const existing = await db.query.tasks.findFirst({
      where: (tasks, { eq, and }) => and(
        eq(tasks.id, id),
        eq(tasks.userId, session.user.id)
      ),
    });

    if (!existing) {
      return { success: false, error: 'Task not found' };
    }

    // Delete (cascade will handle subtasks, links, tags, comments)
    await db.delete(tasks).where(eq(tasks.id, id));

    // Revalidate
    revalidatePath('/tasks');
    if (existing.projectId) {
      revalidatePath(`/projects/${existing.projectId}`);
    }

    return { success: true, data: { id } };
  } catch (error) {
    console.error('Delete task error:', error);
    return { success: false, error: 'Failed to delete task' };
  }
}
```

---

### Toggle Task Complete

```typescript
export async function toggleTaskComplete(id: string) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const task = await db.query.tasks.findFirst({
      where: (tasks, { eq, and }) => and(
        eq(tasks.id, id),
        eq(tasks.userId, session.user.id)
      ),
    });

    if (!task) {
      return { success: false, error: 'Task not found' };
    }

    const newStatus = task.status === 'done' ? 'todo' : 'done';
    const [updated] = await db.update(tasks)
      .set({
        status: newStatus,
        completedAt: newStatus === 'done' ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(eq(tasks.id, id))
      .returning();

    revalidatePath('/tasks');
    revalidatePath(`/tasks/${id}`);

    return { success: true, data: updated };
  } catch (error) {
    console.error('Toggle task error:', error);
    return { success: false, error: 'Failed to toggle task' };
  }
}
```

---

### Bulk Operations

```typescript
export async function bulkUpdateTasks(
  ids: string[],
  updates: Partial<CreateTaskInput>
) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: 'Unauthorized' };
  }

  if (ids.length === 0) {
    return { success: false, error: 'No tasks provided' };
  }

  try {
    const updated = await db.update(tasks)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(and(
        inArray(tasks.id, ids),
        eq(tasks.userId, session.user.id)
      ))
      .returning();

    revalidatePath('/tasks');

    return { success: true, data: updated };
  } catch (error) {
    console.error('Bulk update error:', error);
    return { success: false, error: 'Failed to update tasks' };
  }
}

export async function bulkDeleteTasks(ids: string[]) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    await db.delete(tasks)
      .where(and(
        inArray(tasks.id, ids),
        eq(tasks.userId, session.user.id)
      ));

    revalidatePath('/tasks');

    return { success: true, data: { count: ids.length } };
  } catch (error) {
    console.error('Bulk delete error:', error);
    return { success: false, error: 'Failed to delete tasks' };
  }
}
```

---

## Queries

**Non sono Server Actions, ma funzioni async importate nei Server Components.**

```typescript
// features/tasks/queries.ts
import { db } from '@/db';
import { tasks } from '@/db/schema';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export async function getTasks(filters?: {
  status?: string;
  priority?: string;
  projectId?: string;
  search?: string;
  dueAfter?: Date;
  dueBefore?: Date;
}) {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const conditions = [eq(tasks.userId, session.user.id)];

  if (filters?.status) {
    conditions.push(eq(tasks.status, filters.status));
  }
  if (filters?.priority) {
    conditions.push(eq(tasks.priority, filters.priority));
  }
  if (filters?.projectId) {
    conditions.push(eq(tasks.projectId, filters.projectId));
  }
  if (filters?.dueAfter) {
    conditions.push(gte(tasks.dueDate, filters.dueAfter));
  }
  if (filters?.dueBefore) {
    conditions.push(lte(tasks.dueDate, filters.dueBefore));
  }

  let query = db.query.tasks.findMany({
    where: and(...conditions),
    with: {
      project: true, // Include project relation
    },
    orderBy: (tasks, { asc, desc }) => [
      asc(tasks.dueDate),
      desc(tasks.priority),
    ],
  });

  // Full-text search (se implementato)
  if (filters?.search) {
    query = db.query.tasks.findMany({
      where: and(
        ...conditions,
        sql`${tasks.searchVector} @@ plainto_tsquery('italian', ${filters.search})`
      ),
    });
  }

  return query;
}

export async function getTask(id: string) {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const task = await db.query.tasks.findFirst({
    where: and(
      eq(tasks.id, id),
      eq(tasks.userId, session.user.id)
    ),
    with: {
      project: true,
      subtasks: true,
      // Links, tags, comments tramite joins custom
    },
  });

  if (!task) {
    throw new Error('Task not found');
  }

  return task;
}
```

---

## Events API

Similar pattern to tasks:

```typescript
// features/events/actions.ts
export async function createEvent(input: unknown) { ... }
export async function updateEvent(id: string, input: unknown) { ... }
export async function deleteEvent(id: string) { ... }

// features/events/queries.ts
export async function getEvents(filters?: {
  calendarType?: string;
  projectId?: string;
  startAfter?: Date;
  startBefore?: Date;
}) { ... }

export async function getEvent(id: string) { ... }
```

**Schema:**

```typescript
// features/events/schema.ts
export const createEventSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().max(10000).optional(),
  startTime: z.date(),
  endTime: z.date().optional(),
  allDay: z.boolean().default(false),
  location: z.string().max(500).optional(),
  locationUrl: z.string().url().optional(),
  calendarType: z.enum(['personal', 'work', 'family', 'other']).default('personal'),
  projectId: z.string().uuid().optional(),
  metadata: z.record(z.unknown()).optional(),
});
```

---

## Notes API

```typescript
// features/notes/actions.ts
export async function createNote(input: unknown) { ... }
export async function updateNote(id: string, input: unknown) { ... }
export async function deleteNote(id: string) { ... }
export async function toggleNoteFavorite(id: string) { ... }

// features/notes/queries.ts
export async function getNotes(filters?: {
  type?: string;
  projectId?: string;
  isFavorite?: boolean;
  search?: string;
}) { ... }

export async function getNote(id: string) { ... }
```

**Schema:**

```typescript
export const createNoteSchema = z.object({
  title: z.string().max(500).optional(),
  content: z.string().min(1, 'Content is required'),
  type: z.enum(['note', 'document', 'research', 'idea', 'snippet']).default('note'),
  projectId: z.string().uuid().optional(),
  parentNoteId: z.string().uuid().optional(),
  isFavorite: z.boolean().default(false),
  metadata: z.record(z.unknown()).optional(),
});
```

---

## Projects API

```typescript
// features/projects/actions.ts
export async function createProject(input: unknown) { ... }
export async function updateProject(id: string, input: unknown) { ... }
export async function deleteProject(id: string) { ... }
export async function archiveProject(id: string) { ... }

// features/projects/queries.ts
export async function getProjects(filters?: {
  status?: string;
}) { ... }

export async function getProject(id: string) { ... }

export async function getProjectStats(id: string) {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const [project, taskStats, eventCount, noteCount] = await Promise.all([
    db.query.projects.findFirst({
      where: and(
        eq(projects.id, id),
        eq(projects.userId, session.user.id)
      ),
    }),
    db.select({
      total: count(),
      completed: count(sql`CASE WHEN ${tasks.status} = 'done' THEN 1 END`),
    }).from(tasks).where(eq(tasks.projectId, id)),
    db.select({ count: count() }).from(events).where(eq(events.projectId, id)),
    db.select({ count: count() }).from(notes).where(eq(notes.projectId, id)),
  ]);

  return {
    project,
    stats: {
      totalTasks: taskStats[0].total,
      completedTasks: taskStats[0].completed,
      totalEvents: eventCount[0].count,
      totalNotes: noteCount[0].count,
      progress: taskStats[0].total > 0
        ? Math.round((taskStats[0].completed / taskStats[0].total) * 100)
        : 0,
    },
  };
}
```

**Schema:**

```typescript
export const createProjectSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  status: z.enum(['active', 'on_hold', 'completed', 'archived', 'cancelled']).default('active'),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).default('#3b82f6'),
  icon: z.string().max(50).optional(),
  parentProjectId: z.string().uuid().optional(),
  metadata: z.record(z.unknown()).optional(),
});
```

---

## Collections API

```typescript
// features/collections/actions.ts
export async function createCollection(input: unknown) { ... }
export async function updateCollection(id: string, input: unknown) { ... }
export async function updateCollectionSchema(id: string, schema: unknown) { ... }
export async function deleteCollection(id: string) { ... }

export async function createCollectionItem(collectionId: string, data: unknown) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    // 1. Get collection and validate ownership
    const collection = await db.query.collections.findFirst({
      where: and(
        eq(collections.id, collectionId),
        eq(collections.userId, session.user.id)
      ),
    });

    if (!collection) {
      return { success: false, error: 'Collection not found' };
    }

    // 2. Validate data against collection schema
    const schema = collection.schema as { fields: Field[] };
    const validationResult = validateAgainstSchema(data, schema);

    if (!validationResult.success) {
      return { success: false, error: validationResult.error };
    }

    // 3. Insert item
    const [item] = await db.insert(collectionItems).values({
      collectionId,
      userId: session.user.id,
      data: validationResult.data,
    }).returning();

    revalidatePath(`/collections/${collectionId}`);

    return { success: true, data: item };
  } catch (error) {
    console.error('Create collection item error:', error);
    return { success: false, error: 'Failed to create item' };
  }
}

export async function updateCollectionItem(id: string, data: unknown) { ... }
export async function deleteCollectionItem(id: string) { ... }
```

**Schema validation helper:**

```typescript
// lib/collection-schema.ts
type FieldType = 'text' | 'textarea' | 'number' | 'date' | 'select' | 'multiselect' | 'checkbox' | 'url' | 'email';

interface Field {
  id: string;
  label: string;
  type: FieldType;
  required?: boolean;
  defaultValue?: unknown;
  options?: string[]; // for select/multiselect
  validation?: {
    min?: number;
    max?: number;
    regex?: string;
  };
}

export function validateAgainstSchema(data: Record<string, unknown>, schema: { fields: Field[] }) {
  const errors: Record<string, string> = {};
  const validated: Record<string, unknown> = {};

  for (const field of schema.fields) {
    const value = data[field.id];

    // Required check
    if (field.required && (value === undefined || value === null || value === '')) {
      errors[field.id] = `${field.label} is required`;
      continue;
    }

    // Skip validation if not required and empty
    if (!field.required && (value === undefined || value === null || value === '')) {
      continue;
    }

    // Type-specific validation
    switch (field.type) {
      case 'text':
      case 'textarea':
        if (typeof value !== 'string') {
          errors[field.id] = `${field.label} must be text`;
        } else if (field.validation?.max && value.length > field.validation.max) {
          errors[field.id] = `${field.label} must be less than ${field.validation.max} characters`;
        }
        break;

      case 'number':
        if (typeof value !== 'number') {
          errors[field.id] = `${field.label} must be a number`;
        } else if (field.validation?.min && value < field.validation.min) {
          errors[field.id] = `${field.label} must be at least ${field.validation.min}`;
        } else if (field.validation?.max && value > field.validation.max) {
          errors[field.id] = `${field.label} must be at most ${field.validation.max}`;
        }
        break;

      case 'email':
        if (typeof value !== 'string' || !value.includes('@')) {
          errors[field.id] = `${field.label} must be a valid email`;
        }
        break;

      case 'url':
        if (typeof value !== 'string' || !value.startsWith('http')) {
          errors[field.id] = `${field.label} must be a valid URL`;
        }
        break;

      case 'select':
        if (!field.options?.includes(value as string)) {
          errors[field.id] = `${field.label} must be one of: ${field.options?.join(', ')}`;
        }
        break;

      case 'multiselect':
        if (!Array.isArray(value) || !value.every(v => field.options?.includes(v))) {
          errors[field.id] = `${field.label} contains invalid options`;
        }
        break;

      // ... more types
    }

    validated[field.id] = value;
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, error: errors };
  }

  return { success: true, data: validated };
}
```

---

## Links API

```typescript
// features/links/actions.ts
export async function createLink(input: unknown) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: 'Unauthorized' };
  }

  const parsed = createLinkSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.format() };
  }

  try {
    const [link] = await db.insert(links).values({
      userId: session.user.id,
      ...parsed.data,
    }).returning();

    // Revalidate both entities
    revalidatePath(`/${parsed.data.fromType}s/${parsed.data.fromId}`);
    revalidatePath(`/${parsed.data.toType}s/${parsed.data.toId}`);

    return { success: true, data: link };
  } catch (error) {
    console.error('Create link error:', error);
    return { success: false, error: 'Failed to create link' };
  }
}

export async function deleteLink(id: string) { ... }

// features/links/queries.ts
export async function getEntityLinks(entityType: string, entityId: string) {
  const session = await auth();
  if (!session?.user) redirect('/login');

  return db.query.links.findMany({
    where: or(
      and(
        eq(links.fromType, entityType),
        eq(links.fromId, entityId),
        eq(links.userId, session.user.id)
      ),
      and(
        eq(links.toType, entityType),
        eq(links.toId, entityId),
        eq(links.userId, session.user.id)
      )
    ),
  });
}
```

**Schema:**

```typescript
export const createLinkSchema = z.object({
  fromType: z.enum(['task', 'event', 'note', 'project', 'collection_item']),
  fromId: z.string().uuid(),
  toType: z.enum(['task', 'event', 'note', 'project', 'collection_item']),
  toId: z.string().uuid(),
  relationship: z.enum([
    'assigned_to',
    'related_to',
    'documented_by',
    'scheduled_as',
    'blocks',
    'depends_on',
    'references',
    'inspired_by',
  ]),
  metadata: z.record(z.unknown()).optional(),
});
```

---

## Tags & Comments

Similar patterns per tags e comments.

```typescript
// features/tags/actions.ts
export async function createTag(name: string, color?: string) { ... }
export async function addTagToEntity(tagId: string, entityType: string, entityId: string) { ... }
export async function removeTagFromEntity(tagId: string, entityType: string, entityId: string) { ... }

// features/comments/actions.ts
export async function createComment(entityType: string, entityId: string, content: string) { ... }
export async function updateComment(id: string, content: string) { ... }
export async function deleteComment(id: string) { ... }
```

---

## Error Handling Best Practices

```typescript
try {
  // Database operation
} catch (error) {
  // Log full error per debugging
  console.error('Operation failed:', error);

  // Return user-friendly message
  if (error instanceof DatabaseError) {
    if (error.code === '23505') { // Unique constraint
      return { success: false, error: 'Item already exists' };
    }
    if (error.code === '23503') { // Foreign key
      return { success: false, error: 'Related item not found' };
    }
  }

  return { success: false, error: 'Operation failed. Please try again.' };
}
```

---

## Rate Limiting (Futuro)

```typescript
import { rateLimit } from '@/lib/rate-limit';

export async function createTask(input: unknown) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: 'Unauthorized' };
  }

  // Rate limit: 100 tasks per hour
  const { success, remaining } = await rateLimit({
    userId: session.user.id,
    action: 'create_task',
    limit: 100,
    window: 3600, // seconds
  });

  if (!success) {
    return {
      success: false,
      error: 'Rate limit exceeded. Please try again later.'
    };
  }

  // ... rest of function
}
```
