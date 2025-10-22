"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteProject } from "@/features/projects/actions";
import { toast } from "sonner";

interface DeleteProjectButtonProps {
  projectId: string;
  projectName: string;
}

export function DeleteProjectButton({ projectId, projectName }: DeleteProjectButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deleteProject(projectId);
        toast.success("Project deleted successfully");
        router.push("/dashboard/projects");
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to delete project");
        setIsOpen(false);
      }
    });
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-destructive">
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Project</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>"{projectName}"</strong>?
            <br />
            <br />
            This will permanently delete the project and all associated:
            <ul className="list-disc list-inside mt-2">
              <li>Tasks</li>
              <li>Events</li>
              <li>Notes</li>
            </ul>
            <br />
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? "Deleting..." : "Delete Project"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
