# Architecture

Architettura applicazione Plannerinator su Next.js 15 + Cloudflare Workers.

## Stack Tecnologico

### Frontend

- **Next.js 15.5** - App Router, React Server Components, Server Actions
- **React 19** - Client components per interattività
- **TypeScript 5.9** - Type safety completo
- **Tailwind CSS 4** - Styling utility-first
- **shadcn/ui** - Component library
- **React Hook Form** - Form management
- **Zod** - Validation schema

### Backend

- **Next.js Server Actions** - API layer type-safe
- **Drizzle ORM** - Database queries con TypeScript
- **PostgreSQL (Neon)** - Database serverless
- **Better Auth** - Autenticazione + RBAC

### Deploy

- **Cloudflare Workers** - Edge runtime
- **OpenNext** - Next.js adapter per Cloudflare
- **Neon** - PostgreSQL edge-compatible

---

## Directory Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth routes (no layout)
│   │   ├── login/
│   │   └── register/
│   │
│   ├── (dashboard)/              # Dashboard routes (shared layout)
│   │   ├── layout.tsx            # Dashboard layout con sidebar
│   │   ├── tasks/
│   │   │   ├── page.tsx          # Lista tasks
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx      # Task detail
│   │   │   └── new/
│   │   │       └── page.tsx      # Nuovo task
│   │   ├── calendar/             # Eventi in calendario
│   │   ├── notes/
│   │   ├── projects/
│   │   ├── collections/
│   │   │   ├── page.tsx          # Lista collections
│   │   │   ├── [id]/
│   │   │   │   ├── page.tsx      # Items della collection
│   │   │   │   └── settings/     # Gestione schema
│   │   │   └── new/
│   │   └── settings/             # User settings
│   │
│   ├── api/
│   │   └── auth/                 # Better Auth endpoint
│   │
│   ├── page.tsx                  # Homepage (redirect to dashboard o landing)
│   ├── layout.tsx                # Root layout
│   └── globals.css
│
├── components/
│   ├── ui/                       # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── dialog.tsx
│   │   ├── calendar.tsx
│   │   └── ...
│   │
│   ├── layout/
│   │   ├── DashboardSidebar.tsx  # Sidebar navigation
│   │   ├── DashboardHeader.tsx   # Top bar con search/user menu
│   │   └── MobileNav.tsx         # Mobile navigation
│   │
│   ├── tasks/
│   │   ├── TaskList.tsx          # Lista tasks
│   │   ├── TaskCard.tsx          # Card singolo task
│   │   ├── TaskDetail.tsx        # Dettaglio task
│   │   ├── TaskForm.tsx          # Form create/edit
│   │   ├── TaskKanban.tsx        # Vista kanban
│   │   └── TaskFilters.tsx       # Filtri e ordinamento
│   │
│   ├── events/
│   │   ├── EventCalendar.tsx     # Calendario eventi
│   │   ├── EventList.tsx
│   │   ├── EventCard.tsx
│   │   └── EventForm.tsx
│   │
│   ├── notes/
│   │   ├── NoteEditor.tsx        # Editor markdown
│   │   ├── NoteList.tsx
│   │   ├── NoteCard.tsx
│   │   └── NotePreview.tsx
│   │
│   ├── projects/
│   │   ├── ProjectList.tsx
│   │   ├── ProjectCard.tsx
│   │   ├── ProjectForm.tsx
│   │   └── ProjectOverview.tsx   # Stats + timeline
│   │
│   ├── collections/
│   │   ├── CollectionList.tsx
│   │   ├── CollectionSchemaEditor.tsx  # Definizione schema
│   │   ├── CollectionItemForm.tsx      # Form dinamico basato su schema
│   │   └── CollectionTable.tsx         # Table view degli items
│   │
│   ├── shared/
│   │   ├── EntityLinks.tsx       # Mostra/gestisce links
│   │   ├── EntityTags.tsx        # Tag selector
│   │   ├── EntityComments.tsx    # Thread commenti
│   │   ├── DatePicker.tsx        # Date/time picker
│   │   ├── MarkdownEditor.tsx    # Editor markdown
│   │   ├── SearchBar.tsx         # Global search
│   │   └── CommandPalette.tsx    # Cmd+K palette
│   │
│   └── providers/
│       └── Providers.tsx         # Theme + React Query providers
│
├── features/                     # Feature modules (co-located logic)
│   ├── tasks/
│   │   ├── schema.ts             # Zod schemas
│   │   ├── actions.ts            # Server Actions
│   │   ├── queries.ts            # Drizzle queries
│   │   └── types.ts              # TypeScript types
│   │
│   ├── events/
│   │   ├── schema.ts
│   │   ├── actions.ts
│   │   ├── queries.ts
│   │   └── types.ts
│   │
│   ├── notes/
│   ├── projects/
│   ├── collections/
│   ├── links/                    # Link management
│   ├── tags/                     # Tag management
│   └── comments/                 # Comment system
│
├── lib/
│   ├── auth.ts                   # Better Auth config
│   ├── auth-client.ts            # Client auth hooks
│   ├── permissions.ts            # RBAC helpers
│   ├── db-utils.ts               # Database utilities
│   ├── date-utils.ts             # Date formatting/parsing
│   ├── metadata.ts               # SEO metadata
│   └── utils.ts                  # Generic utils (cn, etc.)
│
├── db/
│   ├── index.ts                  # Database client
│   └── schema.ts                 # Drizzle schema (completo)
│
├── hooks/
│   ├── use-tasks.ts              # React Query hooks per tasks
│   ├── use-events.ts
│   ├── use-notes.ts
│   ├── use-projects.ts
│   ├── use-collections.ts
│   └── use-search.ts             # Global search hook
│
└── types/
    ├── database.ts               # Database types generati
    └── entities.ts               # Shared types
```

---

## Data Flow

### Server Actions Pattern

Tutte le mutation usano Server Actions per type-safety e ottimizzazioni automatiche.

**Esempio: Creare un task**

```typescript
// features/tasks/actions.ts
"use server";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { tasks, links } from "@/db/schema";
import { createTaskSchema } from "./schema";
import { revalidatePath } from "next/cache";

export async function createTask(data: FormData) {
  // 1. Auth check
  const session = await auth();
  if (!session?.user) {
    return { error: "Non autenticato" };
  }

  // 2. Validation
  const parsed = createTaskSchema.safeParse({
    title: data.get("title"),
    description: data.get("description"),
    dueDate: data.get("dueDate"),
    projectId: data.get("projectId"),
    tags: data.getAll("tags"),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten() };
  }

  // 3. Database transaction
  try {
    const [task] = await db.transaction(async (tx) => {
      // Insert task
      const [newTask] = await tx
        .insert(tasks)
        .values({
          userId: session.user.id,
          title: parsed.data.title,
          description: parsed.data.description,
          dueDate: parsed.data.dueDate,
          projectId: parsed.data.projectId,
        })
        .returning();

      // Create links if projectId provided
      if (parsed.data.projectId) {
        await tx.insert(links).values({
          userId: session.user.id,
          fromType: "task",
          fromId: newTask.id,
          toType: "project",
          toId: parsed.data.projectId,
          relationship: "assigned_to",
        });
      }

      // Create tags (omesso per brevità)

      return [newTask];
    });

    // 4. Revalidate cache
    revalidatePath("/tasks");
    revalidatePath(`/projects/${parsed.data.projectId}`);

    return { success: true, data: task };
  } catch (error) {
    console.error("Error creating task:", error);
    return { error: "Errore durante la creazione del task" };
  }
}
```

**Client component usage:**

```typescript
// components/tasks/TaskForm.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createTaskSchema } from '@/features/tasks/schema';
import { createTask } from '@/features/tasks/actions';
import { useRouter } from 'next/navigation';

export function TaskForm() {
  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(createTaskSchema),
  });

  async function onSubmit(data: FormData) {
    const result = await createTask(data);

    if (result.error) {
      // Handle error
      return;
    }

    // Success
    router.push('/tasks');
  }

  return (
    <form action={onSubmit}>
      {/* Form fields */}
    </form>
  );
}
```

---

## Queries Pattern

### Server Component (preferito per SEO e performance)

```typescript
// app/(dashboard)/tasks/page.tsx
import { auth } from '@/lib/auth';
import { getTasks } from '@/features/tasks/queries';
import { TaskList } from '@/components/tasks/TaskList';

export default async function TasksPage({
  searchParams,
}: {
  searchParams: { status?: string; project?: string };
}) {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const tasks = await getTasks({
    userId: session.user.id,
    status: searchParams.status,
    projectId: searchParams.project,
  });

  return (
    <div>
      <h1>Tasks</h1>
      <TaskList tasks={tasks} />
    </div>
  );
}
```

### Client Component con React Query (per interattività)

```typescript
// hooks/use-tasks.ts
import { useQuery } from '@tanstack/react-query';
import { getTasks } from '@/features/tasks/queries';

export function useTasks(filters?: TaskFilters) {
  return useQuery({
    queryKey: ['tasks', filters],
    queryFn: () => getTasks(filters),
  });
}

// Component
function TaskListClient() {
  const { data: tasks, isLoading } = useTasks({ status: 'todo' });

  if (isLoading) return <Skeleton />;

  return <TaskList tasks={tasks} />;
}
```

---

## Authentication & Authorization

### Session Management

```typescript
// lib/auth.ts
import { betterAuth } from "better-auth";

export const auth = betterAuth({
  database: {
    provider: "postgres",
    url: process.env.DATABASE_URL!,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "user",
      },
    },
  },
});

// Middleware per proteggere route
export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  return session;
}
```

### RLS-like Pattern

Tutte le query includono `user_id` per sicurezza:

```typescript
// features/tasks/queries.ts
export async function getTasks(filters: TaskFilters) {
  const session = await requireAuth();

  return db.query.tasks.findMany({
    where: (tasks, { eq, and }) =>
      and(
        eq(tasks.userId, session.user.id), // SEMPRE
        filters.status ? eq(tasks.status, filters.status) : undefined
      ),
  });
}
```

---

## Caching Strategy

### Server Components (RSC Cache)

```typescript
import { unstable_cache } from "next/cache";

export const getCachedProjects = unstable_cache(
  async (userId: string) => {
    return db.query.projects.findMany({
      where: eq(projects.userId, userId),
    });
  },
  ["projects"], // cache key
  {
    revalidate: 60, // 1 minuto
    tags: ["projects"], // per invalidation
  }
);
```

### Revalidation

```typescript
// Dopo mutation
import { revalidateTag, revalidatePath } from "next/cache";

await createTask(data);
revalidateTag("tasks");
revalidatePath("/tasks");
```

---

## Real-time Updates (Futuro)

### Opzione 1: Polling con React Query

```typescript
const { data } = useQuery({
  queryKey: ["tasks"],
  queryFn: getTasks,
  refetchInterval: 30000, // 30s
});
```

### Opzione 2: Server-Sent Events

```typescript
// app/api/events/route.ts
export async function GET(req: Request) {
  const stream = new ReadableStream({
    async start(controller) {
      // Subscribe to database changes
      // Send updates via SSE
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
    },
  });
}
```

### Opzione 3: Supabase Realtime (se migrare)

```typescript
const channel = supabase
  .channel("tasks-changes")
  .on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "tasks",
    },
    (payload) => {
      queryClient.invalidateQueries(["tasks"]);
    }
  )
  .subscribe();
```

---

## Error Handling

### Global Error Boundary

```typescript
// app/error.tsx
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div>
      <h2>Qualcosa è andato storto</h2>
      <button onClick={reset}>Riprova</button>
    </div>
  );
}
```

### Server Action Errors

```typescript
try {
  await createTask(data);
} catch (error) {
  if (error instanceof DbError) {
    return { error: "Errore database" };
  }
  if (error instanceof ValidationError) {
    return { error: error.message };
  }
  throw error; // Let error boundary handle
}
```

---

## Performance Optimizations

### Database Indexes

Vedi `DATABASE_SCHEMA.md` per indici dettagliati.

### Query Optimizations

```typescript
// ❌ N+1 query problem
for (const task of tasks) {
  const project = await getProject(task.projectId);
}

// ✅ Single query with JOIN
const tasksWithProjects = await db.query.tasks.findMany({
  with: {
    project: true,
  },
});
```

### Pagination

```typescript
export async function getTasks({ page = 1, limit = 50 }: PaginationParams) {
  const offset = (page - 1) * limit;

  return db.query.tasks.findMany({
    limit,
    offset,
    orderBy: (tasks, { desc }) => [desc(tasks.createdAt)],
  });
}
```

### Virtual Scrolling

Per liste lunghe, usa `@tanstack/react-virtual`:

```typescript
import { useVirtualizer } from "@tanstack/react-virtual";

function TaskList({ tasks }) {
  const virtualizer = useVirtualizer({
    count: tasks.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80, // height in px
  });

  // Render only visible items
}
```

---

## Mobile Responsiveness

### Responsive Sidebar

```typescript
// components/layout/DashboardSidebar.tsx
'use client';

export function DashboardSidebar() {
  return (
    <>
      {/* Desktop */}
      <aside className="hidden md:flex md:w-64 md:flex-col">
        <SidebarContent />
      </aside>

      {/* Mobile */}
      <Sheet>
        <SheetTrigger asChild className="md:hidden">
          <Button variant="ghost" size="icon">
            <Menu />
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    </>
  );
}
```

### Mobile-First Components

```typescript
// TaskCard responsive
<Card className="p-4 md:p-6">
  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
    <h3 className="text-base md:text-lg">{task.title}</h3>
    <div className="flex gap-2 md:ml-auto">
      {/* Actions */}
    </div>
  </div>
</Card>
```

---

## Testing Strategy (Futuro)

### Unit Tests (Vitest)

```typescript
import { describe, it, expect } from "vitest";
import { createTaskSchema } from "@/features/tasks/schema";

describe("Task Schema", () => {
  it("should validate valid task", () => {
    const result = createTaskSchema.safeParse({
      title: "Test task",
    });

    expect(result.success).toBe(true);
  });
});
```

### Integration Tests (Playwright)

```typescript
test("create task flow", async ({ page }) => {
  await page.goto("/tasks/new");
  await page.fill('[name="title"]', "New task");
  await page.click('[type="submit"]');

  await expect(page).toHaveURL("/tasks");
  await expect(page.getByText("New task")).toBeVisible();
});
```

---

## Deployment

### Environment Variables

```bash
# .env.local
DATABASE_URL=postgresql://...
NEXT_PUBLIC_APP_URL=https://plannerinator.essedev.it

# Better Auth
BETTER_AUTH_SECRET=...
BETTER_AUTH_URL=https://plannerinator.essedev.it

# Future: AI Assistant
OPENAI_API_KEY=sk-...
# or
ANTHROPIC_API_KEY=sk-ant-...

# Future: File uploads
CLOUDFLARE_R2_BUCKET=...
CLOUDFLARE_R2_ACCESS_KEY=...
```

### Build & Deploy

```bash
pnpm build           # Next.js build
pnpm deploy          # Deploy to Cloudflare Workers
```

### Database Migrations

```bash
pnpm db:generate     # Generate migration
pnpm db:push         # Apply to database
```
