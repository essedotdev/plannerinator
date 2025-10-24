"use client";

import { LinkCard } from "./LinkCard";
import { AddLinkDialog } from "./AddLinkDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Link as LinkIcon } from "lucide-react";
import type { EntityType, LinkRelationship } from "@/features/links/schema";

/**
 * Entity Links Section Component
 *
 * Displays all links for an entity with:
 * - Outgoing links (from this entity)
 * - Incoming links (to this entity)
 * - Add link button
 */

interface LinkedEntity {
  type: "task" | "event" | "note" | "project";
  id: string;
  title: string;
  status?: string;
  icon?: string | null;
}

interface LinkData {
  id: string;
  fromType: EntityType;
  fromId: string;
  toType: EntityType;
  toId: string;
  relationship: LinkRelationship;
  fromEntity: LinkedEntity | null;
  toEntity: LinkedEntity | null;
}

interface EntityLinksSectionProps {
  entityType: EntityType;
  entityId: string;
  initialLinks: LinkData[];
}

export function EntityLinksSection({
  entityType,
  entityId,
  initialLinks,
}: EntityLinksSectionProps) {
  // Separate outgoing and incoming links
  const outgoingLinks = initialLinks.filter(
    (link) => link.fromType === entityType && link.fromId === entityId
  );

  const incomingLinks = initialLinks.filter(
    (link) => link.toType === entityType && link.toId === entityId
  );

  const totalLinks = initialLinks.length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <LinkIcon className="h-4 w-4" />
            Links ({totalLinks})
          </CardTitle>
          <AddLinkDialog fromType={entityType} fromId={entityId} />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Outgoing Links */}
        {outgoingLinks.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Outgoing Links</h4>
            <div className="space-y-2">
              {outgoingLinks.map((link) => (
                <LinkCard
                  key={link.id}
                  linkId={link.id}
                  relationship={link.relationship}
                  entity={link.toEntity}
                  direction="from"
                />
              ))}
            </div>
          </div>
        )}

        {/* Separator between sections */}
        {outgoingLinks.length > 0 && incomingLinks.length > 0 && <Separator />}

        {/* Incoming Links */}
        {incomingLinks.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Incoming Links</h4>
            <div className="space-y-2">
              {incomingLinks.map((link) => (
                <LinkCard
                  key={link.id}
                  linkId={link.id}
                  relationship={link.relationship}
                  entity={link.fromEntity}
                  direction="to"
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {totalLinks === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <LinkIcon className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm">No links yet. Create connections to related items.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
