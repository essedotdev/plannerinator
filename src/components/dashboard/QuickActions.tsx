import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckSquare, Calendar, FileText, FolderPlus } from "lucide-react";
import Link from "next/link";

/**
 * QuickActions Component
 *
 * Provides quick access buttons to create new entities:
 * - New Task
 * - New Event
 * - New Note
 * - New Project
 */
export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Create new items or navigate to sections</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* New Task */}
          <Button asChild variant="outline" className="h-auto flex-col gap-2 py-4">
            <Link href="/dashboard/tasks/new">
              <CheckSquare className="h-6 w-6" />
              <div className="text-center">
                <div className="font-semibold">New Task</div>
                <div className="text-xs text-muted-foreground">Create a task</div>
              </div>
            </Link>
          </Button>

          {/* New Event */}
          <Button asChild variant="outline" className="h-auto flex-col gap-2 py-4">
            <Link href="/dashboard/events/new">
              <Calendar className="h-6 w-6" />
              <div className="text-center">
                <div className="font-semibold">New Event</div>
                <div className="text-xs text-muted-foreground">Add to calendar</div>
              </div>
            </Link>
          </Button>

          {/* New Note */}
          <Button asChild variant="outline" className="h-auto flex-col gap-2 py-4">
            <Link href="/dashboard/notes/new">
              <FileText className="h-6 w-6" />
              <div className="text-center">
                <div className="font-semibold">New Note</div>
                <div className="text-xs text-muted-foreground">Write a note</div>
              </div>
            </Link>
          </Button>

          {/* New Project */}
          <Button asChild variant="outline" className="h-auto flex-col gap-2 py-4">
            <Link href="/dashboard/projects/new">
              <FolderPlus className="h-6 w-6" />
              <div className="text-center">
                <div className="font-semibold">New Project</div>
                <div className="text-xs text-muted-foreground">Start a project</div>
              </div>
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
