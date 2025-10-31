"use client";

import { getPreviewType } from "@/features/attachments/preview-config";
import type { Attachment } from "@/db/schema";
import { useImagePreview } from "./useImagePreview";

/**
 * Generic hook for attachment previews
 *
 * This hook delegates to type-specific preview hooks based on the attachment's MIME type.
 * It provides a unified interface for all preview types.
 *
 * To add a new preview type:
 * 1. Create a new hook (e.g., usePDFPreview)
 * 2. Add a case in the switch statement below
 * 3. Ensure the new hook returns the same interface
 */

interface AttachmentPreviewResult {
  canPreview: boolean;
  previewUrl: string | null;
  isLoading: boolean;
  error: string | null;
  generatePreviewUrl: () => Promise<string | null>;
}

export function useAttachmentPreview(attachment: Attachment | null): AttachmentPreviewResult {
  const previewType = attachment ? getPreviewType(attachment.mimeType) : null;

  // Delegate to type-specific hooks
  // When adding new types (e.g., PDF, video), add cases here
  const imagePreview = useImagePreview(attachment!);

  if (!attachment || !previewType) {
    // No preview available
    return {
      canPreview: false,
      previewUrl: null,
      isLoading: false,
      error: null,
      generatePreviewUrl: async () => null,
    };
  }

  if (previewType === "image") {
    return imagePreview;
  }

  // Future preview types:
  // if (previewType === 'pdf') {
  //   return usePDFPreview(attachment);
  // }
  // if (previewType === 'video') {
  //   return useVideoPreview(attachment);
  // }

  // Fallback (should never reach here if config is correct)
  return {
    canPreview: false,
    previewUrl: null,
    isLoading: false,
    error: null,
    generatePreviewUrl: async () => null,
  };
}
