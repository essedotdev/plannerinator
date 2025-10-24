"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { CheckSquare, Calendar, FileText, FolderOpen, Loader2, Clock } from "lucide-react";
import { globalSearch, getRecentItems, type GroupedSearchResults } from "@/features/search/queries";
import { Badge } from "@/components/ui/badge";
import { formatShortDate } from "@/lib/dates";
import {
  TASK_STATUS_LABELS,
  TASK_PRIORITY_LABELS,
  NOTE_TYPE_LABELS,
  PROJECT_STATUS_LABELS,
} from "@/lib/labels";

// Entity type icons
const entityIcons = {
  task: CheckSquare,
  event: Calendar,
  note: FileText,
  project: FolderOpen,
} as const;

// Entity type labels
const entityLabels = {
  task: "Tasks",
  event: "Events",
  note: "Notes",
  project: "Projects",
} as const;

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<GroupedSearchResults>({
    tasks: [],
    events: [],
    notes: [],
    projects: [],
    total: 0,
  });
  const [isLoading, setIsLoading] = React.useState(false);

  // Handle Cmd+K / Ctrl+K
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Load recent items when opening with empty query
  React.useEffect(() => {
    if (open && !query) {
      setIsLoading(true);
      getRecentItems(8)
        .then((data) => {
          setResults(data);
        })
        .catch((error) => {
          console.error("Error loading recent items:", error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [open, query]);

  // Debounced search
  React.useEffect(() => {
    if (!query.trim()) {
      return;
    }

    setIsLoading(true);

    const timeoutId = setTimeout(() => {
      globalSearch(query.trim(), { limit: 10 })
        .then((data) => {
          setResults(data);
        })
        .catch((error) => {
          console.error("Error searching:", error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [query]);

  // Handle item selection
  const handleSelect = (type: string, id: string) => {
    setOpen(false);
    setQuery("");

    // Navigate to the entity
    const routes: Record<string, string> = {
      task: `/dashboard/tasks/${id}`,
      event: `/dashboard/events/${id}`,
      note: `/dashboard/notes/${id}`,
      project: `/dashboard/projects/${id}`,
    };

    const route = routes[type];
    if (route) {
      router.push(route);
    }
  };

  // Reset state when closing
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setQuery("");
      setResults({
        tasks: [],
        events: [],
        notes: [],
        projects: [],
        total: 0,
      });
    }
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={handleOpenChange}
      title="Search"
      description="Search for tasks, events, notes, and projects"
      showCloseButton={false}
    >
      <CommandInput
        placeholder="Search for tasks, events, notes, or projects..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>
          {isLoading ? (
            <div className="py-6 text-center">
              <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            "No results found."
          )}
        </CommandEmpty>

        {/* Tasks */}
        {results.tasks.length > 0 && (
          <CommandGroup heading={query ? entityLabels.task : "Recent Tasks"}>
            {results.tasks.map((item) => {
              const Icon = entityIcons.task;
              return (
                <CommandItem
                  key={item.id}
                  value={`task-${item.id}`}
                  onSelect={() => handleSelect("task", item.id)}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center gap-2">
                      <span className="truncate">{item.title}</span>
                      {item.priority && (
                        <Badge variant="secondary" className="text-xs">
                          {TASK_PRIORITY_LABELS[item.priority as keyof typeof TASK_PRIORITY_LABELS]}
                        </Badge>
                      )}
                      {item.status && item.status !== "todo" && (
                        <Badge variant="outline" className="text-xs">
                          {TASK_STATUS_LABELS[item.status as keyof typeof TASK_STATUS_LABELS]}
                        </Badge>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      {item.projectName && (
                        <span
                          className="text-xs flex items-center gap-1"
                          style={{ color: item.projectColor || undefined }}
                        >
                          <FolderOpen className="h-3 w-3" />
                          {item.projectName}
                        </span>
                      )}
                      {item.dueDate && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatShortDate(item.dueDate)}
                        </span>
                      )}
                    </div>
                  </div>
                </CommandItem>
              );
            })}
          </CommandGroup>
        )}

        {/* Events */}
        {results.events.length > 0 && (
          <CommandGroup heading={query ? entityLabels.event : "Recent Events"}>
            {results.events.map((item) => {
              const Icon = entityIcons.event;
              return (
                <CommandItem
                  key={item.id}
                  value={`event-${item.id}`}
                  onSelect={() => handleSelect("event", item.id)}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center gap-2">
                      <span className="truncate">{item.title}</span>
                    </div>
                    {item.description && (
                      <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      {item.projectName && (
                        <span
                          className="text-xs flex items-center gap-1"
                          style={{ color: item.projectColor || undefined }}
                        >
                          <FolderOpen className="h-3 w-3" />
                          {item.projectName}
                        </span>
                      )}
                      {item.startTime && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatShortDate(item.startTime)}
                        </span>
                      )}
                    </div>
                  </div>
                </CommandItem>
              );
            })}
          </CommandGroup>
        )}

        {/* Notes */}
        {results.notes.length > 0 && (
          <CommandGroup heading={query ? entityLabels.note : "Recent Notes"}>
            {results.notes.map((item) => {
              const Icon = entityIcons.note;
              return (
                <CommandItem
                  key={item.id}
                  value={`note-${item.id}`}
                  onSelect={() => handleSelect("note", item.id)}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center gap-2">
                      <span className="truncate">{item.title}</span>
                      {item.noteType && (
                        <Badge variant="outline" className="text-xs">
                          {NOTE_TYPE_LABELS[item.noteType as keyof typeof NOTE_TYPE_LABELS]}
                        </Badge>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                    )}
                    {item.projectName && (
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className="text-xs flex items-center gap-1"
                          style={{ color: item.projectColor || undefined }}
                        >
                          <FolderOpen className="h-3 w-3" />
                          {item.projectName}
                        </span>
                      </div>
                    )}
                  </div>
                </CommandItem>
              );
            })}
          </CommandGroup>
        )}

        {/* Projects */}
        {results.projects.length > 0 && (
          <CommandGroup heading={query ? entityLabels.project : "Recent Projects"}>
            {results.projects.map((item) => {
              const Icon = entityIcons.project;
              return (
                <CommandItem
                  key={item.id}
                  value={`project-${item.id}`}
                  onSelect={() => handleSelect("project", item.id)}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center gap-2">
                      <span className="truncate">{item.title}</span>
                      {item.projectStatus && (
                        <Badge variant="outline" className="text-xs">
                          {
                            PROJECT_STATUS_LABELS[
                              item.projectStatus as keyof typeof PROJECT_STATUS_LABELS
                            ]
                          }
                        </Badge>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                    )}
                  </div>
                </CommandItem>
              );
            })}
          </CommandGroup>
        )}
      </CommandList>
      <div className="border-t px-4 py-2 text-xs text-muted-foreground">
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          <span className="text-xs">⌘</span>K
        </kbd>{" "}
        to open • <span className="text-xs">↑↓</span> to navigate •{" "}
        <span className="text-xs">↵</span> to select • <span className="text-xs">ESC</span> to close
      </div>
    </CommandDialog>
  );
}
