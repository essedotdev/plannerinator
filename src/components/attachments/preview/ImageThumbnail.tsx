"use client";

import { useState } from "react";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Attachment } from "@/db/schema";
import { useImagePreview } from "../hooks/useImagePreview";

interface ImageThumbnailProps {
  attachment: Attachment;
  className?: string;
  onClick?: () => void;
  square?: boolean;
}

export function ImageThumbnail({
  attachment,
  className,
  onClick,
  square = false,
}: ImageThumbnailProps) {
  const [imageError, setImageError] = useState(false);
  const { previewUrl, isLoading, error } = useImagePreview(attachment);

  if (!previewUrl || error || imageError) {
    return null; // Fallback to icon in AttachmentCard
  }

  return (
    <div
      className={cn(
        "relative rounded-lg overflow-hidden bg-muted cursor-pointer group",
        square ? "aspect-square" : "w-full aspect-video",
        className
      )}
      onClick={onClick}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Browser automatically resizes via CSS */}
      <Image
        src={previewUrl}
        alt={attachment.fileName}
        fill
        className={cn("object-cover transition-transform duration-200", "group-hover:scale-105")}
        onError={() => setImageError(true)}
      />

      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
    </div>
  );
}
