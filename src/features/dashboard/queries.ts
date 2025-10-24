"use server";

import { db } from "@/db";
import { task, event } from "@/db/schema";
import { eq, and, gte, lte, sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { startOfDay, endOfDay, addDays } from "date-fns";

/**
 * Dashboard Queries
 *
 * Provides data for dashboard widgets:
 * - Today's tasks and events
 * - Upcoming deadlines
 * - Quick stats (done today, overdue, active)
 */

/**
 * Get today's tasks and events
 */
export async function getTodayItems() {
  const userSession = await getSession();
  if (!userSession) {
    throw new Error("Unauthorized");
  }

  const today = new Date();
  const startOfToday = startOfDay(today);
  const endOfToday = endOfDay(today);

  const [todayTasks, todayEvents] = await Promise.all([
    // Tasks due today or overdue (not done/cancelled)
    db
      .select({
        id: task.id,
        title: task.title,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate,
      })
      .from(task)
      .where(
        and(
          eq(task.userId, userSession.user.id),
          sql`${task.dueDate} <= ${endOfToday}`,
          sql`${task.status} NOT IN ('done', 'cancelled')`
        )
      )
      .orderBy(task.dueDate, task.priority)
      .limit(10),

    // Events happening today
    db
      .select({
        id: event.id,
        title: event.title,
        startTime: event.startTime,
        endTime: event.endTime,
        allDay: event.allDay,
        calendarType: event.calendarType,
      })
      .from(event)
      .where(
        and(
          eq(event.userId, userSession.user.id),
          gte(event.startTime, startOfToday),
          lte(event.startTime, endOfToday)
        )
      )
      .orderBy(event.startTime)
      .limit(10),
  ]);

  return {
    tasks: todayTasks,
    events: todayEvents,
  };
}

/**
 * Get upcoming deadlines (next 7 days)
 */
export async function getUpcomingDeadlines() {
  const userSession = await getSession();
  if (!userSession) {
    throw new Error("Unauthorized");
  }

  const today = new Date();
  const startOfToday = startOfDay(today);
  const endOfWeek = endOfDay(addDays(today, 7));

  const upcomingTasks = await db
    .select({
      id: task.id,
      title: task.title,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
    })
    .from(task)
    .where(
      and(
        eq(task.userId, userSession.user.id),
        gte(task.dueDate, startOfToday),
        lte(task.dueDate, endOfWeek),
        sql`${task.status} NOT IN ('done', 'cancelled')`
      )
    )
    .orderBy(task.dueDate, task.priority)
    .limit(10);

  return upcomingTasks;
}

/**
 * Get quick stats for dashboard
 */
export async function getQuickStats() {
  const userSession = await getSession();
  if (!userSession) {
    throw new Error("Unauthorized");
  }

  const today = new Date();
  const startOfToday = startOfDay(today);
  const endOfToday = endOfDay(today);

  // Tasks done today
  const tasksDoneToday = await db
    .select({ count: sql<number>`count(*)` })
    .from(task)
    .where(
      and(
        eq(task.userId, userSession.user.id),
        eq(task.status, "done"),
        gte(task.updatedAt, startOfToday),
        lte(task.updatedAt, endOfToday)
      )
    );

  // Overdue tasks (not done/cancelled)
  const overdueTasks = await db
    .select({ count: sql<number>`count(*)` })
    .from(task)
    .where(
      and(
        eq(task.userId, userSession.user.id),
        sql`${task.dueDate} < ${startOfToday}`,
        sql`${task.status} NOT IN ('done', 'cancelled')`
      )
    );

  // Active tasks (not done/cancelled)
  const activeTasks = await db
    .select({ count: sql<number>`count(*)` })
    .from(task)
    .where(
      and(eq(task.userId, userSession.user.id), sql`${task.status} NOT IN ('done', 'cancelled')`)
    );

  // Tasks in progress
  const inProgressTasks = await db
    .select({ count: sql<number>`count(*)` })
    .from(task)
    .where(and(eq(task.userId, userSession.user.id), eq(task.status, "in_progress")));

  return {
    doneToday: Number(tasksDoneToday[0]?.count ?? 0),
    overdue: Number(overdueTasks[0]?.count ?? 0),
    active: Number(activeTasks[0]?.count ?? 0),
    inProgress: Number(inProgressTasks[0]?.count ?? 0),
  };
}
