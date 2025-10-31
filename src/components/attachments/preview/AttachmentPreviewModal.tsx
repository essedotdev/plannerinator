"use client";

import { getPreviewType } from "@/features/attachments/preview-config";
import type { Attachment } from "@/db/schema";
import { ImagePreviewModal } from "./ImagePreviewModal";

/**
 * Generic wrapper for attachment preview modals
 *
 * This component delegates to type-specific preview modals based on the attachment's MIME type.
 * It provides a unified interface for all preview types.
 *
 * To add a new preview type:
 * 1. Import the new modal component (e.g., PDFPreviewModal)
 * 2. Add a case in the conditional rendering below
 * 3. Ensure the new modal accepts the same props interface
 */

interface AttachmentPreviewModalProps {
  attachment: Attachment;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  allAttachments?: Attachment[];
  onNavigate?: (direction: "prev" | "next") => void;
}

export function AttachmentPreviewModal({
  attachment,
  open,
  onOpenChange,
  allAttachments = [],
  onNavigate,
}: AttachmentPreviewModalProps) {
  const previewType = getPreviewType(attachment.mimeType);

  // No preview available
  if (!previewType) {
    return null;
  }

  // Delegate to type-specific modals
  if (previewType === "image") {
    return (
      <ImagePreviewModal
        attachment={attachment}
        open={open}
        onOpenChange={onOpenChange}
        allImages={allAttachments}
        onNavigate={onNavigate}
      />
    );
  }

  // Future preview types:
  // if (previewType === 'pdf') {
  //   return (
  //     <PDFPreviewModal
  //       attachment={attachment}
  //       open={open}
  //       onOpenChange={onOpenChange}
  //       allAttachments={allAttachments}
  //       onNavigate={onNavigate}
  //     />
  //   );
  // }

  // if (previewType === 'video') {
  //   return (
  //     <VideoPreviewModal
  //       attachment={attachment}
  //       open={open}
  //       onOpenChange={onOpenChange}
  //       allAttachments={allAttachments}
  //       onNavigate={onNavigate}
  //     />
  //   );
  // }

  // Fallback (should never reach here if config is correct)
  return null;
}
