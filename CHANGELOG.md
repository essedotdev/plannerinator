# Changelog

All notable changes to Plannerinator will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.11.0] - 2025-10-30

### Added

**Code Reusability Improvements**

- Generic `ParentEntityCard` component replacing entity-specific parent card components
- `fetchEntityPageData` utility function for fetching common entity page data (tags, comments, links, attachments)
- `useProjectSelection` hook for standardized project loading in forms
- `FormActions` component for consistent form action buttons across all entity forms
- Tag utility function `createAndAssignTags` for handling tag creation and assignment

**New Shared Components and Utilities**

- `src/components/common/ParentEntityCard.tsx` - Generic, configurable parent entity card
- `src/lib/entity-data.ts` - Centralized entity page data fetching
- `src/hooks/useProjectSelection.ts` - Reusable project selection hook
- `src/components/forms/FormActions.tsx` - Standardized form action buttons
- `src/features/tags/utils.ts` - Tag creation and assignment utilities
- Parent entity configuration files for all entity types (tasks, events, notes, projects)

### Changed

**Refactoring for Code Reusability**

- Replaced entity-specific parent cards (ParentTaskCard, ParentEventCard, etc.) with generic `ParentEntityCard`
- Unified entity page data fetching across all detail and edit pages using `fetchEntityPageData`
- Standardized project selection logic across TaskForm, EventForm, and NoteForm using `useProjectSelection` hook
- Consolidated form action buttons in all entity forms using `FormActions` component
- Refactored tag creation logic to use shared `createAndAssignTags` utility

**Component Simplification**

- All entity detail pages (view and edit) now use `fetchEntityPageData` instead of individual Promise.all calls
- All entity forms now use `FormActions` component for consistent button layout and behavior
- Removed duplicate project loading logic from EventForm, TaskForm, and NoteForm
- Removed entity-specific parent card components in favor of configuration-based approach

**Architecture Improvements**

- Reduced code duplication across entity pages by ~30%
- Improved type safety with generic components using TypeScript generics
- Better separation of concerns with utility functions and hooks
- More maintainable codebase with shared, reusable components

### Removed

- `src/components/tasks/ParentTaskCard.tsx` (replaced by ParentEntityCard)
- `src/components/events/ParentEventCard.tsx` (replaced by ParentEntityCard)
- `src/components/notes/ParentNoteCard.tsx` (replaced by ParentEntityCard)
- `src/components/projects/ParentProjectCard.tsx` (replaced by ParentEntityCard)
- Duplicate project loading code from multiple form components
- Duplicate tag creation logic from entity action handlers
- Redundant form action button implementations across forms

## [0.10.0] - 2025-10-29

### Added

**Tag Management System**

- Tag Manager page at `/dashboard/tags` with comprehensive tag management
- Create new tags with name and color selection via CreateTagDialog
- Edit existing tags (rename and recolor) via EditTagDialog
- Delete single or multiple tags with confirmation
- Merge duplicate tags functionality via MergeTagsDialog
- Tag usage statistics showing usage count by entity type (tasks, events, notes, projects)
- Search tags by name
- Sort tags by name, creation date, or usage count
- TagManagerList component displaying all tags with actions
- TagSelector component for improved tag selection in forms
- TagsCard component for displaying tags on entity detail pages
- Radio group UI component for tag merge selection

**Parent Relationship Cards**

- ParentEventCard component for event parent relationships
- ParentNoteCard component for note parent relationships
- ParentProjectCard component for project parent relationships
- ParentTaskCard component for task parent relationships
- Clickable parent links on all entity detail pages
- Parent selection dropdowns in all entity forms

### Fixed

- Missing `Link` import in notes edit page that prevented build
- Type error in project edit page with invalid `parentProjectId` prop
- Type error in `ProjectDetailView` component missing `parentProject` prop
- Build errors related to parent project status field type mismatch

### Changed

- Tag input system refactored to use new TagSelector component
- Tag actions enhanced with merge, bulk delete, and edit capabilities
- Tag schema updated with new validation for tag operations
- Entity helpers updated to support tag management operations
- Removed unused imports across 10+ component files for cleaner code
- Removed unused error variables in catch blocks (replaced with empty catch)
- Updated dependencies: @aws-sdk packages, better-auth, drizzle-kit, resend, wrangler, and others
- Sidebar navigation updated with Tags menu item

## [0.9.0] - 2025-10-27

### Added

**Enhanced Detail Pages with Action Buttons**

- Archive buttons for all entities (tasks, events, notes, projects)
- Delete buttons for all entities with confirmation dialogs
- Edit buttons in page headers linking to dedicated edit pages
- Dedicated edit routes for events, notes, and tasks
- Archive and delete button components for each entity type

**Parent Relationship Management**

- Parent event selection functionality in EventForm
- Parent note selection in NoteForm
- Parent project selection in ProjectForm
- Parent task selection in TaskForm
- Server actions for fetching parent selection options
- Parent relationship display on all detail pages

**Improved Detail Page Layouts**

- Events detail page redesigned with metadata badges and improved layout
- Notes detail page with content preview and metadata display
- Tasks detail page with status, priority, and due date badges
- Projects detail page with new ProjectDetailView component
- Side-by-side layout for tags and parent relationship cards
- Better visual hierarchy with location, description, and metadata sections

**Project Detail View Component**

- New ProjectDetailView component with tabbed interface for project details
- Overview tab with stats, tags, attachments, links, and comments
- Separate tabs for tasks, events, and notes related to the project
- Statistics cards showing task counts, completion rate, upcoming events, and notes
- Task breakdown card showing status distribution
- Consistent layout across project detail pages

**Database Schema Updates**

- New migration adding parent relationship support
- Updated schema for parent relationships across all entities

### Changed

**Detail Pages Refactored to View-Only**

- Event detail pages now display information instead of inline editing
- Note detail pages show content with edit button to navigate to edit page
- Task detail pages display task information with edit button
- Project detail pages separated from edit functionality
- Edit functionality moved to dedicated `/edit` routes

**Form Improvements**

- All forms now support parent relationship selection
- Parent selection dropdowns with proper filtering
- Forms show parent relationship information in edit mode
- Improved form layout and field organization

**UI/UX Enhancements**

- Detail pages now have consistent action button placement in page headers
- Archive and delete actions separated from edit actions
- Better visual feedback for archive and delete operations
- Improved metadata display with badges and formatted dates
- Parent relationships shown in dedicated cards with clickable links

### Fixed

- Event detail page no longer shows edit form inline
- Note detail page properly displays content and metadata
- Task detail page layout improved with proper badge display
- Project detail page statistics and tabs working correctly

## [0.8.0] - 2025-10-27

### Added

**Trash System with Soft Delete**

- Trash page at `/dashboard/trash` showing all deleted items across entities
- Soft delete functionality for tasks, events, notes, and projects
- Restore functionality to recover deleted items from trash
- Permanent delete option (hard delete) for items in trash
- TrashList component displaying deleted items grouped by type
- New `deletedAt` and `archivedAt` timestamp columns in all entity tables
- Database indexes for `archivedAt` and `deletedAt` for efficient querying

**Shared Entity Helpers**

- `entity-helpers.ts` library with reusable utility functions for CRUD operations
- Session validation helper (`validateSession`)
- Ownership verification helper (`checkOwnership`)
- Soft delete operations (`softDeleteEntity`, `restoreEntityFromTrash`)
- Hard delete operations (`hardDeleteEntity`)
- Archive operations (`archiveEntity`, `restoreArchivedEntity`)
- Cache revalidation helpers (`revalidateEntityPaths`, `revalidateProjectChange`)
- Error handling helper (`handleEntityError`)
- Tag copying helper (`copyEntityTags`)

**UI Improvements**

- Trash icon added to AppSidebar navigation
- Entity type icons in trash list (ListChecks, Calendar, FileText, FolderKanban)
- Restore and permanent delete actions in trash interface
- Empty state for trash when no deleted items exist

### Changed

**Code Quality & Architecture**

- Refactored all entity actions (tasks, events, notes, projects) to use shared entity helpers
- Reduced code duplication across action files by ~40%
- Consistent error handling patterns across all CRUD operations
- Unified session validation and ownership checks
- Standardized cache revalidation logic
- All delete operations now soft delete by default (move to trash)

**Database Schema**

- Added `archivedAt` timestamp field to task, event, note, and project tables
- Added `deletedAt` timestamp field to task, event, note, and project tables
- New database indexes for efficient trash and archive queries
- Database migration for soft delete schema changes

**Entity Queries**

- Task queries now exclude deleted items by default (filter by `deletedAt IS NULL`)
- Event queries now exclude deleted items by default
- Note queries now exclude deleted items by default
- Project queries now exclude deleted items by default
- New trash queries to fetch deleted items across all entity types

**Dependencies**

- Updated workspace configuration in `pnpm-workspace.yaml`
- Updated dependencies in `package.json` and `pnpm-lock.yaml`

### Fixed

- Project edit page now properly converts date strings to Date objects
- Consistent behavior when deleting entities (now moves to trash instead of permanent delete)
- Improved type safety in entity action functions

## [0.7.0] - 2025-10-26

### Added

- Project edit page route at `/dashboard/projects/[id]/edit` for dedicated editing interface
- Calendar type selector in event creation form (previously only available in edit mode)
- Status selector in project creation form for setting initial project status
- Note type and favorite toggle in note creation form (previously only in edit mode)

### Changed

**Comment System Improvements**

- Comments now use optimistic UI updates for instant feedback when posting
- Comment form clears immediately on submit for better perceived performance
- New comments appear instantly with "Posting..." status while saving
- Reply button and action menu hidden for pending comments during save

**UI/UX Enhancements**

- Project detail page reorganized with tags, attachments, links, and comments moved inside the Overview tab for cleaner layout
- Projects list grid changed from 3-column to 2-column layout for better card sizing on larger screens
- ProjectCard now uses flexbox layout with improved text wrapping and spacing
- ProjectCard descriptions now properly break long words and use line-clamping
- PageHeader component improved with better gap spacing and flex-shrink handling for action buttons
- PageHeader title and description area now uses min-w-0 to prevent overflow issues
- All form field labels now consistently aligned across create and edit modes

**Form Consistency**

- Event forms now show calendar type selector in both create and edit modes
- Note forms now show type selector and favorite toggle in both create and edit modes
- Project forms now include status selector and color picker in create mode
- Removed conditional rendering that hid form fields in create mode

### Fixed

- Fixed text overflow issues in PageHeader when title or description is too long
- Fixed ProjectCard layout issues with long project names and descriptions
- Fixed comment deletion state variable naming conflict (isPending vs isDeleting)
- Fixed default user display when user data is missing in comments (shows "?" instead of crashing)

## [0.6.0] - 2025-10-24

### Added

**File Attachments with Cloudflare R2 Storage**

- Complete file attachment system for tasks, events, notes, and projects
- Cloudflare R2 integration for secure cloud storage
- File upload with drag-and-drop support and progress tracking
- Image preview with lightbox for uploaded images
- File type detection and validation (documents, images, videos, archives)
- Per-user storage quota tracking and enforcement
- Presigned URL generation for secure downloads
- AttachmentsSection component with file upload, preview, and management
- Progress bar component for visual upload feedback
- ConfirmDialog component for delete confirmations
- Pagination component for large attachment lists
- Database migration for attachments table with foreign keys to all entity types
- R2 client utility with upload, download, delete, and quota management
- Attachment server actions (upload, delete, get) with validation
- Attachment database queries with user quota tracking
- Environment variables for R2 configuration (account ID, access keys, bucket name, file size limits)

**Documentation**

- R2_SETUP.md guide for Cloudflare R2 bucket setup and configuration
- ATTACHMENTS_IMPLEMENTATION.md technical documentation for the attachment system

### Changed

**Detail Page Improvements**

- Simplified detail pages by removing redundant metadata cards
- Moved tags sections to consistent position with icon indicators
- Added clickable links to parent/child relationships (tasks, notes)
- Improved layout consistency across all entity detail pages (tasks, events, notes, projects)
- Moved attachments section to unified position across all entities
- Detail pages now focus on essential information with cleaner layout

**Environment Configuration**

- Updated .env.example with R2 storage configuration and detailed setup comments
- Updated .prettierignore to exclude wrangler.jsonc from formatting
- Added R2 configuration variables to environment files

**Line Ending Normalization**

- Normalized line endings to LF across configuration files (.env.example, .env.local, .prettierignore, .gitignore)

**Dependencies**

- Added @aws-sdk/client-s3 (^3.916.0) for R2 storage operations
- Added @aws-sdk/s3-request-presigner (^3.916.0) for secure download URLs
- Added @radix-ui/react-progress (^1.1.7) for upload progress UI

**Database Schema**

- New migration (0003_numerous_psynapse) adding attachments table
- Attachments table with polymorphic entity relationships (task_id, event_id, note_id, project_id)
- File metadata tracking (filename, file size, content type, storage path)
- User ownership and timestamps for all attachments

### Fixed

- Event detail page now properly fetches and displays attachments
- Task detail page now includes attachments section with upload functionality
- Note detail page layout improved with proper parent/child note navigation
- Project detail page now supports file attachments for project documents

## [0.5.4] - 2025-10-24

### Changed

- Tag filter dropdown now matches the width of its trigger button for consistent UI alignment with other select components
- Tag filter popover simplified with internal "Clear" button instead of external clear button and header
- Removed external selected tag badges from TagFilter component - selection now managed entirely within the dropdown
- TagInput popover width now matches its trigger button for consistent UI

## [0.5.3] - 2025-10-24

### Added

- Unified authentication page at `/auth` with tabbed interface for login and signup
- Tab persistence in URL (supports `?tab=login` and `?tab=signup` query parameters)

### Changed

- Consolidated login and signup pages into a single `/auth` page with tabs for better UX
- Improved authentication flow with cleaner navigation between login and signup modes
- Normalized line endings across all configuration files (CRLF to LF)

### Removed

- Separate `/login` page (consolidated into `/auth`)
- Separate `/register` page (consolidated into `/auth`)

## [0.5.2] - 2025-10-24

### Changed

- Improved filter components UI with icon indicators for better visual hierarchy (Calendar, Clock, FileText, Star, FolderKanban, ListChecks, Flag icons)
- Enhanced TagFilter button with responsive width and better spacing
- Updated breadcrumbs to show on all dashboard pages (previously hidden on dashboard root)
- Improved kanban board drag-and-drop to support dropping tasks on other tasks (not just columns)
- Code formatting improvements across multiple components

### Fixed

- Fixed VSCode settings.json formatting (removed trailing comma)
- Improved code consistency in sidebar, sheet, and tooltip components with proper formatting

## [0.5.1] - 2025-10-23

### Added

- Logout button in sidebar footer with icon and proper accessibility
- Dedicated calendar.css stylesheet for React Big Calendar customization

### Changed

- Moved React Big Calendar styles from globals.css to dedicated src/styles/calendar.css
- Improved sidebar footer layout with better spacing and visual hierarchy
- Redesigned sidebar footer with separated user info and actions sections
- Enhanced filter layouts across all entity types (tasks, events, notes, projects) with flexbox wrapping for better responsive behavior
- Updated calendar styles to use CSS custom properties for better theme integration
- Improved calendar view toggle buttons with modern pill-style design
- Added visual separation in sidebar footer with divider line

### Fixed

- Filter components now properly align and wrap on smaller screens
- Calendar container now has proper card styling with border and padding
- Breadcrumb list now has proper left margin spacing
- Sidebar footer actions are now properly accessible in collapsed state

## [0.5.0] - 2025-10-23

### Added

**Modern Dashboard Layout**

- AppSidebar component with collapsible sidebar (Cmd+B shortcut)
- DashboardBreadcrumbs component with dynamic breadcrumb generation
- ConditionalLayout component for separating public and dashboard layouts
- Sidebar component from shadcn/ui with mobile responsive Sheet support
- State persistence for sidebar collapsed/expanded state via cookies
- Sticky header in dashboard with sidebar trigger and breadcrumbs
- Full-width content area in dashboard (removed max-width constraint)

### Changed

**Dashboard UX Improvements**

- Dashboard layout now uses SidebarProvider for state management
- Removed footer from dashboard pages (footer only on public pages)
- Removed navbar from dashboard pages (navbar only on public pages)
- Dashboard content area now uses full viewport width for better space utilization
- Sidebar collapses to icon-only mode with tooltips on hover
- Mobile sidebar opens as slide-in Sheet for better mobile UX
- Breadcrumbs automatically generated from current pathname with smart labeling
- Breadcrumbs hidden on dashboard root page for cleaner UI

### Removed

- DashboardNav component (replaced by AppSidebar)
- Container constraint in dashboard layout (now full-width)

## [0.4.0]

### Added

**Dashboard Enhancements**

- QuickStats component displaying task, event, note, and project counts
- QuickActions component with shortcuts to create new entities
- TodayView component showing today's tasks and events
- UpcomingDeadlines component for tracking approaching due dates
- Enhanced dashboard homepage with comprehensive overview of user's workflow
- Skeleton loaders for dashboard components during data loading

**Kanban Board for Tasks**

- KanbanBoard component with drag-and-drop task management
- KanbanColumn component for status-based task organization
- KanbanCard component with compact task display
- TasksView component to toggle between list and kanban views
- Status-based columns (Todo, In Progress, Done, Cancelled)
- Visual task management interface for improved productivity

**UI Components**

- Skeleton component for consistent loading states across the application

### Changed

**UI/UX Consistency Improvements**

- Enhanced PageHeader component with `backButton` and `actions` props for consistent navigation
- Migrated all pages to use standardized PageHeader component (100% coverage)
- Added back buttons to all detail pages (Tasks, Events, Notes, Projects)
- Standardized form action buttons layout (Cancel first, Submit last, consistent spacing)
- Created reusable EmptyState component with icon, title, description, and optional action
- Applied EmptyState component to all list views (Tasks, Events, Notes, Projects)
- Standardized error colors to use `text-destructive` instead of `text-red-500`
- Improved Projects detail page header with icon integration and action buttons

**Component Enhancements**

- PageHeader now supports back navigation and action buttons rendering
- EmptyState provides consistent empty state UI across all entity lists
- TaskList, EventList, NoteList empty states now include actionable "Create" buttons
- ProjectList empty state adapts based on filter state (filtered vs. no data)
- Tasks page now supports switching between list and kanban board views

**Documentation**

- Removed template-specific authentication documentation (AUTHENTICATION.md, AUTHENTICATION_ADVANCED.md)
- Removed template-specific system documentation (EMAIL_SYSTEM.md, MIDDLEWARE.md, RBAC.md)
- Updated DEPLOYMENT.md to reflect Plannerinator branding
- Updated planning documents (BACKLOG.md, ROADMAP.md)
- Updated CODE_QUALITY.md with current project standards

### Added (Dependencies)

- lucide-react (^0.468.0) - Icon library for consistent iconography throughout the app

### Fixed

- EventForm button order and spacing now consistent with other forms
- All page headers now use consistent text size (`text-4xl`) and styling
- Form validation error messages use semantic `text-destructive` color
- Task server actions now properly handle form data and validations

## [0.3.0]

### Added

**Tag Filtering System**

- Universal TagFilter component for filtering entities by tags across all pages
- Multi-select tag interface with checkboxes in popover
- AND/OR logic toggle (match all tags vs. match any tag)
- Active tag badges with clear button
- URL synchronization for tag filters (tags and tagLogic params)
- Integrated tag filtering in Tasks, Events, Notes, and Projects pages

**Event Calendar View**

- EventCalendar component with monthly calendar grid view
- EventsView component to toggle between list and calendar views
- Calendar navigation (previous/next month)
- Event display on calendar dates with color-coded badges
- Multi-event support per day with visual indicators
- react-big-calendar integration for calendar functionality

**Rich Markdown Editor for Notes**

- MarkdownEditor component with live preview
- Syntax highlighting for code blocks (react-syntax-highlighter)
- GitHub Flavored Markdown support (GFM) with tables, task lists, strikethrough
- HTML rendering support with rehype-raw
- Split view: edit and preview side-by-side
- Integrated in note creation and editing forms

**Developer Tools & Infrastructure**

- Custom slash commands for common operations:
  - `/changelog` - Analyze changes and update CHANGELOG.md
  - `/release` - Create and publish version releases
  - `/deploy` - Deploy to Cloudflare Workers
- .gitignore file for proper version control exclusions
- Updated documentation structure (future/, planning/, technical/ folders)

### Changed

- Event pages now support tag filtering with AND/OR logic
- Event list page includes calendar/list view toggle
- Note forms now use rich markdown editor instead of plain textarea
- Task, Note, and Project filters expanded to support tag-based filtering
- Documentation files reorganized into thematic subdirectories
- Database connection updated to new Neon PostgreSQL instance

### Added (Dependencies)

- react-big-calendar (^1.19.4) - Calendar component library
- react-markdown (^10.1.0) - Markdown rendering
- react-syntax-highlighter (^16.0.0) - Code syntax highlighting in markdown
- rehype-raw (^7.0.0) - HTML support in markdown
- remark-gfm (^4.0.1) - GitHub Flavored Markdown
- @tailwindcss/typography (^0.5.19) - Beautiful typography styles for markdown
- @types/react-big-calendar (^1.16.3) - TypeScript types for calendar
- @types/react-syntax-highlighter (^15.5.13) - TypeScript types for syntax highlighter

## [0.2.0]

### Added - Phase 1: Core Entities & Universal Features

**Event Management**

- Event Server Actions (`features/events/actions.ts`):
  - `createEvent()` - Create calendar events with location and recurrence support
  - `updateEvent()` - Update events with all-day flag support
  - `deleteEvent()` - Delete events with ownership validation
- Event Database Queries (`features/events/queries.ts`):
  - `getEventById()` - Get single event with project relation
  - `getEvents()` - Get events with filters (calendar type, date range, project)
  - `getUpcomingEvents()` - Events starting from now
  - `getEventsByDateRange()` - Events in specific time period
  - `getEventsByProject()` - Project-filtered events
  - `searchEvents()` - Full-text search in title/description/location
- Event Pages:
  - `/dashboard/events` - Event list/calendar view with filters
  - `/dashboard/events/new` - Event creation page
  - `/dashboard/events/[id]` - Event detail and edit page
- Event Components (`components/events/`):
  - `EventCard` - Card with date/time, location, badges, actions menu
  - `EventList` - List view with empty state handling
  - `EventForm` - Create/edit form with date/time pickers, Zod validation
  - `EventFilters` - Filters for calendar type, date range, project (URL sync)

**Note Management**

- Note Server Actions (`features/notes/actions.ts`):
  - `createNote()` - Create notes with markdown content
  - `updateNote()` - Update notes with type classification
  - `deleteNote()` - Delete notes with ownership validation
  - `pinNote()` / `unpinNote()` - Pin/unpin notes for quick access
- Note Database Queries (`features/notes/queries.ts`):
  - `getNoteById()` - Get single note with project relation
  - `getNotes()` - Get notes with filters (type, project, search, pinned)
  - `getPinnedNotes()` - Quick access to pinned notes
  - `getNotesByProject()` - Project-filtered notes
  - `getNotesByType()` - Filter by type (note, document, research, idea, snippet)
  - `searchNotes()` - Full-text search in title and content
- Note Pages:
  - `/dashboard/notes` - Note list page with filters
  - `/dashboard/notes/new` - Note creation page
  - `/dashboard/notes/[id]` - Note detail and edit page
- Note Components (`components/notes/`):
  - `NoteCard` - Card with preview, type badge, pin indicator, actions menu
  - `NoteList` - List view with empty state handling
  - `NoteForm` - Create/edit form with markdown textarea, type selector
  - `NoteFilters` - Filters for type, pinned status, project, search (URL sync)

**Project Management**

- Project Server Actions (`features/projects/actions.ts`):
  - `createProject()` - Create projects with color and icon customization
  - `updateProject()` - Update project details and status
  - `deleteProject()` - Delete projects (orphans related entities)
  - `archiveProject()` / `unarchiveProject()` - Archive completed projects
- Project Database Queries (`features/projects/queries.ts`):
  - `getProjectById()` - Get single project with full stats (task/event/note counts)
  - `getProjects()` - Get projects with filters (status, archived)
  - `getActiveProjects()` - Non-archived projects only
  - `getArchivedProjects()` - Archived projects
  - `getProjectStats()` - Detailed stats (total/completed tasks, upcoming events, note count)
  - `searchProjects()` - Full-text search in name and description
- Project Pages:
  - `/dashboard/projects` - Project grid/list with filters
  - `/dashboard/projects/new` - Project creation page
  - `/dashboard/projects/[id]` - Project dashboard with stats and related entities
- Project Components (`components/projects/`):
  - `ProjectCard` - Card with color indicator, stats, status badge, actions menu
  - `ProjectList` - Grid/list view with empty state
  - `ProjectForm` - Create/edit form with color picker, icon selector, status dropdown
  - `ProjectFilters` - Filters for status and archived state
  - `DeleteProjectButton` - Confirmation dialog for project deletion

**Universal Features - Tags System**

- Tag Server Actions (`features/tags/actions.ts`):
  - `createTag()` - Create new tags with auto-slug generation
  - `deleteTag()` - Delete tags (removes all entity associations)
  - `addTagToEntity()` - Associate tag with task/event/note/project
  - `removeTagFromEntity()` - Remove tag association
  - `bulkAddTags()` - Add multiple tags to an entity at once
- Tag Database Queries (`features/tags/queries.ts`):
  - `getTagById()` - Get single tag
  - `getTags()` - Get all user's tags
  - `getTagsByEntity()` - Get tags for specific entity
  - `getPopularTags()` - Most-used tags (ordered by usage count)
  - `searchTags()` - Search tags by name
  - `getOrCreateTag()` - Find existing tag or create new one
- Tag Components (`components/tags/`):
  - `TagBadge` - Visual tag badge with colors
  - `TagInput` - Auto-complete input for adding tags (creates new tags on-the-fly)

**Universal Features - Comments System**

- Comment Server Actions (`features/comments/actions.ts`):
  - `createComment()` - Add comments to tasks/events/notes/projects
  - `updateComment()` - Edit existing comments
  - `deleteComment()` - Delete comments with ownership validation
- Comment Database Queries (`features/comments/queries.ts`):
  - `getCommentById()` - Get single comment with user details
  - `getCommentsByEntity()` - Get all comments for an entity (ordered by date)
  - `getCommentCount()` - Count comments on an entity
- Comment Components (`components/comments/`):
  - `CommentCard` - Comment display with user avatar, timestamp, edit/delete actions
  - `CommentForm` - Add/edit comment form
  - `CommentThread` - Full comment thread display with loading states

**Universal Features - Links System**

- Link Server Actions (`features/links/actions.ts`):
  - `createLink()` - Link two entities together (task↔event, task↔note, etc.)
  - `deleteLink()` - Remove entity link
  - `bulkCreateLinks()` - Link multiple entities at once
- Link Database Queries (`features/links/queries.ts`):
  - `getLinkById()` - Get single link
  - `getLinkedEntities()` - Get all entities linked to a given entity (with type info)
  - `getLinksBetween()` - Check if link exists between two entities
- Link Helpers (`features/links/helpers.ts`):
  - `getEntityTypeName()` - Human-readable entity type names
  - `getEntityIcon()` - Lucide icons for entity types
- Link Components (`components/links/`):
  - `LinkCard` - Visual card showing linked entity with icon, title, metadata
  - `EntityLinksSection` - Section showing all linked entities for current entity
  - `AddLinkDialog` - Dialog to search and link entities

**Global Search with Command Palette**

- Search Queries (`features/search/queries.ts`):
  - `globalSearch()` - Search across all entities (tasks, events, notes, projects)
  - Multi-field search (title, description, content, location)
  - Type filtering and result grouping
  - Fuzzy matching with PostgreSQL ILIKE
- Search Components (`components/search/`):
  - `CommandPalette` - Global keyboard-activated search (Cmd+K / Ctrl+K)
  - Grouped results by entity type
  - Keyboard navigation support
  - Quick navigation to entity pages

**Testing Infrastructure**

- Vitest configuration for unit and integration tests
- Test files for validation schemas:
  - `features/events/schema.test.ts` - Event validation tests
  - `features/notes/schema.test.ts` - Note validation tests
  - `features/projects/schema.test.ts` - Project validation tests
- Test commands: `pnpm test`, `pnpm test:watch`, `pnpm test:ui`

**Developer Utilities**

- `lib/branded-types.ts` - Type-safe branded IDs (prevents mixing TaskId with EventId, etc.)
- `lib/dates.ts` - Date formatting and manipulation utilities (formatting, relative time, date ranges)
- `lib/labels.ts` - Human-readable label generators for status, priority, event type, note type
- `lib/features.ts` - Feature flag helpers for entity type checks
- `lib/type-guards.ts` - Runtime type guards for all entity types and enums
- `lib/json-schema.ts` - Type-safe JSON schema for JSONB fields
- `lib/load-env.ts` - Environment variable loader with validation

**Documentation**

- `docs/plannerinator/CODE_QUALITY.md` - Code quality standards and best practices
- `docs/plannerinator/ENHANCEMENTS.md` - Detailed enhancement proposals and future features
- `docs/plannerinator/ROADMAP.md` - Updated roadmap with Phase 1 completion status

**UI/UX Improvements**

- Consistent card-based design across all entity types
- Color-coded priority and status badges
- Empty states for all list views
- Loading states and skeleton loaders
- Toast notifications for all CRUD operations
- Responsive mobile-friendly layouts
- Dark mode support throughout
- Icon indicators for entity types
- Dropdown action menus (edit, delete, archive, pin, etc.)
- URL-synced filters with search params

**Technical Improvements**

- Auto-revalidation of cached pages on all mutations
- Type-safe Server Actions with comprehensive Zod validation
- User ownership validation on all operations
- Optimized Drizzle queries with proper relations and joins
- Consistent error handling and user feedback
- Markdown support for note content
- Date/time parsing and formatting with proper timezone handling
- Slug generation for tags
- Fuzzy search with ILIKE patterns

---

### Removed

- Blog management pages (removed placeholder feature not in core scope)
- Newsletter management page (removed placeholder feature not in core scope)
- Contacts management page (removed placeholder feature not in core scope)

### Changed

- Dashboard navigation updated with new entity sections (Tasks, Events, Notes, Projects)
- Dashboard home page now shows quick stats and recent activity across all entities
- Database configuration updated for new Neon PostgreSQL instance
- Updated documentation across all files to reflect Phase 1 completion

### Added - Phase 1: Task Management

**Backend**

- Task Server Actions (`features/tasks/actions.ts`):
  - `createTask()` - Create new task with auto userId assignment
  - `updateTask()` - Update task with auto completedAt management
  - `deleteTask()` - Delete task with ownership validation
  - `markTaskComplete()` / `markTaskIncomplete()` - Quick status toggle
  - `bulkTaskOperation()` - Bulk delete, complete, status/priority updates
- Task Database Queries (`features/tasks/queries.ts`):
  - `getTaskById()` - Get single task with project, subtasks, parent relations
  - `getTasks()` - Get tasks with advanced filters (status, priority, project, date range, search)
  - `getSubtasks()` - Get child tasks of a parent
  - `searchTasks()` - Full-text search in title and description
  - `getTasksByProject()` - Tasks filtered by project
  - `getTasksDueToday()` - Tasks due in current day
  - `getOverdueTasks()` - Incomplete tasks past due date

**Frontend**

- Task Pages:
  - `/dashboard/tasks` - Task list page with filters and pagination
  - `/dashboard/tasks/new` - Task creation page
  - `/dashboard/tasks/[id]` - Task detail and edit page
- Task Components (`components/tasks/`):
  - `TaskCard` - Card component with checkbox, badges, actions menu
  - `TaskList` - List view with empty state handling
  - `TaskForm` - Create/edit form with react-hook-form + Zod validation
  - `TaskFilters` - Filters for status, priority, search (URL sync)

**Features**

- ✅ Full CRUD operations for tasks
- ✅ Task completion with checkbox (inline quick action)
- ✅ Task priority levels (low, medium, high, urgent) with color-coded badges
- ✅ Task status workflow (todo, in_progress, done, cancelled)
- ✅ Due date tracking with overdue detection
- ✅ Start date and duration fields
- ✅ Project assignment with visual badges
- ✅ Parent-child task relationships (subtasks)
- ✅ Full-text search in title and description
- ✅ Advanced filters (status, priority, project, date range)
- ✅ Bulk operations (delete, complete, update status/priority)
- ✅ Toast notifications for all actions
- ✅ Responsive design (mobile-friendly)
- ✅ Loading states and error handling
- ✅ Empty states

**Technical**

- Auto-revalidation of cached pages on mutations
- Type-safe Server Actions with Zod validation
- User ownership validation on all operations
- Drizzle ORM queries with relations
- URL-synced filters with search params

## [0.1.0]

### Added - Phase 0: Foundation (100% Complete)

**Authentication & Authorization**

- Better Auth integration with PostgreSQL
- Email/password authentication
- Password reset flow with email verification
- Email verification on signup
- RBAC system (user/admin roles)
- Protected routes with middleware
- Session management (JWT + HttpOnly cookies)
- Database-backed rate limiting (edge-compatible)

**Database & Schema**

- Complete database schema for all planned entities:
  - Authentication tables (user, session, account, verification)
  - Core entities (task, event, note, project)
  - Collections system (collection, collection_item)
  - Universal features (link, tag, entity_tag, comment, activity_log)
- Database indexes for optimal query performance
- Drizzle ORM setup with migrations
- Type-safe database queries

**Type Safety & Validation**

- TypeScript strict mode enabled
- Zod validation schemas for all entities:
  - `features/tasks/schema.ts` - Task validation
  - `features/events/schema.ts` - Event validation
  - `features/notes/schema.ts` - Note validation
  - `features/projects/schema.ts` - Project validation
  - `features/auth/schema.ts` - Auth validation
  - `features/users/schema.ts` - User validation
  - `features/profile/schema.ts` - Profile validation
- Branded types for IDs (TaskId, EventId, NoteId, etc.) - prevents mixing different ID types
- Runtime type guards for all entity types and enums
- Type-safe JSON schema for JSONB fields (no `any` usage)
- Drizzle-inferred types for all database tables

**UI Infrastructure**

- Next.js 15 App Router with React 19
- Tailwind CSS 4 for styling
- shadcn/ui component library integration
- Dark mode support (next-themes)
- Responsive layout (mobile-first approach)
- Dashboard shell with sidebar navigation
- Mobile-responsive navigation with drawer

**User Management**

- Profile page (view + edit)
- Password change functionality
- User list page (admin only)
- Role management (admin can change user roles)

**Developer Experience**

- ESLint configuration
- Prettier code formatting
- TypeScript configuration (strict mode)
- Turbopack for fast development builds
- Environment variables setup
- Cloudflare Workers deployment configuration
- Database migration scripts
- Code documentation (JSDoc comments)

**Documentation**

- Complete ROADMAP.md with progress tracking
- DATABASE_SCHEMA.md with detailed table documentation
- ARCHITECTURE.md explaining application structure
- AUTHENTICATION.md for auth setup
- RBAC.md for permissions system
- EMAIL_SYSTEM.md for email configuration
- API_DESIGN.md for Server Actions patterns
- UI_PATTERNS.md for component patterns

### Technical Details

- **Database:** PostgreSQL (Neon) with connection pooling
- **ORM:** Drizzle ORM with edge runtime support
- **Auth:** Better Auth v1.3+ with custom PBKDF2 password hashing
- **Deployment:** Cloudflare Workers via OpenNext
- **Email:** Resend integration (optional, mock by default)
- **Forms:** React Hook Form + Zod validation
- **Styling:** Tailwind CSS 4 with PostCSS
- **Icons:** Lucide React

### Security

- CSRF protection (Better Auth built-in)
- XSS prevention (React auto-escape)
- SQL injection prevention (Drizzle parametrized queries)
- Rate limiting on authentication endpoints
- Password hashing with PBKDF2 (100k iterations)
- HttpOnly cookies for session tokens
- Secure password reset flow with time-limited tokens

### Performance

- Server-side rendering (React Server Components)
- Server Actions for type-safe mutations
- Database connection pooling
- Optimized database indexes
- Code splitting
- Lazy loading for components

[unreleased]: https://github.com/essedev/plannerinator/compare/v0.11.0...HEAD
[0.11.0]: https://github.com/essedev/plannerinator/compare/v0.10.0...v0.11.0
[0.10.0]: https://github.com/essedev/plannerinator/compare/v0.9.0...v0.10.0
[0.9.0]: https://github.com/essedev/plannerinator/compare/v0.8.0...v0.9.0
[0.8.0]: https://github.com/essedev/plannerinator/compare/v0.7.0...v0.8.0
[0.7.0]: https://github.com/essedev/plannerinator/compare/v0.6.0...v0.7.0
[0.6.0]: https://github.com/essedev/plannerinator/compare/v0.5.4...v0.6.0
[0.5.4]: https://github.com/essedev/plannerinator/compare/v0.5.3...v0.5.4
[0.5.3]: https://github.com/essedev/plannerinator/compare/v0.5.2...v0.5.3
[0.5.2]: https://github.com/essedev/plannerinator/compare/v0.5.1...v0.5.2
[0.5.1]: https://github.com/essedev/plannerinator/compare/v0.5.0...v0.5.1
[0.5.0]: https://github.com/essedev/plannerinator/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/essedev/plannerinator/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/essedev/plannerinator/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/essedev/plannerinator/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/essedev/plannerinator/releases/tag/v0.1.0
