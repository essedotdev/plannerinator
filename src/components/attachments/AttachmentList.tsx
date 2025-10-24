"use client";

import { useState, useTransition, useCallback } from "react";
import {
  File,
  FileText,
  FileImage,
  FileSpreadsheet,
  FileVideo,
  FileAudio,
  FileArchive,
  Download,
  Trash2,
  Loader2,
  Paperclip,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";
import { toast } from "sonner";
import { formatShortDate } from "@/lib/dates";
import { formatBytes, getFileCategory } from "@/features/attachments/schema";
import type { Attachment } from "@/db/schema";
import { deleteAttachment, getAttachmentDownloadUrl } from "@/features/attachments/actions";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/common";

interface AttachmentListProps {
  attachments: Attachment[];
  onDelete?: () => void;
  onFileDrop?: (files: File[]) => void;
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

function AttachmentCard({
  attachment,
  onDelete,
}: {
  attachment: Attachment;
  onDelete?: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isDownloading, setIsDownloading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const Icon = getFileIcon(attachment.mimeType);
  const colorClass = getFileColorClass(attachment.mimeType);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const { downloadUrl } = await getAttachmentDownloadUrl(attachment.id);

      // Create temporary link and trigger download
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

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* File Icon */}
          <div className={`flex-shrink-0 p-2 rounded-lg ${colorClass}`}>
            <Icon className="h-5 w-5" />
          </div>

          {/* File Info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{attachment.fileName}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-muted-foreground">
                {formatBytes(attachment.fileSize)}
              </span>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground">
                {formatShortDate(attachment.createdAt)}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex-shrink-0 flex gap-1">
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

export function AttachmentList({ attachments, onDelete, onFileDrop }: AttachmentListProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (onFileDrop) {
        setIsDragging(true);
      }
    },
    [onFileDrop]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Check if we're leaving the drop zone element itself
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    if (x <= rect.left || x >= rect.right || y <= rect.top || y >= rect.bottom) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0 && onFileDrop) {
        onFileDrop(files);
      }
    },
    [onFileDrop]
  );

  if (attachments.length === 0) {
    return (
      <div
        className="relative text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg transition-colors"
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        style={{
          borderColor: isDragging ? "hsl(var(--primary))" : undefined,
          backgroundColor: isDragging ? "hsl(var(--primary) / 0.05)" : undefined,
        }}
      >
        {isDragging ? (
          <>
            <Paperclip className="h-12 w-12 mx-auto mb-2 text-primary" />
            <p className="text-sm font-medium text-primary">Drop files here</p>
            <p className="text-xs mt-1 text-primary/70">Release to upload</p>
          </>
        ) : (
          <>
            <File className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No attachments yet</p>
            {onFileDrop && <p className="text-xs mt-1">Drag files here to upload</p>}
          </>
        )}
      </div>
    );
  }

  return (
    <div
      className="relative"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Drag Overlay */}
      {isDragging && (
        <div className="absolute inset-0 bg-primary/5 border-2 border-primary border-dashed rounded-lg z-10 flex items-center justify-center">
          <div className="text-center">
            <Paperclip className="h-12 w-12 mx-auto mb-2 text-primary" />
            <p className="text-lg font-medium text-primary">Drop files here</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {attachments.map((attachment) => (
          <AttachmentCard key={attachment.id} attachment={attachment} onDelete={onDelete} />
        ))}
      </div>
    </div>
  );
}
