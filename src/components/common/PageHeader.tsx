"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  /** Show back button that navigates to previous page */
  backButton?: boolean;
  /** Action buttons to display on the right (e.g., Edit, Delete) */
  actions?: React.ReactNode;
}

/**
 * PageHeader component for consistent page titles across the application.
 *
 * @example
 * ```tsx
 * // Simple header
 * <PageHeader
 *   title="Dashboard"
 *   description="Welcome to your dashboard"
 * />
 *
 * // With back button
 * <PageHeader
 *   title="Task Details"
 *   description="View and edit task"
 *   backButton
 * />
 *
 * // With action buttons
 * <PageHeader
 *   title="Project Details"
 *   backButton
 *   actions={
 *     <>
 *       <Button>Edit</Button>
 *       <Button variant="destructive">Delete</Button>
 *     </>
 *   }
 * />
 * ```
 */
export function PageHeader({ title, description, children, backButton, actions }: PageHeaderProps) {
  const router = useRouter();

  return (
    <div className="border-b pb-6 mb-8">
      {backButton && (
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-4 -ml-2">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      )}
      <div className="flex items-center justify-between gap-10">
        <div className="space-y-1 min-w-0">
          <h1 className="text-4xl font-bold tracking-tight">{title}</h1>
          {description && <p className="text-muted-foreground text-lg">{description}</p>}
        </div>
        {(children || actions) && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {children}
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
