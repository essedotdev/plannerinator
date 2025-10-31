import { isImageMimeType, isPDFMimeType } from "./schema";

/**
 * Preview configuration for different file types
 *
 * This centralizes the logic for determining which files can be previewed
 * and which components to use for thumbnails and fullscreen modals.
 */

export interface PreviewConfig {
  canPreview: (mimeType: string) => boolean;
  thumbnailComponent: string;
  modalComponent: string;
}

/**
 * Registry of preview types
 *
 * To add a new preview type:
 * 1. Add MIME type helper function in schema.ts (if needed)
 * 2. Add entry here with component names
 * 3. Create the preview components
 * 4. Add conditional rendering in wrapper components
 */
export const PREVIEW_TYPES = {
  image: {
    canPreview: isImageMimeType,
    thumbnailComponent: "ImageThumbnail",
    modalComponent: "ImagePreviewModal",
  },
  pdf: {
    canPreview: isPDFMimeType,
    thumbnailComponent: "PDFThumbnail",
    modalComponent: "PDFPreviewModal",
  },
  // Future preview types:
  // video: {
  //   canPreview: isVideoMimeType,
  //   thumbnailComponent: 'VideoThumbnail',
  //   modalComponent: 'VideoPreviewModal'
  // }
} as const;

/**
 * Check if a file type can be previewed
 */
export function canPreview(mimeType: string): boolean {
  return Object.values(PREVIEW_TYPES).some((config) => config.canPreview(mimeType));
}

/**
 * Get the preview type for a given MIME type
 * Returns null if the file cannot be previewed
 */
export function getPreviewType(mimeType: string): keyof typeof PREVIEW_TYPES | null {
  const entry = Object.entries(PREVIEW_TYPES).find(([, config]) => config.canPreview(mimeType));
  return entry ? (entry[0] as keyof typeof PREVIEW_TYPES) : null;
}
