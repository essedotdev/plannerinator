"use client";

import { useRef, useState } from "react";
import { FileUpload, type FileUploadRef } from "./FileUpload";
import { AttachmentList } from "./AttachmentList";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { AttachmentEntityType } from "@/features/attachments/schema";
import type { Attachment } from "@/db/schema";
import { Paperclip, Upload, Download } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getAttachmentDownloadUrl } from "@/features/attachments/actions";
import { toast } from "sonner";

interface AttachmentsSectionProps {
  entityType: AttachmentEntityType;
  entityId: string;
  initialAttachments: Attachment[];
  title?: string;
  maxFiles?: number;
}

export function AttachmentsSection({
  entityType,
  entityId,
  initialAttachments,
  title = "Attachments",
  maxFiles = 5,
}: AttachmentsSectionProps) {
  const router = useRouter();
  const fileUploadRef = useRef<FileUploadRef>(null);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);

  const handleUploadComplete = () => {
    router.refresh();
  };

  const handleDelete = () => {
    router.refresh();
  };

  const handleUploadClick = () => {
    fileUploadRef.current?.triggerFileSelect();
  };

  const handleDownloadAll = async () => {
    if (initialAttachments.length === 0) return;

    setIsDownloadingAll(true);
    toast.info(
      `Downloading ${initialAttachments.length} file${initialAttachments.length > 1 ? "s" : ""}...`
    );

    try {
      for (const attachment of initialAttachments) {
        try {
          const { downloadUrl } = await getAttachmentDownloadUrl(attachment.id);

          // Create temporary link and trigger download
          const link = document.createElement("a");
          link.href = downloadUrl;
          link.download = attachment.fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          // Small delay between downloads to avoid browser blocking
          await new Promise((resolve) => setTimeout(resolve, 500));
        } catch (error) {
          console.error(`Failed to download ${attachment.fileName}:`, error);
          toast.error(`Failed to download ${attachment.fileName}`);
        }
      }

      toast.success("All files downloaded");
    } catch {
      toast.error("Failed to download all files");
    } finally {
      setIsDownloadingAll(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Paperclip className="h-5 w-5" />
            {title}
            {initialAttachments.length > 0 && (
              <span className="text-sm font-normal text-muted-foreground">
                ({initialAttachments.length})
              </span>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {initialAttachments.length > 0 && (
              <Button
                onClick={handleDownloadAll}
                variant="outline"
                size="sm"
                disabled={isDownloadingAll}
              >
                <Download className="h-4 w-4 mr-2" />
                {isDownloadingAll ? "Downloading..." : "Download All"}
              </Button>
            )}
            <Button onClick={handleUploadClick} variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Upload Files
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Hidden File Upload Component */}
        <FileUpload
          ref={fileUploadRef}
          entityType={entityType}
          entityId={entityId}
          onUploadComplete={handleUploadComplete}
          maxFiles={maxFiles}
        />

        {/* Attachments List with Drag & Drop */}
        <AttachmentList
          attachments={initialAttachments}
          onDelete={handleDelete}
          onFileDrop={(files) => fileUploadRef.current?.handleFiles(files)}
        />
      </CardContent>
    </Card>
  );
}
