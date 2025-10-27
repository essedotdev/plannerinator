"use client";

import { useState, useRef, useCallback, type KeyboardEvent, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import SyntaxHighlighter from "react-syntax-highlighter/dist/esm/light";
import { atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs";
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
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Code,
  Link as LinkIcon,
  Quote,
  Table,
  Eye,
  Edit3,
  Columns2,
  Image as ImageIcon,
  Minus,
  CheckSquare,
  Maximize,
  Minimize,
} from "lucide-react";

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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  // Calculate editor height based on focus mode
  const editorHeight = isFocusMode ? "calc(100vh - 250px)" : minHeight;

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
          <div>
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="w-full p-4 border border-border rounded-md bg-background text-foreground font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-ring"
              style={{ minHeight: editorHeight }}
            />
          </div>
        )}

        {/* Preview */}
        {(viewMode === "preview" || viewMode === "split") && (
          <div
            className="p-4 border border-border rounded-md bg-muted/20 overflow-auto prose prose-sm dark:prose-invert max-w-none"
            style={{ minHeight: editorHeight }}
          >
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
        )}
      </div>
    </div>
  );
}
