"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Bold,
  CheckSquare,
  Code,
  Columns2,
  Edit3,
  Eye,
  Heading1,
  Heading2,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Maximize,
  Minimize,
  Minus,
  Quote,
  Table,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import ReactMarkdown from "react-markdown";
import bash from "react-syntax-highlighter/dist/esm/languages/hljs/bash";
import cpp from "react-syntax-highlighter/dist/esm/languages/hljs/cpp";
import csharp from "react-syntax-highlighter/dist/esm/languages/hljs/csharp";
import css from "react-syntax-highlighter/dist/esm/languages/hljs/css";
import go from "react-syntax-highlighter/dist/esm/languages/hljs/go";
import java from "react-syntax-highlighter/dist/esm/languages/hljs/java";
import javascript from "react-syntax-highlighter/dist/esm/languages/hljs/javascript";
import json from "react-syntax-highlighter/dist/esm/languages/hljs/json";
import kotlin from "react-syntax-highlighter/dist/esm/languages/hljs/kotlin";
import markdown from "react-syntax-highlighter/dist/esm/languages/hljs/markdown";
import php from "react-syntax-highlighter/dist/esm/languages/hljs/php";
import python from "react-syntax-highlighter/dist/esm/languages/hljs/python";
import ruby from "react-syntax-highlighter/dist/esm/languages/hljs/ruby";
import rust from "react-syntax-highlighter/dist/esm/languages/hljs/rust";
import sql from "react-syntax-highlighter/dist/esm/languages/hljs/sql";
import swift from "react-syntax-highlighter/dist/esm/languages/hljs/swift";
import typescript from "react-syntax-highlighter/dist/esm/languages/hljs/typescript";
import xml from "react-syntax-highlighter/dist/esm/languages/hljs/xml";
import yaml from "react-syntax-highlighter/dist/esm/languages/hljs/yaml";
import SyntaxHighlighter from "react-syntax-highlighter/dist/esm/light";
import { atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

// Type definitions
interface CodeProps {
  inline?: boolean;
  className?: string;
  children?: ReactNode;
}

// Register languages with SyntaxHighlighter
SyntaxHighlighter.registerLanguage("bash", bash);
SyntaxHighlighter.registerLanguage("cpp", cpp);
SyntaxHighlighter.registerLanguage("csharp", csharp);
SyntaxHighlighter.registerLanguage("css", css);
SyntaxHighlighter.registerLanguage("go", go);
SyntaxHighlighter.registerLanguage("java", java);
SyntaxHighlighter.registerLanguage("javascript", javascript);
SyntaxHighlighter.registerLanguage("json", json);
SyntaxHighlighter.registerLanguage("kotlin", kotlin);
SyntaxHighlighter.registerLanguage("markdown", markdown);
SyntaxHighlighter.registerLanguage("php", php);
SyntaxHighlighter.registerLanguage("python", python);
SyntaxHighlighter.registerLanguage("ruby", ruby);
SyntaxHighlighter.registerLanguage("rust", rust);
SyntaxHighlighter.registerLanguage("sql", sql);
SyntaxHighlighter.registerLanguage("swift", swift);
SyntaxHighlighter.registerLanguage("typescript", typescript);
SyntaxHighlighter.registerLanguage("xml", xml);
SyntaxHighlighter.registerLanguage("yaml", yaml);

type ViewMode = "edit" | "preview" | "split";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  isFocusMode?: boolean;
  onFocusModeChange?: (isFocusMode: boolean) => void;
}

/**
 * MarkdownEditor Component
 *
 * Full-featured markdown editor with:
 * - Live preview with react-markdown
 * - GitHub Flavored Markdown support (tables, task lists, strikethrough)
 * - Syntax highlighting for code blocks
 * - Toolbar with markdown formatting buttons
 * - Keyboard shortcuts (Ctrl+B, Ctrl+I, etc.)
 * - Three view modes: edit, preview, split
 * - Support for: headers, lists, tables, images, links, code blocks, quotes, etc.
 */
export function MarkdownEditor({
  value,
  onChange,
  placeholder = "Write your note in markdown...",
  minHeight = "300px",
  isFocusMode = false,
  onFocusModeChange,
}: MarkdownEditorProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("split");
  const [previewZoom, setPreviewZoom] = useState<number>(100); // Zoom percentage
  const [customHeight, setCustomHeight] = useState<number | null>(null); // Custom height from resize
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const isResizing = useRef<boolean>(false);

  // Zoom controls
  const increaseZoom = () => setPreviewZoom((prev) => Math.min(prev + 10, 200));
  const decreaseZoom = () => setPreviewZoom((prev) => Math.max(prev - 10, 50));
  const resetZoom = () => setPreviewZoom(100);

  // Resize handler
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isResizing.current = true;
    document.body.style.cursor = "ns-resize";
    document.body.style.userSelect = "none";
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing.current || !previewRef.current) return;

    const previewRect = previewRef.current.getBoundingClientRect();
    const newHeight = e.clientY - previewRect.top;

    // Clamp height between 200px and 900px
    const clampedHeight = Math.max(200, Math.min(1200, newHeight));
    setCustomHeight(clampedHeight);
  }, []);

  const handleMouseUp = useCallback(() => {
    if (isResizing.current) {
      isResizing.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }
  }, []);

  // Add/remove event listeners for resize
  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  // Insert markdown syntax at cursor position
  const insertMarkdown = useCallback(
    (before: string, after: string = "", defaultText: string = "") => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = value.substring(start, end);
      const textToInsert = selectedText || defaultText;

      const newValue =
        value.substring(0, start) + before + textToInsert + after + value.substring(end);

      onChange(newValue);

      // Set cursor position after inserted text
      setTimeout(() => {
        textarea.focus();
        const newCursorPos = start + before.length + textToInsert.length;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
    },
    [value, onChange]
  );

  // Insert text at beginning of line
  const insertAtLineStart = useCallback(
    (prefix: string) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const lineStart = value.lastIndexOf("\n", start - 1) + 1;

      const newValue = value.substring(0, lineStart) + prefix + value.substring(lineStart);

      onChange(newValue);

      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + prefix.length, start + prefix.length);
      }, 0);
    },
    [value, onChange]
  );

  // Keyboard shortcuts handler
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      // ESC to exit focus mode
      if (e.key === "Escape" && isFocusMode && onFocusModeChange) {
        e.preventDefault();
        onFocusModeChange(false);
        return;
      }

      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "b":
            e.preventDefault();
            insertMarkdown("**", "**", "bold text");
            break;
          case "i":
            e.preventDefault();
            insertMarkdown("*", "*", "italic text");
            break;
          case "k":
            e.preventDefault();
            insertMarkdown("[", "](url)", "link text");
            break;
          case "`":
            e.preventDefault();
            insertMarkdown("`", "`", "code");
            break;
        }
      }
    },
    [insertMarkdown, isFocusMode, onFocusModeChange]
  );

  // Calculate editor height based on focus mode and custom resize
  const getHeight = () => {
    if (customHeight) return `${customHeight}px`;
    if (isFocusMode) return "calc(100vh - 250px)";
    return minHeight;
  };
  const editorHeight = getHeight();

  return (
    <div className="space-y-2">
      {/* Toolbar */}
      <div className="flex items-center gap-1 flex-wrap border border-border rounded-md p-2 bg-muted/30">
        {/* Text formatting */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertMarkdown("**", "**", "bold")}
          title="Bold (Ctrl+B)"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertMarkdown("*", "*", "italic")}
          title="Italic (Ctrl+I)"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertMarkdown("~~", "~~", "strikethrough")}
          title="Strikethrough"
        >
          <Minus className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6" />

        {/* Headers */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertAtLineStart("# ")}
          title="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertAtLineStart("## ")}
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6" />

        {/* Lists */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertAtLineStart("- ")}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertAtLineStart("1. ")}
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertAtLineStart("- [ ] ")}
          title="Task List"
        >
          <CheckSquare className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6" />

        {/* Code & Quote */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertMarkdown("`", "`", "code")}
          title="Inline Code (Ctrl+`)"
        >
          <Code className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertMarkdown("\n```\n", "\n```\n", "code block")}
          title="Code Block"
        >
          <Code className="h-4 w-4" />
          <Code className="h-3 w-3 -ml-2" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertAtLineStart("> ")}
          title="Quote"
        >
          <Quote className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6" />

        {/* Links & Images */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertMarkdown("[", "](url)", "link text")}
          title="Link (Ctrl+K)"
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertMarkdown("![", "](url)", "alt text")}
          title="Image"
        >
          <ImageIcon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() =>
            insertMarkdown(
              "\n| Column 1 | Column 2 |\n|----------|----------|\n| ",
              " | Cell 2 |\n",
              "Cell 1"
            )
          }
          title="Table"
        >
          <Table className="h-4 w-4" />
        </Button>

        <div className="flex-1" />

        {/* Focus mode toggle */}
        {onFocusModeChange && (
          <>
            <Button
              type="button"
              variant={isFocusMode ? "default" : "ghost"}
              size="sm"
              onClick={() => onFocusModeChange(!isFocusMode)}
              title={isFocusMode ? "Exit Focus Mode (ESC)" : "Enter Focus Mode"}
            >
              {isFocusMode ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </Button>
            <Separator orientation="vertical" className="h-6" />
          </>
        )}

        {/* Zoom controls - visible only in preview or split mode */}
        {(viewMode === "preview" || viewMode === "split") && (
          <>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={decreaseZoom}
              disabled={previewZoom <= 50}
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
              {previewZoom}%
            </button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={increaseZoom}
              disabled={previewZoom >= 200}
              title="Zoom In"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Separator orientation="vertical" className="h-6" />
          </>
        )}

        {/* View mode toggles */}
        <div className="inline-flex items-center gap-1 bg-muted/50 p-1 rounded-lg border border-border">
          <Button
            type="button"
            variant={viewMode === "edit" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("edit")}
            title="Edit Mode"
          >
            <Edit3 className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={viewMode === "split" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("split")}
            title="Split View"
          >
            <Columns2 className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={viewMode === "preview" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("preview")}
            title="Preview Mode"
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Editor/Preview Area */}
      <div
        className="grid gap-4"
        style={{
          gridTemplateColumns: viewMode === "split" ? "1fr 1fr" : "1fr",
        }}
      >
        {/* Editor */}
        {(viewMode === "edit" || viewMode === "split") && (
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="w-full p-4 border border-border rounded-md bg-background text-foreground font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring overflow-auto"
              style={{
                height: editorHeight,
                maxHeight: isFocusMode ? "calc(100vh - 250px)" : "1200px",
              }}
            />
            {/* Resize handle - only visible in edit-only mode */}
            {viewMode === "edit" && (
              <div
                onMouseDown={handleMouseDown}
                className="sticky bottom-1 right-1 ml-auto w-3 h-3 cursor-nwse-resize opacity-30 hover:opacity-80 transition-opacity"
                title="Drag to resize"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-muted-foreground"
                >
                  <path
                    d="M11 6L11 11L6 11"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            )}
          </div>
        )}

        {/* Preview */}
        {(viewMode === "preview" || viewMode === "split") && (
          <div
            ref={previewRef}
            className="relative border border-border rounded-md bg-muted/20 overflow-auto prose prose-sm dark:prose-invert max-w-none"
            style={{
              height: editorHeight,
              maxHeight: isFocusMode ? "calc(100vh - 250px)" : "1200px",
              fontSize: `${previewZoom}%`,
            }}
          >
            <div className="min-h-full px-4 -mt-2">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                  code({ inline, className, children, ...props }: CodeProps) {
                    const match = /language-(\w+)/.exec(className || "");
                    return !inline && match ? (
                      <SyntaxHighlighter
                        style={atomOneDark}
                        language={match[1]}
                        PreTag="div"
                        {...props}
                      >
                        {String(children).replace(/\n$/, "")}
                      </SyntaxHighlighter>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {value || "*No content to preview*"}
              </ReactMarkdown>
            </div>
            {/* Resize handle - always visible in preview/split mode */}
            <div
              onMouseDown={handleMouseDown}
              className="sticky bottom-2 right-2 ml-auto w-3 h-3 cursor-nwse-resize opacity-30 hover:opacity-80 transition-opacity"
              title="Drag to resize"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-muted-foreground"
              >
                <path
                  d="M11 6L11 11L6 11"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
