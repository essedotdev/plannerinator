"use client";

import { ConfirmDialog } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Attachment } from "@/db/schema";
import { deleteAttachment, getAttachmentDownloadUrl } from "@/features/attachments/actions";
import { formatBytes } from "@/features/attachments/schema";
import { canPreview } from "@/features/attachments/preview-config";
import { formatShortDate } from "@/lib/dates";
import { Download, Eye, Loader2, MoreVertical, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { AttachmentThumbnail } from "./preview/AttachmentThumbnail";

interface AttachmentCardProps {
  attachment: Attachment;
  onDelete?: () => void;
  onPreview?: (attachment: Attachment) => void;
}

export function AttachmentCard({ attachment, onDelete, onPreview }: AttachmentCardProps) {
  const [isPending, startTransition] = useTransition();
  const [isDownloading, setIsDownloading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const hasPreview = canPreview(attachment.mimeType);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const { downloadUrl } = await getAttachmentDownloadUrl(attachment.id);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = attachment.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Download started");
    } catch (error) {
      console.error("Download error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to download file");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setShowDeleteDialog(false);
    startTransition(async () => {
      try {
        await deleteAttachment(attachment.id);
        toast.success("Attachment deleted");
        onDelete?.();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to delete attachment");
      }
    });
  };

  const handleCardClick = () => {
    if (hasPreview && onPreview) {
      onPreview(attachment);
    }
  };

  return (
    <Card className="py-0">
      <CardContent className="p-4 pe-2">
        <div className="flex items-start gap-3">
          {/* Attachment Thumbnail (preview or icon-based) */}
          <AttachmentThumbnail
            attachment={attachment}
            className="w-24 h-24 shrink-0"
            onClick={hasPreview ? handleCardClick : undefined}
            square
          />

          {/* File Info */}
          <div className="flex-1 min-w-0 flex flex-col gap-1">
            <p className="text-sm font-medium truncate">{attachment.fileName}</p>
            <span className="text-xs text-muted-foreground">
              {formatShortDate(attachment.createdAt)}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatBytes(attachment.fileSize)}
            </span>
          </div>

          {/* Actions */}
          <div className="shrink-0 flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDownload}
              disabled={isDownloading || isPending}
              title="Download"
            >
              {isDownloading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" disabled={isPending}>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {hasPreview && onPreview && (
                  <>
                    <DropdownMenuItem onClick={handleCardClick}>
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem onClick={handleDownload} disabled={isDownloading}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={isPending}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDeleteConfirm}
        title="Delete Attachment"
        description={`Are you sure you want to delete "${attachment.fileName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </Card>
  );
}
