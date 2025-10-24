# Database Seeding

Simple factory-based seeding system for development and testing.

## Quick Start

### Seed Development Database

```bash
pnpm db:seed
```

**⚠️ WARNING:** This command **DELETES ALL EXISTING DATA** before seeding!

**What it creates:**

- 2 users (1 admin, 1 regular) with password authentication
- 3 projects
- ~40 tasks (various statuses, priorities, overdue, with subtasks)

**Login credentials:**

- **Regular User:**
  - Email: `demo@plannerinator.dev`
  - Password: `Demo123!`
- **Admin User:**
  - Email: `admin@plannerinator.dev`
  - Password: `Admin123!`

### Clean Database (without seeding)

```bash
pnpm db:clean
```

Deletes all data without adding new records.

---

## Factory Functions

### Create User

```typescript
import { createTestUser } from "@/db/seed/factories";

const user = await createTestUser({
  email: "custom@example.com",
  name: "Custom User",
  role: "admin",
});
```

### Create Project

```typescript
import { createTestProject } from "@/db/seed/factories";

const project = await createTestProject(userId, {
  name: "My Project",
  status: "active",
  icon: "🚀",
  color: "#3b82f6",
});
```

### Create Task

```typescript
import { createTestTask } from "@/db/seed/factories";

// Simple task
const task = await createTestTask(userId, {
  title: "My Task",
  status: "todo",
  priority: "high",
});

// Task with due date
const taskWithDue = await createTestTask(userId, {
  withDueDate: true,
  overdue: false, // or true for overdue task
});

// Task in project
const projectTask = await createTestTask(userId, {
  projectId: project.id,
  status: "in_progress",
});
```

### Create Task with Subtasks

```typescript
import { createTestTaskWithSubtasks } from "@/db/seed/factories";

const { parent, subtasks } = await createTestTaskWithSubtasks(userId, 5);
// Creates 1 parent + 5 subtasks
```

### Create Multiple Tasks

```typescript
import { createTestTasks } from "@/db/seed/factories";

const tasks = await createTestTasks(userId, 10, {
  status: "todo",
  priority: "high",
});
```

---

## Use in Tests

```typescript
import { describe, it, expect, beforeAll } from "vitest";
import { createTestUser, createTestTask } from "@/db/seed/factories";

describe("Task Queries", () => {
  let userId: string;

  beforeAll(async () => {
    const user = await createTestUser();
    userId = user.id;

    await createTestTask(userId, { status: "todo", priority: "high" });
    await createTestTask(userId, { status: "done" });
  });

  it("should filter tasks by status", async () => {
    const { tasks } = await getTasks({ status: "todo" });
    expect(tasks.every((t) => t.status === "todo")).toBe(true);
  });
});
```

---

## Clean Database Programmatically

```typescript
import { cleanDatabase } from "@/db/seed/factories";

await cleanDatabase();
// Deletes all: tasks → projects → accounts → users
```

**⚠️ WARNING:** This deletes ALL data! Only use in dev/test environments.

**Note:** `pnpm db:seed` automatically calls `cleanDatabase()` before seeding (idempotent).

---

## File Structure

```
src/db/seed/
├── factories.ts    # Factory functions (user, project, task)
├── dev.ts          # Development seed script
└── README.md       # This file
```

---

## Faker.js

All factories use [@faker-js/faker](https://fakerjs.dev/) to generate realistic data:

- **Names:** `faker.person.fullName()`
- **Emails:** `faker.internet.email()`
- **Text:** `faker.lorem.sentence()`, `faker.lorem.paragraph()`
- **Dates:** `faker.date.recent()`, `faker.date.soon()`
- **UUIDs:** `faker.string.uuid()`

---

## Extending Factories

When you implement new entities (events, notes), add their factories to `factories.ts`:

```typescript
export async function createTestEvent(userId: string, overrides = {}) {
  const [event] = await db
    .insert(event)
    .values({
      id: faker.string.uuid(),
      userId,
      title: faker.lorem.sentence(5),
      startTime: faker.date.soon({ days: 30 }),
      // ...
    })
    .returning();

  return event;
}
```

Then update `dev.ts` to use the new factory.

---

## Scripts

### Database

```bash
# Clean + Seed database (DELETES ALL DATA!)
pnpm db:seed

# Only clean database (no seeding)
pnpm db:clean

# Push schema changes to database
pnpm db:push

# Open Drizzle Studio (database GUI)
pnpm db:studio
```

### Testing

```bash
# Run tests once
pnpm test

# Run tests in watch mode
pnpm test:watch
```
