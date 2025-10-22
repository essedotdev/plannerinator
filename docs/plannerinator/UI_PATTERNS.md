# UI Patterns

Pattern UI/UX ricorrenti in Plannerinator per consistenza e best practices.

## Layout Patterns

### Dashboard Layout

```
┌────────────────────────────────────────────────────────────┐
│  [☰]  Plannerinator        [Search] [Theme] [Notifications] [Avatar] │
├──────────┬─────────────────────────────────────────────────┤
│          │                                                  │
│ 📋 Tasks │  Tasks                     [+ New Task] [Filter]│
│ 📅 Events│  ───────────────────────────────────────────   │
│ 📝 Notes │                                                  │
│ 📁 Projects                                                 │
│ 📦 Collections  ┌──────────────────────────────────┐      │
│          │      │ ☐ Task title              [⋯]   │      │
│ ───────  │      │ Due: Tomorrow  #urgent            │      │
│ Projects │      │ Project: Website                  │      │
│  • Website      └──────────────────────────────────┘      │
│  • App    │                                                 │
│  • Blog   │     ┌──────────────────────────────────┐      │
│          │      │ ☐ Another task            [⋯]   │      │
│ ───────  │      │ Due: Next week                    │      │
│ Settings │      └──────────────────────────────────┘      │
│          │                                                  │
│          │  [Load more]                                    │
└──────────┴─────────────────────────────────────────────────┘
```

**Caratteristiche:**

- Sidebar fissa desktop (collapsible)
- Sheet mobile (hamburger menu)
- Top bar con global actions
- Content area scrollabile
- Sidebar sections collapsible

---

## Navigation Patterns

### Sidebar Navigation

```typescript
// components/layout/DashboardSidebar.tsx
const navigation = [
  {
    name: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    section: "Main",
    items: [
      { name: "Tasks", href: "/tasks", icon: CheckSquare, badge: taskCount },
      { name: "Calendar", href: "/calendar", icon: Calendar },
      { name: "Notes", href: "/notes", icon: FileText },
    ],
  },
  {
    section: "Organize",
    items: [
      { name: "Projects", href: "/projects", icon: Folder },
      { name: "Collections", href: "/collections", icon: Package },
      { name: "Tags", href: "/tags", icon: Tag },
    ],
  },
];
```

**Features:**

- Active state highlight
- Icon + label
- Badge per counts (es. pending tasks)
- Sections collapsible
- Keyboard navigation (Tab, Arrow keys)

---

### Breadcrumbs

```typescript
// Per navigation gerarchica
<Breadcrumb>
  <BreadcrumbItem href="/projects">Projects</BreadcrumbItem>
  <BreadcrumbItem href="/projects/website">Website</BreadcrumbItem>
  <BreadcrumbItem current>Tasks</BreadcrumbItem>
</Breadcrumb>
```

---

## Command Palette (Cmd+K)

```
┌─────────────────────────────────────────────┐
│  🔍 Search or type a command...              │
├─────────────────────────────────────────────┤
│  Quick Actions                               │
│  ⚡ New task                      Ctrl+T     │
│  ⚡ New event                     Ctrl+E     │
│  ⚡ New note                      Ctrl+N     │
│  ⚡ New project                               │
│                                              │
│  Recent                                      │
│  📋 Review design mockups                    │
│  📅 Team meeting                             │
│  📝 Project ideas                            │
│                                              │
│  Search Results                              │
│  🔍 Website redesign project                 │
│  🔍 Task: Update homepage                    │
└─────────────────────────────────────────────┘
```

**Features:**

- Keyboard-first (fuzzy search)
- Multiple sections (actions, recent, search)
- Icon per entity type
- Keyboard shortcuts hint
- Arrow navigation + Enter to select

**Implementation:**

- `cmdk` library (shadcn/ui)
- Debounced search
- Recent items stored in localStorage

---

## Entity Card Patterns

### Task Card

```
┌────────────────────────────────────────────────┐
│ ☐ Task title                              [⋯]  │
│ Description preview if available...            │
│                                                 │
│ 📅 Tomorrow 15:00  ⏱ 2h  🏷 #urgent #work     │
│ 📁 Project: Website                            │
│                                                 │
│ 💬 2 comments  🔗 1 link                       │
└────────────────────────────────────────────────┘
```

**Varianti:**

- Compact (solo title + metadata)
- Expanded (con description)
- Kanban (drag handle + minimal)

**Interactions:**

- Click → open detail
- Checkbox → toggle complete
- Menu (⋯) → edit, delete, duplicate, move
- Drag & drop (per reordering/kanban)

---

### Event Card

```
┌────────────────────────────────────────────────┐
│ 📅 Team Meeting                           [⋯]  │
│ Mon, Oct 23 • 10:00 - 11:30                    │
│                                                 │
│ 📍 Zoom (click to join)                        │
│ 📁 Project: Website                            │
│                                                 │
│ 👥 3 attendees  💬 1 comment                   │
└────────────────────────────────────────────────┘
```

**Color coding:**

- Left border color = calendar type (work/personal/etc.)

---

### Note Card

```
┌────────────────────────────────────────────────┐
│ 📝 Note title                             [⋯]  │
│                                                 │
│ Preview of the note content in markdown        │
│ format, truncated to 2-3 lines...              │
│                                                 │
│ 📁 Project: Blog  🏷 #ideas #react             │
│ Updated 2 hours ago                             │
└────────────────────────────────────────────────┘
```

**Features:**

- Favorite star (top right)
- Markdown rendering in preview
- Type badge (note/document/research/etc.)

---

### Project Card

```
┌────────────────────────────────────────────────┐
│ 🎨 Website Redesign                       [⋯]  │
│ Complete redesign of company website           │
│                                                 │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━ 65%               │
│                                                 │
│ 📋 13 tasks (8 done)  📅 6 events  📝 4 notes │
│ Due: Dec 31, 2025                              │
└────────────────────────────────────────────────┘
```

**Features:**

- Progress bar (% tasks done)
- Color accent (customizable)
- Stats summary
- Status badge (active/on hold/completed)

---

## Form Patterns

### Standard Form Layout

```typescript
<Form {...form}>
  <FormField
    control={form.control}
    name="title"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Title</FormLabel>
        <FormControl>
          <Input placeholder="Enter title..." {...field} />
        </FormControl>
        <FormDescription>
          A clear, concise title for your task
        </FormDescription>
        <FormMessage />
      </FormItem>
    )}
  />

  <div className="grid grid-cols-2 gap-4">
    <FormField name="dueDate" ... />
    <FormField name="duration" ... />
  </div>

  <div className="flex justify-end gap-2">
    <Button variant="outline" onClick={onCancel}>Cancel</Button>
    <Button type="submit">Save</Button>
  </div>
</Form>
```

**Best Practices:**

- Label sempre presente
- Description per campi complessi
- Error messages inline
- Loading state su submit
- Keyboard submit (Enter)
- ESC per cancel

---

### Inline Editing

```typescript
// Click to edit pattern
function InlineEdit({ value, onSave }) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);

  if (!isEditing) {
    return (
      <div onClick={() => setIsEditing(true)} className="cursor-pointer">
        {value}
      </div>
    );
  }

  return (
    <Input
      value={tempValue}
      onChange={(e) => setTempValue(e.target.value)}
      onBlur={() => {
        onSave(tempValue);
        setIsEditing(false);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          onSave(tempValue);
          setIsEditing(false);
        }
        if (e.key === 'Escape') {
          setTempValue(value);
          setIsEditing(false);
        }
      }}
      autoFocus
    />
  );
}
```

**Use cases:**

- Task title
- Note title
- Project name
- Quick edits

---

## Modal/Dialog Patterns

### Confirmation Dialog

```typescript
<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="destructive">Delete Task</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
      <AlertDialogDescription>
        This action cannot be undone. This will permanently delete
        the task and all its subtasks.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction onClick={handleDelete}>
        Delete
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

**When to use:**

- Delete actions
- Irreversible actions
- Important confirmations

---

### Full Form Dialog

```typescript
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent className="sm:max-w-[600px]">
    <DialogHeader>
      <DialogTitle>Create New Task</DialogTitle>
      <DialogDescription>
        Add a new task to your list
      </DialogDescription>
    </DialogHeader>

    <TaskForm onSuccess={() => setIsOpen(false)} />
  </DialogContent>
</Dialog>
```

**Best Practices:**

- Max width responsive (sm:max-w-[600px])
- Close on ESC
- Close on overlay click (optional, per form può essere disabled)
- Scroll interno se contenuto lungo

---

### Sheet (Slide-over)

```typescript
<Sheet>
  <SheetTrigger asChild>
    <Button>Task Details</Button>
  </SheetTrigger>
  <SheetContent side="right" className="w-[400px] sm:w-[540px]">
    <SheetHeader>
      <SheetTitle>Task Details</SheetTitle>
    </SheetHeader>

    <div className="mt-6 space-y-6">
      {/* Task details, comments, links, etc. */}
    </div>
  </SheetContent>
</Sheet>
```

**When to use:**

- Entity detail views
- Multi-step forms
- Rich content preview
- Settings panels

---

## Filter & Sort Patterns

### Filter Bar

```
┌────────────────────────────────────────────────────────┐
│ [🔍 Search]  [Status ▼]  [Project ▼]  [Tags ▼]  [Clear]│
└────────────────────────────────────────────────────────┘
```

```typescript
function FilterBar({ onFilterChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      <Input
        placeholder="Search..."
        onChange={(e) => onFilterChange({ search: e.target.value })}
      />

      <Select onValueChange={(v) => onFilterChange({ status: v })}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="todo">Todo</SelectItem>
          <SelectItem value="in_progress">In Progress</SelectItem>
          <SelectItem value="done">Done</SelectItem>
        </SelectContent>
      </Select>

      {/* More filters */}

      <Button variant="ghost" onClick={clearFilters}>
        Clear
      </Button>
    </div>
  );
}
```

---

### Active Filters Pills

```
Applied filters:
[Status: Todo ×]  [Project: Website ×]  [#urgent ×]
```

```typescript
<div className="flex flex-wrap gap-2">
  {activeFilters.map((filter) => (
    <Badge key={filter.key} variant="secondary">
      {filter.label}
      <button onClick={() => removeFilter(filter.key)}>×</button>
    </Badge>
  ))}
</div>
```

---

## Loading States

### Skeleton Screens

```typescript
function TaskListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="border rounded-lg p-4">
          <Skeleton className="h-5 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2 mb-4" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}
```

**When to use:**

- Initial page load
- Infinite scroll loading more
- Better than spinners per list/cards

---

### Loading Overlays

```typescript
<div className="relative">
  {isLoading && (
    <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  )}

  <TaskList tasks={tasks} />
</div>
```

**When to use:**

- Form submission
- Refreshing data
- Actions che potrebbero fallire

---

## Empty States

### Empty List

```typescript
function EmptyState({ entityType, onCreateNew }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-muted p-6 mb-4">
        <FileText className="h-12 w-12 text-muted-foreground" />
      </div>

      <h3 className="text-lg font-semibold mb-2">
        No {entityType}s yet
      </h3>

      <p className="text-muted-foreground mb-6 max-w-sm">
        Get started by creating your first {entityType}.
      </p>

      <Button onClick={onCreateNew}>
        <Plus className="h-4 w-4 mr-2" />
        Create {entityType}
      </Button>
    </div>
  );
}
```

**Variants:**

- Empty search results (suggerisci clear filters)
- Empty project (suggerisci add task)
- Empty collection (suggerisci add item)

---

## Error States

### Error Alert

```typescript
{error && (
  <Alert variant="destructive">
    <AlertCircle className="h-4 w-4" />
    <AlertTitle>Error</AlertTitle>
    <AlertDescription>{error.message}</AlertDescription>
  </Alert>
)}
```

### Error Boundary UI

```typescript
function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <AlertTriangle className="h-12 w-12 text-destructive mb-4" />

      <h2 className="text-xl font-semibold mb-2">
        Something went wrong
      </h2>

      <p className="text-muted-foreground mb-6">
        {error.message}
      </p>

      <Button onClick={resetErrorBoundary}>
        Try again
      </Button>
    </div>
  );
}
```

---

## Toast Notifications

```typescript
import { toast } from "sonner";

// Success
toast.success("Task created successfully");

// Error
toast.error("Failed to create task", {
  description: error.message,
});

// Loading
const toastId = toast.loading("Creating task...");
// Later
toast.success("Task created", { id: toastId });

// With action
toast("Task completed", {
  action: {
    label: "Undo",
    onClick: () => undoComplete(taskId),
  },
});
```

**Best Practices:**

- Success messages brevissime (2-3 parole)
- Error messages con dettagli
- Loading toast con ID per update
- Action button per undo quando possibile

---

## Drag & Drop Patterns

### Sortable List

```typescript
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, useSortable } from '@dnd-kit/sortable';

function SortableTaskList({ tasks, onReorder }) {
  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={tasks.map(t => t.id)}>
        {tasks.map(task => (
          <SortableTaskItem key={task.id} task={task} />
        ))}
      </SortableContext>
    </DndContext>
  );
}

function SortableTaskItem({ task }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: task.id,
  });

  return (
    <div ref={setNodeRef} style={{ transform, transition }}>
      <div {...attributes} {...listeners} className="cursor-grab">
        <GripVertical className="h-5 w-5" />
      </div>
      <TaskCard task={task} />
    </div>
  );
}
```

**Use cases:**

- Reorder tasks
- Reorder projects
- Custom sort collections

---

### Kanban Board

```typescript
function TaskKanban({ tasks, onStatusChange }) {
  const columns = ['todo', 'in_progress', 'done'];

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-3 gap-4">
        {columns.map(status => (
          <DroppableColumn key={status} status={status}>
            {tasks.filter(t => t.status === status).map(task => (
              <DraggableTask key={task.id} task={task} />
            ))}
          </DroppableColumn>
        ))}
      </div>
    </DndContext>
  );
}
```

---

## Responsive Patterns

### Mobile Navigation

```typescript
// Desktop: persistent sidebar
// Mobile: hamburger menu with sheet

function Navigation() {
  return (
    <>
      {/* Desktop */}
      <aside className="hidden md:flex md:w-64 md:flex-col">
        <NavContent />
      </aside>

      {/* Mobile */}
      <Sheet>
        <SheetTrigger className="md:hidden">
          <Menu />
        </SheetTrigger>
        <SheetContent side="left">
          <NavContent />
        </SheetContent>
      </Sheet>
    </>
  );
}
```

---

### Responsive Tables

```typescript
// Desktop: full table
// Mobile: card view

function ResponsiveTaskList({ tasks }) {
  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>...</TableHeader>
          <TableBody>
            {tasks.map(task => <TaskRow key={task.id} task={task} />)}
          </TableBody>
        </Table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-4">
        {tasks.map(task => <TaskCard key={task.id} task={task} />)}
      </div>
    </>
  );
}
```

---

## Accessibility Patterns

### Keyboard Shortcuts

```typescript
useEffect(() => {
  function handleKeyDown(e: KeyboardEvent) {
    // Cmd+K: Open command palette
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      openCommandPalette();
    }

    // Cmd+T: New task
    if ((e.metaKey || e.ctrlKey) && e.key === "t") {
      e.preventDefault();
      openNewTaskDialog();
    }
  }

  window.addEventListener("keydown", handleKeyDown);
  return () => window.removeEventListener("keydown", handleKeyDown);
}, []);
```

**Common shortcuts:**

- `Cmd+K` - Command palette
- `Cmd+T` - New task
- `Cmd+E` - New event
- `Cmd+N` - New note
- `Cmd+/` - Show shortcuts help
- `ESC` - Close dialog/modal
- `?` - Help

---

### Focus Management

```typescript
// Trap focus dentro dialog
import { FocusTrap } from '@headlessui/react';

<Dialog>
  <FocusTrap>
    <DialogContent>
      {/* Focus è intrappolato qui */}
    </DialogContent>
  </FocusTrap>
</Dialog>

// Auto-focus primo campo in form
<Input autoFocus />
```

---

### ARIA Labels

```typescript
<button
  aria-label="Delete task"
  onClick={handleDelete}
>
  <Trash2 className="h-4 w-4" />
</button>

<input
  type="checkbox"
  aria-label={`Mark "${task.title}" as complete`}
  checked={task.status === 'done'}
  onChange={handleToggle}
/>
```

---

## Animation Patterns

### Page Transitions (Framer Motion)

```typescript
import { motion } from 'framer-motion';

export default function Page() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
    >
      {/* Page content */}
    </motion.div>
  );
}
```

### List Animations

```typescript
<motion.div layout>
  {tasks.map(task => (
    <motion.div
      key={task.id}
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <TaskCard task={task} />
    </motion.div>
  ))}
</motion.div>
```

**Best Practices:**

- Animazioni brevi (200-300ms)
- Respect `prefers-reduced-motion`
- Layout animations per drag & drop
- Exit animations per delete
