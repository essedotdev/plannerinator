"use client";

import { useState, useCallback } from "react";
import { File, Paperclip } from "lucide-react";
import type { Attachment } from "@/db/schema";
import { AttachmentCard } from "./AttachmentCard";
import { ImagePreviewModal } from "./preview/ImagePreviewModal";
import { isImageMimeType } from "@/features/attachments/schema";

interface AttachmentListProps {
  attachments: Attachment[];
  onDelete?: () => void;
  onFileDrop?: (files: File[]) => void;
}

export function AttachmentList({ attachments, onDelete, onFileDrop }: AttachmentListProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [previewAttachment, setPreviewAttachment] = useState<Attachment | null>(null);

  // Filter images for preview navigation
  const imageAttachments = attachments.filter((att) => isImageMimeType(att.mimeType));

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

  const handleNavigate = useCallback(
    (direction: "prev" | "next") => {
      if (!previewAttachment) return;

      const currentIndex = imageAttachments.findIndex((img) => img.id === previewAttachment.id);

      if (direction === "prev" && currentIndex > 0) {
        setPreviewAttachment(imageAttachments[currentIndex - 1]);
      } else if (direction === "next" && currentIndex < imageAttachments.length - 1) {
        setPreviewAttachment(imageAttachments[currentIndex + 1]);
      }
    },
    [previewAttachment, imageAttachments]
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
    <>
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
            <AttachmentCard
              key={attachment.id}
              attachment={attachment}
              onDelete={onDelete}
              onPreview={setPreviewAttachment}
            />
          ))}
        </div>
      </div>

      {/* Image Preview Modal */}
      {previewAttachment && (
        <ImagePreviewModal
          attachment={previewAttachment}
          open={!!previewAttachment}
          onOpenChange={(open) => !open && setPreviewAttachment(null)}
          allImages={imageAttachments}
          onNavigate={imageAttachments.length > 1 ? handleNavigate : undefined}
        />
      )}
    </>
  );
}
