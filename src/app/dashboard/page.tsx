import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { user, session, task, event, note, project } from "@/db/schema";
import { count, eq } from "drizzle-orm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RoleGate } from "@/components/auth";
import Link from "next/link";

export default async function DashboardPage() {
  // Session is verified by layout, guaranteed to exist
  const userSession = (await getSession())!;

  // User's stats
  const [tasksResult, eventsResult, notesResult, projectsResult] = await Promise.all([
    db.select({ count: count() }).from(task).where(eq(task.userId, userSession.user.id)),
    db.select({ count: count() }).from(event).where(eq(event.userId, userSession.user.id)),
    db.select({ count: count() }).from(note).where(eq(note.userId, userSession.user.id)),
    db.select({ count: count() }).from(project).where(eq(project.userId, userSession.user.id)),
  ]);

  const tasksCount = tasksResult[0]?.count ?? 0;
  const eventsCount = eventsResult[0]?.count ?? 0;
  const notesCount = notesResult[0]?.count ?? 0;
  const projectsCount = projectsResult[0]?.count ?? 0;

  // Admin stats
  let userCount = 0;
  let sessionCount = 0;

  if (userSession.user.role === "admin") {
    const [userCountResult, sessionCountResult] = await Promise.all([
      db.select({ count: count() }).from(user),
      db.select({ count: count() }).from(session),
    ]);

    userCount = userCountResult[0]?.count ?? 0;
    sessionCount = sessionCountResult[0]?.count ?? 0;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Welcome back, {userSession.user.name}!</h1>
        <p className="text-muted-foreground mt-1">Here's your Plannerinator overview.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* My Stats - All Users */}
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>My Tasks</CardDescription>
            <CardTitle className="text-4xl">{tasksCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Total tasks you've created</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>My Events</CardDescription>
            <CardTitle className="text-4xl">{eventsCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Events in your calendar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>My Notes</CardDescription>
            <CardTitle className="text-4xl">{notesCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Notes and documents</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>My Projects</CardDescription>
            <CardTitle className="text-4xl">{projectsCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Active projects</p>
          </CardContent>
        </Card>

        {/* Admin Stats */}
        <RoleGate allowedRoles={["admin"]}>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Users</CardDescription>
              <CardTitle className="text-4xl">{userCount}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Registered users in the system</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Active Sessions</CardDescription>
              <CardTitle className="text-4xl">{sessionCount}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Currently active sessions</p>
            </CardContent>
          </Card>
        </RoleGate>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Get started with Plannerinator</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Link
              href="/dashboard/tasks"
              className="block px-4 py-2 hover:bg-muted rounded-md transition-colors"
            >
              Manage Tasks →
            </Link>
            <Link
              href="/dashboard/events"
              className="block px-4 py-2 hover:bg-muted rounded-md transition-colors"
            >
              View Calendar →
            </Link>
            <Link
              href="/dashboard/notes"
              className="block px-4 py-2 hover:bg-muted rounded-md transition-colors"
            >
              Browse Notes →
            </Link>
            <Link
              href="/dashboard/projects"
              className="block px-4 py-2 hover:bg-muted rounded-md transition-colors"
            >
              Manage Projects →
            </Link>
            <RoleGate allowedRoles={["admin"]}>
              <Link
                href="/dashboard/users"
                className="block px-4 py-2 hover:bg-muted rounded-md transition-colors"
              >
                Manage Users →
              </Link>
            </RoleGate>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
