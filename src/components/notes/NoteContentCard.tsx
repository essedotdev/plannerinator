"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ZoomIn, ZoomOut } from "lucide-react";
import { useState } from "react";
import { MarkdownRenderer } from "./MarkdownRenderer";

interface NoteContentCardProps {
  content: string;
}

/**
 * Client component wrapper for displaying note content with zoom controls
 * The zoom controls are integrated in the CardHeader alongside the title
 */
export function NoteContentCard({ content }: NoteContentCardProps) {
  const [zoom, setZoom] = useState<number>(100);

  const increaseZoom = () => setZoom((prev) => Math.min(prev + 10, 200));
  const decreaseZoom = () => setZoom((prev) => Math.max(prev - 10, 50));
  const resetZoom = () => setZoom(100);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Content</CardTitle>

          {/* Zoom controls */}
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={decreaseZoom}
              disabled={zoom <= 50}
              title="Zoom Out"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <button
              type="button"
              onClick={resetZoom}
              className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors px-1 min-w-12 text-center"
              title="Reset Zoom"
            >
              {zoom}%
            </button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={increaseZoom}
              disabled={zoom >= 200}
              title="Zoom In"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <MarkdownRenderer content={content} initialZoom={zoom} />
      </CardContent>
    </Card>
  );
}
