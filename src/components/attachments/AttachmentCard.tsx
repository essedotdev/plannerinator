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
import { formatBytes, getFileCategory, isImageMimeType } from "@/features/attachments/schema";
import { formatShortDate } from "@/lib/dates";
import {
  Download,
  Eye,
  File,
  FileArchive,
  FileAudio,
  FileImage,
  FileSpreadsheet,
  FileText,
  FileVideo,
  Loader2,
  MoreVertical,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { ImageThumbnail } from "./preview/ImageThumbnail";

interface AttachmentCardProps {
  attachment: Attachment;
  onDelete?: () => void;
  onPreview?: (attachment: Attachment) => void;
}

/**
 * Get icon for file type
 */
function getFileIcon(mimeType: string) {
  const category = getFileCategory(mimeType);
  switch (category) {
    case "image":
      return FileImage;
    case "document":
    case "presentation":
      return FileText;
    case "spreadsheet":
      return FileSpreadsheet;
    case "video":
      return FileVideo;
    case "audio":
      return FileAudio;
    case "archive":
      return FileArchive;
    default:
      return File;
  }
}

/**
 * Get color class for file type
 */
function getFileColorClass(mimeType: string): string {
  const category = getFileCategory(mimeType);
  switch (category) {
    case "image":
      return "text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-950";
    case "document":
      return "text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-950";
    case "spreadsheet":
      return "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-950";
    case "presentation":
      return "text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-950";
    case "video":
      return "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-950";
    case "audio":
      return "text-pink-600 bg-pink-100 dark:text-pink-400 dark:bg-pink-950";
    case "archive":
      return "text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-950";
    default:
      return "text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800";
  }
}

export function AttachmentCard({ attachment, onDelete, onPreview }: AttachmentCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isDownloading, setIsDownloading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const Icon = getFileIcon(attachment.mimeType);
  const colorClass = getFileColorClass(attachment.mimeType);
  const isImage = isImageMimeType(attachment.mimeType);

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
        router.refresh();
        onDelete?.();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to delete attachment");
      }
    });
  };

  const handleCardClick = () => {
    if (isImage && onPreview) {
      onPreview(attachment);
    }
  };

  return (
    <Card className="py-0">
      <CardContent className="p-4 pe-2">
        <div className="flex items-start gap-3">
          {/* Image Thumbnail OR File Icon */}
          {isImage ? (
            <ImageThumbnail
              attachment={attachment}
              className="w-24 h-24 shrink-0"
              onClick={handleCardClick}
              square
            />
          ) : (
            <div
              className={`w-24 h-24 shrink-0 flex items-center justify-center rounded-lg ${colorClass}`}
            >
              <Icon className="h-8 w-8" />
            </div>
          )}

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
                {isImage && onPreview && (
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
