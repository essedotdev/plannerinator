"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Attachment } from "@/db/schema";
import { getAttachmentDownloadUrl, getAttachmentImageData } from "@/features/attachments/actions";
import { formatBytes } from "@/features/attachments/schema";
import { formatShortDate } from "@/lib/dates";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  Loader2,
  RotateCw,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useImagePreview } from "../hooks/useImagePreview";

interface ImagePreviewModalProps {
  attachment: Attachment;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  allImages?: Attachment[];
  onNavigate?: (direction: "prev" | "next") => void;
}

export function ImagePreviewModal({
  attachment,
  open,
  onOpenChange,
  allImages = [],
  onNavigate,
}: ImagePreviewModalProps) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const { previewUrl, isLoading, error } = useImagePreview(attachment);

  // Reset zoom, rotation and position when attachment changes
  useEffect(() => {
    setZoom(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  }, [attachment.id]);

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
      } else if (e.key === "+" || e.key === "=") {
        e.preventDefault();
        setZoom((z) => Math.min(z + 0.25, 3));
      } else if (e.key === "-" || e.key === "_") {
        e.preventDefault();
        setZoom((z) => Math.max(z - 0.25, 0.5));
      } else if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        setRotation((r) => (r + 90) % 360);
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
    } catch {
      toast.error("Failed to download image");
    } finally {
      setIsDownloading(false);
    }
  }, [attachment]);

  const handleCopy = useCallback(async () => {
    setIsCopying(true);
    try {
      // Fetch image data from server (bypasses CORS)
      const { dataUrl } = await getAttachmentImageData(attachment.id);

      // Convert data URL to blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();

      // Copy to clipboard
      await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
      toast.success("Image copied to clipboard");
    } catch (error) {
      console.error("Copy error:", error);
      toast.error("Failed to copy image");
    } finally {
      setIsCopying(false);
    }
  }, [attachment.id]);

  // Pan & Drag handlers
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (zoom <= 1) return; // Only allow drag when zoomed
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    },
    [zoom, position]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    },
    [isDragging, dragStart]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const currentIndex = allImages.findIndex((img) => img.id === attachment.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < allImages.length - 1;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[95vw] sm:max-w-[95vw] w-full h-[95vh] p-0 gap-0"
        showCloseButton={false}
      >
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b flex-row items-center justify-between space-y-0">
          <div className="flex-1 min-w-0">
            <DialogTitle className="truncate text-base">{attachment.fileName}</DialogTitle>
            <DialogDescription className="sr-only">
              Image preview modal with zoom, rotate, and navigation controls
            </DialogDescription>
            <p className="text-xs text-muted-foreground mt-1">
              {formatBytes(attachment.fileSize)} • {formatShortDate(attachment.createdAt)}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setZoom((z) => Math.max(z - 0.25, 0.5))}
              disabled={zoom <= 0.5}
              title="Zoom out (-)"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setZoom((z) => Math.min(z + 0.25, 3))}
              disabled={zoom >= 3}
              title="Zoom in (+)"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setRotation((r) => (r + 90) % 360)}
              title="Rotate (R)"
            >
              <RotateCw className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopy}
              disabled={isCopying}
              title="Copy"
            >
              {isCopying ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleDownload}
              disabled={isDownloading}
              title="Download"
            >
              {isDownloading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              title="Close (Esc)"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Image Container */}
        <div
          className="flex-1 relative overflow-hidden bg-muted/30 flex items-center justify-center"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          style={{
            cursor: zoom > 1 ? (isDragging ? "grabbing" : "grab") : "default",
          }}
        >
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}

          {error && (
            <div className="text-center">
              <p className="text-destructive">{error}</p>
            </div>
          )}

          {previewUrl && !error && (
            <Image
              src={previewUrl}
              alt={attachment.fileName}
              width={1920}
              height={1080}
              unoptimized
              className={cn(
                "max-w-full max-h-full w-auto h-auto object-contain",
                isDragging ? "transition-none" : "transition-transform duration-200",
                isLoading && "opacity-0"
              )}
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${zoom}) rotate(${rotation}deg)`,
              }}
              draggable={false}
            />
          )}

          {/* Navigation Arrows */}
          {onNavigate && (
            <>
              {hasPrev && (
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur"
                  onClick={() => onNavigate("prev")}
                  title="Previous (←)"
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
              )}

              {hasNext && (
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur"
                  onClick={() => onNavigate("next")}
                  title="Next (→)"
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              )}
            </>
          )}
        </div>

        {/* Footer with counter */}
        {allImages.length > 1 && (
          <div className="px-6 py-3 border-t text-center text-sm text-muted-foreground">
            {currentIndex + 1} / {allImages.length}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
