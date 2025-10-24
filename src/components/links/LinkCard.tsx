"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteLink } from "@/features/links/actions";
import { LINK_RELATIONSHIP_LABELS, type LinkRelationship } from "@/features/links/schema";
import { useRouter } from "next/navigation";

/**
 * Link Card Component
 *
 * Displays a single link with:
 * - Linked entity info (title, type)
 * - Relationship type
 * - Delete action
 */

interface LinkedEntity {
  type: "task" | "event" | "note" | "project";
  id: string;
  title: string;
  status?: string;
  icon?: string | null;
}

interface LinkCardProps {
  linkId: string;
  relationship: LinkRelationship;
  entity: LinkedEntity | null;
  direction: "from" | "to";
}

export function LinkCard({ linkId, relationship, entity }: LinkCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = async () => {
    startTransition(async () => {
      try {
        await deleteLink(linkId);
        toast.success("Link removed");
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to delete link");
      }
    });
  };

  if (!entity) {
    return (
      <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-xs">
            {LINK_RELATIONSHIP_LABELS[relationship]}
          </Badge>
          <span className="text-sm text-muted-foreground">Entity not found</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowDeleteDialog(true)}
          className="h-8 w-8 p-0"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  const entityUrl = `/dashboard/${entity.type}s/${entity.id}`;

  return (
    <>
      <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
        <div className="flex items-center gap-3 flex-1">
          {/* Relationship Badge */}
          <Badge variant="outline" className="text-xs whitespace-nowrap">
            {LINK_RELATIONSHIP_LABELS[relationship]}
          </Badge>

          {/* Entity Info */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {entity.icon && <span className="text-lg">{entity.icon}</span>}
            <div className="min-w-0 flex-1">
              <Link href={entityUrl} className="text-sm font-medium hover:underline truncate block">
                {entity.title}
              </Link>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground capitalize">{entity.type}</span>
                {entity.status && (
                  <>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground capitalize">
                      {entity.status.replace("_", " ")}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* View Link Button */}
          <Link href={entityUrl}>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <ExternalLink className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Delete Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowDeleteDialog(true)}
          className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Link</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this link? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isPending}>
              {isPending ? "Removing..." : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
