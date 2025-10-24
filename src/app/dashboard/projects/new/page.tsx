import { PageHeader } from "@/components/common";
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
      <PageHeader
        title="Create Project"
        description="Create a new project to organize your tasks, events, and notes"
        backButton
      />

      {/* Project Form */}
      <ProjectForm mode="create" />
    </div>
  );
}
