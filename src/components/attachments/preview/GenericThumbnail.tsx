"use client";

import { cn } from "@/lib/utils";
import type { Attachment } from "@/db/schema";
import { getFileCategory } from "@/features/attachments/schema";
import {
  File,
  FileArchive,
  FileAudio,
  FileImage,
  FileSpreadsheet,
  FileText,
  FileVideo,
} from "lucide-react";

interface GenericThumbnailProps {
  attachment: Attachment;
  className?: string;
  onClick?: () => void;
}

/**
 * Generic file icon thumbnail for non-previewable files
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
    case "text":
      return "text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-950";
    default:
      return "text-slate-600 bg-slate-100 dark:text-slate-400 dark:bg-slate-950";
  }
}

export function GenericThumbnail({ attachment, className, onClick }: GenericThumbnailProps) {
  const Icon = getFileIcon(attachment.mimeType);
  const colorClass = getFileColorClass(attachment.mimeType);

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-lg",
        colorClass,
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      <Icon className="h-8 w-8" />
    </div>
  );
}
