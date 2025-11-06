"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Attachment } from "@/db/schema";
import { getAttachmentDownloadUrl } from "@/features/attachments/actions";
import { formatBytes } from "@/features/attachments/schema";
import { formatShortDate } from "@/lib/dates";
import { ChevronLeft, ChevronRight, Download, Loader2, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { usePDFPreview } from "../hooks/use-pdf-preview";

interface PDFPreviewModalProps {
  attachment: Attachment;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  allAttachments?: Attachment[];
  onNavigate?: (direction: "prev" | "next") => void;
}

export function PDFPreviewModal({
  attachment,
  open,
  onOpenChange,
  allAttachments = [],
  onNavigate,
}: PDFPreviewModalProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [isFetchingBlob, setIsFetchingBlob] = useState(false);
  const { previewUrl, isLoading, error } = usePDFPreview(attachment);

  // Fetch PDF as blob to avoid download header issues
  useEffect(() => {
    if (!previewUrl || error) {
      setBlobUrl(null);
      return;
    }

    let objectUrl: string | null = null;

    const fetchPDFBlob = async () => {
      setIsFetchingBlob(true);
      try {
        const response = await fetch(previewUrl);
        if (!response.ok) throw new Error("Failed to fetch PDF");

        const blob = await response.blob();
        objectUrl = URL.createObjectURL(blob);
        setBlobUrl(objectUrl);
      } catch (err) {
        console.error("Error fetching PDF blob:", err);
        toast.error("Failed to load PDF preview");
      } finally {
        setIsFetchingBlob(false);
      }
    };

    fetchPDFBlob();

    // Cleanup blob URL when attachment changes or component unmounts
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [previewUrl, error, attachment.id]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onOpenChange(false);
      } else if (e.key === "ArrowLeft" && onNavigate) {
        e.preventDefault();
        onNavigate("prev");
      } else if (e.key === "ArrowRight" && onNavigate) {
        e.preventDefault();
        onNavigate("next");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange, onNavigate]);

  const handleDownload = useCallback(async () => {
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
    } catch (err) {
      console.error("Download error:", err);
      toast.error(err instanceof Error ? err.message : "Failed to download file");
    } finally {
      setIsDownloading(false);
    }
  }, [attachment.id, attachment.fileName]);

  // Get current index for navigation
  const currentIndex = allAttachments.findIndex((att) => att.id === attachment.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < allAttachments.length - 1;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[95vw] sm:max-w-[95vw] w-full h-[95vh] flex flex-col p-0 gap-0"
        showCloseButton={false}
      >
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-lg font-semibold truncate">
                {attachment.fileName}
              </DialogTitle>
              <DialogDescription className="flex items-center gap-3 mt-1">
                <span>{formatShortDate(attachment.createdAt)}</span>
                <span>•</span>
                <span>{formatBytes(attachment.fileSize)}</span>
              </DialogDescription>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Download button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                disabled={isDownloading}
                title="Download PDF"
              >
                {isDownloading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </>
                )}
              </Button>

              {/* Close button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                title="Close (Esc)"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* PDF Viewer */}
        <div className="flex-1 relative bg-muted overflow-hidden">
          {(isLoading || isFetchingBlob) && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-destructive font-medium">Failed to load PDF</p>
                <p className="text-sm text-muted-foreground mt-1">{error}</p>
              </div>
            </div>
          )}

          {blobUrl && !error && (
            <iframe
              src={`${blobUrl}#toolbar=1&navpanes=1&scrollbar=1`}
              className="w-full h-full border-0"
              title={attachment.fileName}
            />
          )}
        </div>

        {/* Navigation controls */}
        {onNavigate && allAttachments.length > 1 && (
          <div className="absolute top-1/2 left-4 right-4 flex items-center justify-between pointer-events-none">
            <Button
              variant="secondary"
              size="icon"
              className="rounded-full shadow-lg pointer-events-auto"
              onClick={() => onNavigate("prev")}
              disabled={!hasPrev}
              title="Previous (←)"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>

            <Button
              variant="secondary"
              size="icon"
              className="rounded-full shadow-lg pointer-events-auto"
              onClick={() => onNavigate("next")}
              disabled={!hasNext}
              title="Next (→)"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        )}

        {/* Counter */}
        {allAttachments.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-medium shadow-lg">
            {currentIndex + 1} / {allAttachments.length}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
