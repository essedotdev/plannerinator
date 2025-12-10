/**
 * Context Section
 *
 * Provides dynamic context about time, user stats, and current state.
 */

import type { PromptSection, PromptContext } from "../types";

export function buildContextSection(ctx: PromptContext): PromptSection {
  const { temporal, stats, user } = ctx;
  const isItalian = user.preferences?.language !== "en";

  let content = isItalian
    ? `📅 CONTESTO ATTUALE:
Data: ${temporal.formatted.dayOfWeek}, ${temporal.formatted.date}
Ora: ${temporal.formatted.time}
Fuso orario: ${temporal.timezone}`
    : `📅 CURRENT CONTEXT:
Date: ${temporal.formatted.dayOfWeek}, ${temporal.formatted.date}
Time: ${temporal.formatted.time}
Timezone: ${temporal.timezone}`;

  // Add user stats if available
  if (stats) {
    if (isItalian) {
      content += `

📊 SITUAZIONE DI ${user.name.toUpperCase()}:`;

      // Tasks summary
      const taskSummary: string[] = [];
      if (stats.tasksOverdue > 0) {
        taskSummary.push(`⚠️ ${stats.tasksOverdue} task in ritardo`);
      }
      if (stats.tasksDueToday > 0) {
        taskSummary.push(`📌 ${stats.tasksDueToday} task in scadenza oggi`);
      }
      if (stats.tasksDueTomorrow > 0) {
        taskSummary.push(`📋 ${stats.tasksDueTomorrow} task in scadenza domani`);
      }
      if (stats.tasksCompletedToday > 0) {
        taskSummary.push(`✅ ${stats.tasksCompletedToday} task completati oggi`);
      }
      taskSummary.push(`📝 ${stats.tasksOpenCount} task aperti totali`);

      content += "\n" + taskSummary.join("\n");

      // Events summary
      if (stats.eventsToday > 0 || stats.eventsTomorrow > 0) {
        content += "\n";
        if (stats.eventsToday > 0) {
          content += `\n🗓️ ${stats.eventsToday} eventi oggi`;
        }
        if (stats.eventsTomorrow > 0) {
          content += `\n🗓️ ${stats.eventsTomorrow} eventi domani`;
        }
      }

      // Projects
      if (stats.activeProjectsCount > 0) {
        content += `\n\n📁 ${stats.activeProjectsCount} progetti attivi`;
        if (stats.recentProjectNames.length > 0) {
          content += `: ${stats.recentProjectNames.slice(0, 3).join(", ")}`;
        }
      }
    } else {
      content += `

📊 ${user.name.toUpperCase()}'S SITUATION:`;

      const taskSummary: string[] = [];
      if (stats.tasksOverdue > 0) {
        taskSummary.push(`⚠️ ${stats.tasksOverdue} overdue tasks`);
      }
      if (stats.tasksDueToday > 0) {
        taskSummary.push(`📌 ${stats.tasksDueToday} tasks due today`);
      }
      if (stats.tasksDueTomorrow > 0) {
        taskSummary.push(`📋 ${stats.tasksDueTomorrow} tasks due tomorrow`);
      }
      if (stats.tasksCompletedToday > 0) {
        taskSummary.push(`✅ ${stats.tasksCompletedToday} tasks completed today`);
      }
      taskSummary.push(`📝 ${stats.tasksOpenCount} total open tasks`);

      content += "\n" + taskSummary.join("\n");

      if (stats.eventsToday > 0 || stats.eventsTomorrow > 0) {
        content += "\n";
        if (stats.eventsToday > 0) {
          content += `\n🗓️ ${stats.eventsToday} events today`;
        }
        if (stats.eventsTomorrow > 0) {
          content += `\n🗓️ ${stats.eventsTomorrow} events tomorrow`;
        }
      }

      if (stats.activeProjectsCount > 0) {
        content += `\n\n📁 ${stats.activeProjectsCount} active projects`;
        if (stats.recentProjectNames.length > 0) {
          content += `: ${stats.recentProjectNames.slice(0, 3).join(", ")}`;
        }
      }
    }
  }

  return {
    name: "context",
    content,
    priority: 5,
  };
}
