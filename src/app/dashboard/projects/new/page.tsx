import { ProjectForm } from "@/components/projects/ProjectForm";

/**
 * New Project Page
 *
 * Form to create a new project
 */

export default function NewProjectPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create Project</h1>
        <p className="text-muted-foreground mt-1">
          Create a new project to organize your tasks, events, and notes
        </p>
      </div>

      {/* Project Form */}
      <ProjectForm mode="create" />
    </div>
  );
}
