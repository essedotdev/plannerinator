/**
 * Development Seed Script
 *
 * Populates database with realistic test data for local development.
 *
 * Usage:
 *   pnpm db:seed
 *
 * Creates:
 * - 2 users (1 admin, 1 regular)
 * - 3 projects with tasks
 * - 20+ standalone tasks (various statuses/priorities)
 * - 1 task with subtasks
 * - Tasks with overdue dates, priorities, etc.
 */

async function main() {
  // Load .env.local FIRST (before any imports that use DATABASE_URL)
  const { loadEnv } = await import("../../lib/load-env.js");
  loadEnv();

  // Now dynamically import factories (after env is loaded)
  const {
    createTestUser,
    createTestProject,
    createTestTask,
    createTestTaskWithSubtasks,
    createTestEvent,
    createTestNote,
    cleanDatabase,
  } = await import("./factories.js");

  console.log("🌱 Seeding development database...\n");

  // ============================================================================
  // CLEAN DATABASE (fresh start)
  // ============================================================================

  console.log("🗑️  Cleaning existing data...");
  await cleanDatabase();
  console.log("  ✅ Database cleaned\n");

  // ============================================================================
  // CREATE USERS
  // ============================================================================

  console.log("👤 Creating users...");

  const ADMIN_PASSWORD = "Admin123!";
  const USER_PASSWORD = "Demo123!";

  const adminUser = await createTestUser({
    name: "Admin User",
    email: "admin@plannerinator.dev",
    password: ADMIN_PASSWORD,
    role: "admin",
  });

  const regularUser = await createTestUser({
    name: "Demo User",
    email: "demo@plannerinator.dev",
    password: USER_PASSWORD,
    role: "user",
  });

  console.log(`  ✅ Created admin: ${adminUser.email}`);
  console.log(`  ✅ Created user: ${regularUser.email}\n`);

  // ============================================================================
  // CREATE PROJECTS WITH TASKS
  // ============================================================================

  console.log("📁 Creating projects...");

  const project1 = await createTestProject(regularUser.id, {
    name: "Website Redesign",
    status: "active",
    icon: "🎨",
    color: "#3b82f6",
  });

  const project2 = await createTestProject(regularUser.id, {
    name: "Marketing Campaign Q1",
    status: "active",
    icon: "📢",
    color: "#10b981",
  });

  const project3 = await createTestProject(regularUser.id, {
    name: "Mobile App Development",
    status: "on_hold",
    icon: "📱",
    color: "#8b5cf6",
  });

  console.log(`  ✅ Created 3 projects\n`);

  // ============================================================================
  // CREATE TASKS FOR PROJECTS
  // ============================================================================

  console.log("📝 Creating tasks for projects...");

  let taskCount = 0;

  // Project 1: Website Redesign (12 tasks)
  for (let i = 0; i < 12; i++) {
    await createTestTask(regularUser.id, {
      projectId: project1.id,
      status: ["todo", "in_progress", "done"][i % 3] as "todo" | "in_progress" | "done",
      priority: ["medium", "high"][i % 2] as "medium" | "high",
      withDueDate: true,
    });
    taskCount++;
  }

  // Project 2: Marketing Campaign (8 tasks)
  for (let i = 0; i < 8; i++) {
    await createTestTask(regularUser.id, {
      projectId: project2.id,
      status: ["todo", "in_progress"][i % 2] as "todo" | "in_progress",
      priority: ["low", "medium", "high"][i % 3] as "low" | "medium" | "high",
      withDueDate: true,
    });
    taskCount++;
  }

  // Project 3: Mobile App (5 tasks, on hold)
  for (let i = 0; i < 5; i++) {
    await createTestTask(regularUser.id, {
      projectId: project3.id,
      status: "todo",
      priority: "low",
    });
    taskCount++;
  }

  console.log(`  ✅ Created ${taskCount} project tasks\n`);

  // ============================================================================
  // CREATE STANDALONE TASKS
  // ============================================================================

  console.log("📝 Creating standalone tasks...");

  // High priority tasks
  await createTestTask(regularUser.id, {
    title: "Review quarterly reports",
    status: "todo",
    priority: "urgent",
    withDueDate: true,
  });

  await createTestTask(regularUser.id, {
    title: "Prepare presentation for client meeting",
    status: "in_progress",
    priority: "high",
    withDueDate: true,
  });

  // Overdue tasks
  await createTestTask(regularUser.id, {
    title: "Submit expense report (OVERDUE)",
    status: "todo",
    priority: "urgent",
    withDueDate: true,
    overdue: true,
  });

  await createTestTask(regularUser.id, {
    title: "Update documentation (OVERDUE)",
    status: "todo",
    priority: "medium",
    withDueDate: true,
    overdue: true,
  });

  // Regular tasks
  await createTestTask(regularUser.id, {
    title: "Buy groceries",
    status: "todo",
    priority: "low",
  });

  await createTestTask(regularUser.id, {
    title: "Schedule dentist appointment",
    status: "todo",
    priority: "medium",
  });

  await createTestTask(regularUser.id, {
    title: "Read new design system docs",
    status: "in_progress",
    priority: "low",
  });

  // Completed tasks
  await createTestTask(regularUser.id, {
    title: "Fix navigation bug",
    status: "done",
    priority: "high",
  });

  await createTestTask(regularUser.id, {
    title: "Update README",
    status: "done",
    priority: "low",
  });

  // Cancelled tasks
  await createTestTask(regularUser.id, {
    title: "Outdated feature request (cancelled)",
    status: "cancelled",
    priority: "medium",
  });

  await createTestTask(regularUser.id, {
    title: "Duplicate task (cancelled)",
    status: "cancelled",
    priority: "low",
  });

  console.log("  ✅ Created 11 standalone tasks\n");

  // ============================================================================
  // CREATE TASK WITH SUBTASKS
  // ============================================================================

  console.log("📝 Creating task with subtasks...");

  const { parent, subtasks } = await createTestTaskWithSubtasks(regularUser.id, 5);

  console.log(`  ✅ Created parent task "${parent.title}" with ${subtasks.length} subtasks\n`);

  // ============================================================================
  // CREATE EVENTS FOR PROJECTS
  // ============================================================================

  console.log("📅 Creating events for projects...");

  let eventCount = 0;

  // Project 1: Website Redesign (5 events - work meetings)
  for (let i = 0; i < 5; i++) {
    await createTestEvent(regularUser.id, {
      projectId: project1.id,
      calendarType: "work",
      allDay: false,
      title: `Website Redesign Meeting ${i + 1}`,
    });
    eventCount++;
  }

  // Project 2: Marketing Campaign (4 events - mix of work)
  for (let i = 0; i < 4; i++) {
    await createTestEvent(regularUser.id, {
      projectId: project2.id,
      calendarType: "work",
      allDay: i === 0, // First one is all-day
      title: `Marketing Campaign ${i === 0 ? "Launch Day" : `Meeting ${i}`}`,
    });
    eventCount++;
  }

  console.log(`  ✅ Created ${eventCount} project events\n`);

  // ============================================================================
  // CREATE STANDALONE EVENTS
  // ============================================================================

  console.log("📅 Creating standalone events...");

  // Work events
  await createTestEvent(regularUser.id, {
    title: "Team Standup",
    calendarType: "work",
    allDay: false,
    location: "Office - Conference Room B",
  });

  await createTestEvent(regularUser.id, {
    title: "Client Presentation",
    calendarType: "work",
    allDay: false,
    location: "Client Office",
    locationUrl: "https://maps.google.com",
  });

  await createTestEvent(regularUser.id, {
    title: "Annual Company Retreat",
    calendarType: "work",
    allDay: true,
  });

  // Personal events
  await createTestEvent(regularUser.id, {
    title: "Dentist Appointment",
    calendarType: "personal",
    allDay: false,
    location: "Dr. Smith Dental Clinic",
  });

  await createTestEvent(regularUser.id, {
    title: "Gym Session",
    calendarType: "personal",
    allDay: false,
    location: "FitLife Gym",
  });

  await createTestEvent(regularUser.id, {
    title: "Vacation Day",
    calendarType: "personal",
    allDay: true,
  });

  // Family events
  await createTestEvent(regularUser.id, {
    title: "Family Dinner",
    calendarType: "family",
    allDay: false,
    location: "Home",
  });

  await createTestEvent(regularUser.id, {
    title: "Kid's School Play",
    calendarType: "family",
    allDay: false,
    location: "Lincoln Elementary School",
  });

  // Other events
  await createTestEvent(regularUser.id, {
    title: "Community Meetup",
    calendarType: "other",
    allDay: false,
    location: "City Library",
  });

  await createTestEvent(regularUser.id, {
    title: "Conference Day",
    calendarType: "other",
    allDay: true,
    location: "Convention Center",
  });

  console.log("  ✅ Created 10 standalone events\n");

  // ============================================================================
  // CREATE NOTES FOR PROJECTS
  // ============================================================================

  console.log("📝 Creating notes for projects...");

  let noteCount = 0;

  // Project 1: Website Redesign (4 notes - documents/research)
  await createTestNote(regularUser.id, {
    projectId: project1.id,
    title: "Design System Documentation",
    type: "document",
    isFavorite: true,
  });
  noteCount++;

  await createTestNote(regularUser.id, {
    projectId: project1.id,
    title: "User Research Findings",
    type: "research",
  });
  noteCount++;

  await createTestNote(regularUser.id, {
    projectId: project1.id,
    title: "Wireframe Notes - Homepage",
    type: "note",
  });
  noteCount++;

  await createTestNote(regularUser.id, {
    projectId: project1.id,
    title: "Color Palette Ideas",
    type: "idea",
  });
  noteCount++;

  // Project 2: Marketing Campaign (3 notes)
  await createTestNote(regularUser.id, {
    projectId: project2.id,
    title: "Campaign Strategy Document",
    type: "document",
    isFavorite: true,
  });
  noteCount++;

  await createTestNote(regularUser.id, {
    projectId: project2.id,
    title: "Target Audience Research",
    type: "research",
  });
  noteCount++;

  await createTestNote(regularUser.id, {
    projectId: project2.id,
    title: "Social Media Content Ideas",
    type: "idea",
  });
  noteCount++;

  // Project 3: Mobile App (2 notes)
  await createTestNote(regularUser.id, {
    projectId: project3.id,
    title: "Technical Architecture Plan",
    type: "document",
  });
  noteCount++;

  await createTestNote(regularUser.id, {
    projectId: project3.id,
    title: "Feature Requirements",
    type: "note",
  });
  noteCount++;

  console.log(`  ✅ Created ${noteCount} project notes\n`);

  // ============================================================================
  // CREATE STANDALONE NOTES
  // ============================================================================

  console.log("📝 Creating standalone notes...");

  // Document type notes
  await createTestNote(regularUser.id, {
    title: "Meeting Minutes - Q1 Planning",
    type: "document",
  });

  await createTestNote(regularUser.id, {
    title: "API Documentation Draft",
    type: "document",
  });

  // Research notes
  await createTestNote(regularUser.id, {
    title: "Competitive Analysis - Design Tools",
    type: "research",
    isFavorite: true,
  });

  await createTestNote(regularUser.id, {
    title: "User Feedback Summary",
    type: "research",
  });

  // Regular notes
  await createTestNote(regularUser.id, {
    title: "Daily Standup Notes",
    type: "note",
  });

  await createTestNote(regularUser.id, {
    title: "Quick Thoughts on New Feature",
    type: "note",
  });

  await createTestNote(regularUser.id, {
    title: "Book Recommendations",
    type: "note",
  });

  // Ideas
  await createTestNote(regularUser.id, {
    title: "New Feature Ideas",
    type: "idea",
    isFavorite: true,
  });

  await createTestNote(regularUser.id, {
    title: "Blog Post Topics",
    type: "idea",
  });

  await createTestNote(regularUser.id, {
    title: "Side Project Brainstorm",
    type: "idea",
  });

  // Code snippets
  await createTestNote(regularUser.id, {
    title: "Useful React Hooks",
    type: "snippet",
  });

  await createTestNote(regularUser.id, {
    title: "SQL Query Templates",
    type: "snippet",
  });

  await createTestNote(regularUser.id, {
    title: "CSS Grid Examples",
    type: "snippet",
    isFavorite: true,
  });

  await createTestNote(regularUser.id, {
    title: "TypeScript Utility Types",
    type: "snippet",
  });

  await createTestNote(regularUser.id, {
    title: "Bash Commands Cheatsheet",
    type: "snippet",
  });

  console.log("  ✅ Created 15 standalone notes\n");

  // ============================================================================
  // SUMMARY
  // ============================================================================

  const totalTasks = taskCount + 11 + 1 + subtasks.length;
  const totalEvents = eventCount + 10;
  const totalNotes = noteCount + 15;

  console.log("═══════════════════════════════════════");
  console.log("✨ Development seed completed!");
  console.log("═══════════════════════════════════════");
  console.log(`👤 Users: 2 (1 admin, 1 regular)`);
  console.log(`📁 Projects: 3`);
  console.log(`📝 Tasks: ${totalTasks}`);
  console.log(`📅 Events: ${totalEvents}`);
  console.log(`📝 Notes: ${totalNotes}`);
  console.log("═══════════════════════════════════════\n");
  console.log("🔑 Login credentials:\n");
  console.log("   👤 Regular User:");
  console.log(`      Email:    ${regularUser.email}`);
  console.log(`      Password: ${USER_PASSWORD}`);
  console.log("");
  console.log("   👑 Admin User:");
  console.log(`      Email:    ${adminUser.email}`);
  console.log(`      Password: ${ADMIN_PASSWORD}`);
  console.log("");
}

main()
  .then(() => {
    console.log("✅ Seed script finished successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Seed script failed:", error);
    process.exit(1);
  });
