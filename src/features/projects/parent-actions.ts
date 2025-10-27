"use server";

import { getProjects } from "./queries";

/**
 * Server action to get projects for parent selection
 * Used by client components (ProjectForm)
 */
export async function getProjectsForParentSelection(excludeId?: string) {
  try {
    const result = await getProjects({
      sortBy: "name",
      sortOrder: "asc",
    });

    // Filter out the current project if provided
    const filteredProjects = excludeId
      ? result.projects.filter((p) => p.id !== excludeId)
      : result.projects;

    return {
      success: true,
      projects: filteredProjects,
    };
  } catch (error) {
    console.error("Failed to load projects:", error);
    return {
      success: false,
      projects: [],
    };
  }
}
