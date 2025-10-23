import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Clock, AlertTriangle, Activity } from "lucide-react";
import { getQuickStats } from "@/features/dashboard/queries";

/**
 * QuickStats Widget
 *
 * Displays quick statistics:
 * - Tasks done today
 * - Overdue tasks
 * - Active tasks
 * - In progress tasks
 */
export async function QuickStats() {
  const stats = await getQuickStats();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Done Today */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
          <CardDescription>Done Today</CardDescription>
          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-500" />
        </CardHeader>
        <CardContent>
          <CardTitle className="text-3xl">{stats.doneToday}</CardTitle>
          <p className="text-xs text-muted-foreground mt-1">Tasks completed today</p>
        </CardContent>
      </Card>

      {/* In Progress */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
          <CardDescription>In Progress</CardDescription>
          <Activity className="h-4 w-4 text-blue-600 dark:text-blue-500" />
        </CardHeader>
        <CardContent>
          <CardTitle className="text-3xl">{stats.inProgress}</CardTitle>
          <p className="text-xs text-muted-foreground mt-1">Tasks being worked on</p>
        </CardContent>
      </Card>

      {/* Overdue */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
          <CardDescription>Overdue</CardDescription>
          <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-500" />
        </CardHeader>
        <CardContent>
          <CardTitle className="text-3xl">{stats.overdue}</CardTitle>
          <p className="text-xs text-muted-foreground mt-1">Tasks past due date</p>
        </CardContent>
      </Card>

      {/* Active */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
          <CardDescription>Active</CardDescription>
          <Clock className="h-4 w-4 text-purple-600 dark:text-purple-500" />
        </CardHeader>
        <CardContent>
          <CardTitle className="text-3xl">{stats.active}</CardTitle>
          <p className="text-xs text-muted-foreground mt-1">Total active tasks</p>
        </CardContent>
      </Card>
    </div>
  );
}
