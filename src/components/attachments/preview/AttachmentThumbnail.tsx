"use client";

import { getPreviewType } from "@/features/attachments/preview-config";
import type { Attachment } from "@/db/schema";
import { ImageThumbnail } from "./ImageThumbnail";
import { GenericThumbnail } from "./GenericThumbnail";

/**
 * Generic wrapper for attachment thumbnails
 *
 * This component delegates to type-specific thumbnail components based on the attachment's MIME type.
 * Falls back to GenericThumbnail (icon-based) for non-previewable files.
 *
 * To add a new preview type:
 * 1. Import the new thumbnail component (e.g., PDFThumbnail)
 * 2. Add a case in the conditional rendering below
 * 3. Ensure the new thumbnail accepts the same props interface
 */

interface AttachmentThumbnailProps {
  attachment: Attachment;
  className?: string;
  onClick?: () => void;
  square?: boolean;
}

export function AttachmentThumbnail({
  attachment,
  className,
  onClick,
  square = false,
}: AttachmentThumbnailProps) {
  const previewType = getPreviewType(attachment.mimeType);

  // Delegate to type-specific thumbnails
  if (previewType === "image") {
    return (
      <ImageThumbnail
        attachment={attachment}
        className={className}
        onClick={onClick}
        square={square}
      />
    );
  }

  // Future preview types:
  // if (previewType === 'pdf') {
  //   return (
  //     <PDFThumbnail
  //       attachment={attachment}
  //       className={className}
  //       onClick={onClick}
  //       square={square}
  //     />
  //   );
  // }

  // if (previewType === 'video') {
  //   return (
  //     <VideoThumbnail
  //       attachment={attachment}
  //       className={className}
  //       onClick={onClick}
  //       square={square}
  //     />
  //   );
  // }

  // Fallback: generic icon-based thumbnail
  return <GenericThumbnail attachment={attachment} className={className} onClick={onClick} />;
}
