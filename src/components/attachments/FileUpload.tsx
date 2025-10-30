"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { confirmAttachmentUpload, generateUploadUrl } from "@/features/attachments/actions";
import {
  formatBytes,
  validateFileForUpload,
  type AttachmentEntityType,
} from "@/features/attachments/schema";
import { Loader2, X } from "lucide-react";
import { forwardRef, useCallback, useImperativeHandle, useRef, useState } from "react";
import { toast } from "sonner";

interface FileUploadProps {
  entityType: AttachmentEntityType;
  entityId: string;
  onUploadComplete?: () => void;
  onFilesSelected?: (files: File[]) => void;
  maxFiles?: number;
  className?: string;
}

interface UploadingFile {
  file: File;
  progress: number;
  status: "pending" | "uploading" | "processing" | "complete" | "error";
  error?: string;
}

export interface FileUploadRef {
  handleFiles: (files: File[]) => void;
  triggerFileSelect: () => void;
}

export const FileUpload = forwardRef<FileUploadRef, FileUploadProps>(function FileUpload(
  { entityType, entityId, onUploadComplete, onFilesSelected, maxFiles = 5, className },
  ref
) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(
    async (file: File) => {
      // Add to uploading files
      setUploadingFiles((prev) => [...prev, { file, progress: 0, status: "pending" }]);

      try {
        // Validate file
        const validation = validateFileForUpload(file);
        if (!validation.valid) {
          throw new Error(validation.error);
        }

        // Update status to uploading
        setUploadingFiles((prev) =>
          prev.map((f) =>
            f.file === file ? { ...f, status: "uploading" as const, progress: 10 } : f
          )
        );

        // Step 1: Generate presigned upload URL
        const { uploadUrl, storageKey } = await generateUploadUrl({
          entityType,
          entityId,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          metadata: {},
        });

        // Update progress
        setUploadingFiles((prev) =>
          prev.map((f) => (f.file === file ? { ...f, progress: 30 } : f))
        );

        // Step 2: Upload file to R2 using presigned URL
        const uploadResponse = await fetch(uploadUrl, {
          method: "PUT",
          body: file,
          headers: {
            "Content-Type": file.type,
          },
        });

        if (!uploadResponse.ok) {
          throw new Error(`Upload failed: ${uploadResponse.statusText}`);
        }

        // Update progress
        setUploadingFiles((prev) =>
          prev.map((f) =>
            f.file === file ? { ...f, status: "processing" as const, progress: 70 } : f
          )
        );

        // Step 3: Confirm upload and save metadata to database
        await confirmAttachmentUpload({
          entityType,
          entityId,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          storageKey,
          metadata: {},
        });

        // Update status to complete
        setUploadingFiles((prev) =>
          prev.map((f) =>
            f.file === file ? { ...f, status: "complete" as const, progress: 100 } : f
          )
        );

        toast.success(`File "${file.name}" uploaded successfully`);

        // Remove from list after 2 seconds
        setTimeout(() => {
          setUploadingFiles((prev) => prev.filter((f) => f.file !== file));
          onUploadComplete?.();
        }, 2000);
      } catch (error) {
        console.error("Upload error:", error);
        const errorMessage = error instanceof Error ? error.message : "Upload failed";

        setUploadingFiles((prev) =>
          prev.map((f) =>
            f.file === file
              ? { ...f, status: "error" as const, progress: 0, error: errorMessage }
              : f
          )
        );

        toast.error(errorMessage);
      }
    },
    [entityType, entityId, onUploadComplete]
  );

  // Expose upload function to parent component
  const handleFiles = useCallback(
    (files: File[]) => {
      if (files.length > maxFiles) {
        toast.error(`Maximum ${maxFiles} files allowed`);
        return;
      }

      files.forEach((file) => uploadFile(file));
      onFilesSelected?.(files);
    },
    [maxFiles, onFilesSelected, uploadFile]
  );

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Expose handleFiles to parent via ref
  useImperativeHandle(ref, () => ({
    handleFiles,
    triggerFileSelect: handleClick,
  }));

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files ? Array.from(e.target.files) : [];
      handleFiles(files);

      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [handleFiles]
  );

  const handleRemoveFile = useCallback((file: File) => {
    setUploadingFiles((prev) => prev.filter((f) => f.file !== file));
  }, []);

  return (
    <div className={className}>
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.md,.csv,.zip,.rar,.7z,.png,.jpg,.jpeg,.gif,.webp,.svg,.mp4,.mpeg,.mov,.webm,.mp3,.wav,.ogg"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Uploading Files List */}
      {uploadingFiles.length > 0 && (
        <div className="mb-4 space-y-2">
          {uploadingFiles.map((uploadFile, index) => (
            <Card key={`${uploadFile.file.name}-${index}`} className="p-3">
              <div className="flex items-center gap-3">
                {/* Status Icon */}
                <div className="shrink-0">
                  {uploadFile.status === "uploading" || uploadFile.status === "processing" ? (
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  ) : uploadFile.status === "complete" ? (
                    <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  ) : uploadFile.status === "error" ? (
                    <div className="h-5 w-5 rounded-full bg-red-500 flex items-center justify-center">
                      <span className="text-white text-xs">✗</span>
                    </div>
                  ) : null}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{uploadFile.file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatBytes(uploadFile.file.size)}
                  </p>

                  {uploadFile.status === "error" && uploadFile.error && (
                    <p className="text-xs text-destructive mt-1">{uploadFile.error}</p>
                  )}

                  {/* Progress Bar */}
                  {(uploadFile.status === "uploading" || uploadFile.status === "processing") && (
                    <Progress value={uploadFile.progress} className="h-1 mt-2" />
                  )}
                </div>

                {/* Remove Button */}
                {uploadFile.status !== "uploading" && uploadFile.status !== "processing" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFile(uploadFile.file);
                    }}
                    className="shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
});
