import { faker } from "@faker-js/faker";
import { db } from "@/db";
import { user, account, task, project, event, note, link } from "@/db/schema";
import { hashPassword } from "@/lib/password";

/**
 * Seed Factories - Minimal Implementation
 *
 * Simple factory functions to create test data for:
 * - Development (manual testing)
 * - Tests (automated validation)
 *
 * Usage:
 *   const user = await createTestUser({ email: 'test@example.com', password: 'password123' });
 *   const task = await createTestTask(user.id, { status: 'done' });
 */

// ============================================================================
// USER FACTORY
// ============================================================================

export interface CreateTestUserOptions {
  name?: string;
  email?: string;
  password?: string;
  role?: "user" | "admin";
  emailVerified?: boolean;
}

/**
 * Create a test user with account (email/password authentication)
 *
 * Creates both:
 * 1. User record (in `user` table)
 * 2. Account record with hashed password (in `account` table)
 *
 * @param overrides - User options
 * @returns Created user object
 */
export async function createTestUser(overrides: CreateTestUserOptions = {}) {
  const email = overrides.email ?? faker.internet.email();
  const password = overrides.password ?? "password123"; // Default password for dev

  // Create user
  const [createdUser] = await db
    .insert(user)
    .values({
      id: faker.string.uuid(),
      name: overrides.name ?? faker.person.fullName(),
      email,
      emailVerified: overrides.emailVerified ?? true,
      role: overrides.role ?? "user",
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  // Hash password using Web Crypto API (Cloudflare Workers compatible)
  const hashedPassword = await hashPassword(password);

  // Create account with password (Better Auth email/password provider)
  await db.insert(account).values({
    id: faker.string.uuid(),
    accountId: createdUser.id, // Better Auth uses userId as accountId for credential provider
    providerId: "credential", // Better Auth provider ID for email/password
    userId: createdUser.id,
    password: hashedPassword,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return createdUser;
}

// ============================================================================
// PROJECT FACTORY
// ============================================================================

export interface CreateTestProjectOptions {
  name?: string;
  description?: string;
  status?: "active" | "on_hold" | "completed" | "archived" | "cancelled";
  color?: string;
  icon?: string;
}

/**
 * Create a test project
 */
export async function createTestProject(userId: string, overrides: CreateTestProjectOptions = {}) {
  const colors = ["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"];
  const icons = ["📁", "🚀", "💼", "🎯", "⚡", "🔥", "💡", "🎨"];

  const [createdProject] = await db
    .insert(project)
    .values({
      id: faker.string.uuid(),
      userId,
      name: overrides.name ?? faker.company.buzzPhrase(),
      description: overrides.description ?? faker.lorem.paragraph(),
      status: overrides.status ?? "active",
      color: overrides.color ?? faker.helpers.arrayElement(colors),
      icon: overrides.icon ?? faker.helpers.arrayElement(icons),
      startDate: faker.date.recent({ days: 60 }),
      endDate: faker.helpers.maybe(() => faker.date.future({ years: 1 }), { probability: 0.6 }),
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  return createdProject;
}

// ============================================================================
// TASK FACTORY
// ============================================================================

export interface CreateTestTaskOptions {
  title?: string;
  description?: string;
  status?: "todo" | "in_progress" | "done" | "cancelled";
  priority?: "low" | "medium" | "high" | "urgent";
  projectId?: string | null;
  parentTaskId?: string | null;
  dueDate?: Date | null;
  withDueDate?: boolean;
  overdue?: boolean;
}

/**
 * Create a test task with faker-generated data
 */
export async function createTestTask(userId: string, overrides: CreateTestTaskOptions = {}) {
  let dueDate: Date | null = null;

  // Generate due date if requested
  if (overrides.dueDate) {
    dueDate = overrides.dueDate;
  } else if (overrides.withDueDate) {
    if (overrides.overdue) {
      // Overdue: 1-30 days ago
      dueDate = faker.date.recent({ days: 30 });
    } else {
      // Future: 1-60 days from now
      dueDate = faker.date.soon({ days: 60 });
    }
  }

  const [createdTask] = await db
    .insert(task)
    .values({
      id: faker.string.uuid(),
      userId,
      title: overrides.title ?? faker.lorem.sentence({ min: 3, max: 8 }),
      description:
        overrides.description ??
        faker.helpers.maybe(() => faker.lorem.paragraph(), { probability: 0.7 }),
      status: overrides.status ?? "todo",
      priority: overrides.priority ?? "medium",
      projectId: overrides.projectId ?? null,
      parentTaskId: overrides.parentTaskId ?? null,
      dueDate,
      startDate: faker.helpers.maybe(() => faker.date.recent({ days: 7 }), { probability: 0.3 }),
      duration: faker.helpers.maybe(() => faker.number.int({ min: 15, max: 480 }), {
        probability: 0.5,
      }),
      completedAt: overrides.status === "done" ? new Date() : null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  // Create assigned_to link if projectId is provided
  if (overrides.projectId) {
    await db.insert(link).values({
      id: faker.string.uuid(),
      userId,
      fromType: "task",
      fromId: createdTask.id,
      toType: "project",
      toId: overrides.projectId,
      relationship: "assigned_to",
      metadata: {},
      createdAt: new Date(),
    });
  }

  return createdTask;
}

/**
 * Create multiple test tasks at once
 */
export async function createTestTasks(
  userId: string,
  count: number,
  overrides: CreateTestTaskOptions = {}
) {
  const tasks = [];
  for (let i = 0; i < count; i++) {
    const t = await createTestTask(userId, overrides);
    tasks.push(t);
  }
  return tasks;
}

/**
 * Create a task with subtasks
 */
export async function createTestTaskWithSubtasks(userId: string, subtaskCount = 3) {
  const parentTask = await createTestTask(userId, {
    title: "Parent Task with Subtasks",
  });

  const subtasks = [];
  for (let i = 0; i < subtaskCount; i++) {
    const subtask = await createTestTask(userId, {
      parentTaskId: parentTask.id,
      title: `Subtask ${i + 1}`,
    });
    subtasks.push(subtask);
  }

  return { parent: parentTask, subtasks };
}

// ============================================================================
// EVENT FACTORY
// ============================================================================

export interface CreateTestEventOptions {
  title?: string;
  description?: string;
  startTime?: Date;
  endTime?: Date;
  allDay?: boolean;
  location?: string;
  locationUrl?: string;
  calendarType?: "personal" | "work" | "family" | "other";
  projectId?: string | null;
}

/**
 * Create a test event with faker-generated data
 */
export async function createTestEvent(userId: string, overrides: CreateTestEventOptions = {}) {
  const startTime = overrides.startTime || faker.date.soon({ days: 30 });
  const duration = faker.number.int({ min: 30, max: 180 }); // 30min - 3h
  const endTime = overrides.endTime || new Date(startTime.getTime() + duration * 60000);

  const [createdEvent] = await db
    .insert(event)
    .values({
      id: faker.string.uuid(),
      userId,
      title: overrides.title ?? faker.company.catchPhrase(),
      description:
        overrides.description ??
        faker.helpers.maybe(() => faker.lorem.paragraph(), { probability: 0.7 }),
      startTime,
      endTime,
      allDay: overrides.allDay ?? faker.datatype.boolean({ probability: 0.15 }),
      location:
        overrides.location ??
        faker.helpers.maybe(() => faker.location.streetAddress({ useFullAddress: true }), {
          probability: 0.6,
        }),
      locationUrl:
        overrides.locationUrl ??
        faker.helpers.maybe(() => faker.internet.url(), { probability: 0.3 }),
      calendarType:
        overrides.calendarType ??
        faker.helpers.arrayElement(["personal", "work", "family", "other"]),
      projectId: overrides.projectId ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  // Create assigned_to link if projectId is provided
  if (overrides.projectId) {
    await db.insert(link).values({
      id: faker.string.uuid(),
      userId,
      fromType: "event",
      fromId: createdEvent.id,
      toType: "project",
      toId: overrides.projectId,
      relationship: "assigned_to",
      metadata: {},
      createdAt: new Date(),
    });
  }

  return createdEvent;
}

/**
 * Create multiple test events at once
 */
export async function createTestEvents(
  userId: string,
  count: number,
  overrides: CreateTestEventOptions = {}
) {
  const events = [];
  for (let i = 0; i < count; i++) {
    const evt = await createTestEvent(userId, overrides);
    events.push(evt);
  }
  return events;
}

// ============================================================================
// NOTE FACTORY
// ============================================================================

export interface CreateTestNoteOptions {
  title?: string;
  content?: string;
  type?: "note" | "document" | "research" | "idea" | "snippet";
  isFavorite?: boolean;
  projectId?: string | null;
  parentNoteId?: string | null;
}

/**
 * Create a test note with faker-generated data
 */
export async function createTestNote(userId: string, overrides: CreateTestNoteOptions = {}) {
  const [createdNote] = await db
    .insert(note)
    .values({
      id: faker.string.uuid(),
      userId,
      title:
        overrides.title ??
        faker.helpers.maybe(() => faker.lorem.sentence({ min: 3, max: 8 }), { probability: 0.9 }),
      content:
        overrides.content ??
        faker.helpers.maybe(
          () => {
            // Generate markdown content
            const paragraphs = faker.number.int({ min: 1, max: 5 });
            return Array.from({ length: paragraphs })
              .map(() => faker.lorem.paragraph())
              .join("\n\n");
          },
          { probability: 0.95 }
        ),
      type:
        overrides.type ??
        faker.helpers.arrayElement(["note", "document", "research", "idea", "snippet"]),
      isFavorite: overrides.isFavorite ?? faker.datatype.boolean({ probability: 0.15 }),
      projectId: overrides.projectId ?? null,
      parentNoteId: overrides.parentNoteId ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  // Create assigned_to link if projectId is provided
  if (overrides.projectId) {
    await db.insert(link).values({
      id: faker.string.uuid(),
      userId,
      fromType: "note",
      fromId: createdNote.id,
      toType: "project",
      toId: overrides.projectId,
      relationship: "assigned_to",
      metadata: {},
      createdAt: new Date(),
    });
  }

  return createdNote;
}

/**
 * Create multiple test notes at once
 */
export async function createTestNotes(
  userId: string,
  count: number,
  overrides: CreateTestNoteOptions = {}
) {
  const notes = [];
  for (let i = 0; i < count; i++) {
    const n = await createTestNote(userId, overrides);
    notes.push(n);
  }
  return notes;
}

// ============================================================================
// CLEANUP UTILITIES
// ============================================================================

/**
 * Clean all test data from database
 * WARNING: This deletes ALL data!
 */
export async function cleanDatabase() {
  // Delete in correct order (respect foreign keys)
  await db.delete(note);
  await db.delete(event);
  await db.delete(task);
  await db.delete(project);
  await db.delete(account); // Must delete before user (FK)
  await db.delete(user);
}
