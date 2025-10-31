"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { getAttachmentDownloadUrl } from "@/features/attachments/actions";
import type { Attachment } from "@/db/schema";
import { isPDFMimeType } from "@/features/attachments/schema";

interface PreviewUrlCache {
  url: string;
  expiresAt: number;
}

// Cache URLs for 50 min (expire at 60 min)
const previewUrlCache = new Map<string, PreviewUrlCache>();

export function usePDFPreview(attachment: Attachment) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canPreview = useMemo(() => {
    return isPDFMimeType(attachment.mimeType);
  }, [attachment.mimeType]);

  const generatePreviewUrl = useCallback(async () => {
    if (!canPreview) {
      setError("Not a PDF");
      return null;
    }

    // Check cache
    const cached = previewUrlCache.get(attachment.id);
    if (cached && cached.expiresAt > Date.now()) {
      setPreviewUrl(cached.url);
      return cached.url;
    }

    // Generate new URL (reuse existing action)
    setIsLoading(true);
    setError(null);

    try {
      const { downloadUrl } = await getAttachmentDownloadUrl(attachment.id);

      // Cache for 50 minutes
      previewUrlCache.set(attachment.id, {
        url: downloadUrl,
        expiresAt: Date.now() + 50 * 60 * 1000,
      });

      setPreviewUrl(downloadUrl);
      return downloadUrl;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load PDF";
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [attachment.id, canPreview]);

  // Auto-generate URL on mount
  useEffect(() => {
    if (canPreview && !previewUrl && !isLoading) {
      generatePreviewUrl();
    }
  }, [canPreview, previewUrl, isLoading, generatePreviewUrl]);

  return {
    canPreview,
    previewUrl,
    isLoading,
    error,
    generatePreviewUrl,
  };
}
