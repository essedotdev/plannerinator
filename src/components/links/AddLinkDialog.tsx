"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { createLink } from "@/features/links/actions";
import {
  LINK_RELATIONSHIP_LABELS,
  LINK_RELATIONSHIP_DESCRIPTIONS,
  type EntityType,
  type LinkRelationship,
} from "@/features/links/schema";
import { useRouter } from "next/navigation";

/**
 * Add Link Dialog Component
 *
 * Allows users to create links between entities
 *
 * Features:
 * - Select entity type to link to
 * - Search for entities
 * - Select relationship type
 */

interface AddLinkDialogProps {
  fromType: EntityType;
  fromId: string;
}

export function AddLinkDialog({ fromType, fromId }: AddLinkDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);

  // Form state
  const [toType, setToType] = useState<EntityType>("task");
  const [toId, setToId] = useState("");
  const [relationship, setRelationship] = useState<LinkRelationship>("related_to");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!toId.trim()) {
      toast.error("Please enter a target entity ID");
      return;
    }

    startTransition(async () => {
      try {
        await createLink({
          fromType,
          fromId,
          toType,
          toId: toId.trim(),
          relationship,
        });
        toast.success("Link created");
        router.refresh();
        setIsOpen(false);
        // Reset form
        setToType("task");
        setToId("");
        setRelationship("related_to");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to create link");
      }
    });
  };

  const handleReset = () => {
    setToType("task");
    setToId("");
    setRelationship("related_to");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Link
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Link</DialogTitle>
          <DialogDescription>
            Link this {fromType} to another entity to show relationships and dependencies.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Entity Type Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Link to</label>
            <Select value={toType} onValueChange={(value) => setToType(value as EntityType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="task">Task</SelectItem>
                <SelectItem value="event">Event</SelectItem>
                <SelectItem value="note">Note</SelectItem>
                <SelectItem value="project">Project</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Entity ID Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Entity ID</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder={`Enter ${toType} ID or search...`}
                value={toId}
                onChange={(e) => setToId(e.target.value)}
                className="pl-10"
                disabled={isPending}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Tip: You can find the entity ID in the URL when viewing it
            </p>
          </div>

          {/* Relationship Type Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Relationship Type</label>
            <Select
              value={relationship}
              onValueChange={(value) => setRelationship(value as LinkRelationship)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(LINK_RELATIONSHIP_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    <div className="flex flex-col items-start">
                      <span>{label}</span>
                      <span className="text-xs text-muted-foreground">
                        {LINK_RELATIONSHIP_DESCRIPTIONS[value as LinkRelationship]}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Preview */}
          {toId && (
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground mb-2">Preview:</p>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="capitalize">
                  {fromType}
                </Badge>
                <span className="text-sm">{LINK_RELATIONSHIP_LABELS[relationship]}</span>
                <Badge variant="outline" className="capitalize">
                  {toType}
                </Badge>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setIsOpen(false);
                handleReset();
              }}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !toId.trim()}>
              {isPending ? "Creating..." : "Create Link"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
