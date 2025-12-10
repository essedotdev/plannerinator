# Changelog

All notable changes to Plannerinator will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.18.0] - 2025-12-10

### Added

**AI Conversation History**

- Conversation history dropdown in AI chat header to browse and resume past conversations
- `ConversationHistoryDropdown` component with recent conversations list
- `ConversationList` component for sidebar conversation navigation
- Automatic conversation persistence - new conversations are saved and can be resumed later
- Load conversation messages when selecting a previous conversation

**AI System Prompt Architecture**

- Modular prompt system with dedicated sections (`src/lib/ai/prompts/`)
- Prompt sections for identity, context, rules, tools, dates, examples, conversation, formatting, and guidelines
- `buildSystemPrompt()` function for composable prompt generation
- `createTemporalContext()` for timezone-aware date handling
- `getUserStats()` for including user statistics in AI context
- Type-safe prompt context with `PromptContext` interface

**AI Verbose Logging**

- New environment variable `AI_VERBOSE_LOGGING` for detailed AI debugging
- Verbose logging of full messages sent to AI
- Verbose logging of AI responses (content, tool calls, finish reason)
- Tool call logging with input parameters
- Tool result logging with execution time tracking

### Changed

**AI Assistant Improvements**

- AI chat drawer now persists conversation ID across messages
- New chat button to start fresh conversations
- Removed cost display from chat (simplified UI)
- Improved chat message tool indicator showing whether tools were used or response was direct
- AI responses now use lower temperature (0.2) for more consistent output

**Database Schema**

- Removed `costUsd` column from `ai_usage` table (cost tracking simplified)

**UI/UX Enhancements**

- Sidebar header height standardized to 64px (`h-16`) for visual consistency with AI drawer
- Sidebar colors now use CSS variables referencing main theme colors for better theme integration
- Simplified dark mode CSS by using CSS variables instead of duplicate rules
- Dashboard layout main content now has `min-w-0` to prevent overflow issues
- Logout button now shows confirmation dialog before signing out
- ThemeToggle component now properly handles hydration with useEffect
- Select component trigger now shows pointer cursor
- Sheet close button now shows pointer cursor
- Trash list item title no longer truncates text
- Trash list action buttons have `shrink-0` to prevent squishing

**Code Quality**

- Refactored AI logging configuration with three separate environment variables:
  - `AI_LOGGING_ENABLED` - Basic logging (default: true)
  - `AI_DB_LOGGING_ENABLED` - Database logging (default: false)
  - `AI_VERBOSE_LOGGING` - Detailed debug logs (default: false)

## [0.17.1] - 2025-12-09

### Changed

**Dependency Updates**

- Updated Next.js from 15.5.4 to 16.0.8 with improved performance and stability
- Updated React and React DOM from 19.2.0 to 19.2.1
- Updated better-auth from 1.3.34 to 1.4.6 with authentication improvements
- Updated @opennextjs/cloudflare from 1.11.0 to 1.14.4 for better Cloudflare Workers deployment
- Updated drizzle-orm from 0.44.7 to 0.45.0 with query optimization improvements
- Updated lucide-react from 0.545.0 to 0.556.0 with new icons
- Updated @react-email/components from 0.5.7 to 1.0.1 (major version)
- Updated react-hook-form from 7.65.0 to 7.68.0
- Updated resend from 6.3.0 to 6.6.0
- Updated zod from 4.1.12 to 4.1.13
- Updated AWS SDK packages (@aws-sdk/client-s3, @aws-sdk/s3-request-presigner) from 3.919.0 to 3.947.0
- Updated @radix-ui packages (react-label, react-progress, react-separator, react-slot) to latest versions
- Updated tailwindcss from 4.1.16 to 4.1.17
- Updated tailwind-merge from 3.3.1 to 3.4.0
- Updated prettier from 3.6.2 to 3.7.4
- Updated eslint from 9.38.0 to 9.39.1 with improved linting rules
- Updated eslint-config-next from 15.5.4 to 16.0.8
- Updated drizzle-kit from 0.31.6 to 0.31.8
- Updated wrangler from 4.45.2 to 4.53.0
- Updated vitest from 3.2.4 to 4.0.15 (major version)
- Updated tsx from 4.20.6 to 4.21.0
- Updated @types packages (@types/node, @types/react, @types/react-dom) to latest versions

**Configuration Improvements**

- Modernized ESLint configuration to use native Next.js config imports instead of @eslint/eslintrc compatibility layer
- Simplified eslint.config.mjs by removing FlatCompat wrapper and using direct imports
- Updated TypeScript configuration with improved paths and module resolution
- Updated next-env.d.ts to use import statement instead of triple-slash reference for better type safety
- Standardized code formatting across configuration files

**Type System Enhancements**

- Improved TypeScript type definitions in cloudflare-env.d.ts with better interface formatting
- Enhanced WorkflowEntrypoint interface formatting for better readability
- Updated type imports in package.json for better type resolution

## [0.17.0] - 2025-11-24

### Added

**AI Assistant Enhancements**

- `query_entities` tool for direct entity listing without text search (list tasks, events, notes, projects with filters and sorting)
- `NoteContentCard` component for note content display with zoom controls
- AI logging system with comprehensive operation tracking (`src/lib/ai/logger.ts`)
- AI log database table for debugging and monitoring AI operations
- Database migration for AI logging schema

**AI Logging Infrastructure**

- Log levels: DEBUG, INFO, WARNING, ERROR
- Tool call and result logging with execution time tracking
- API call and response logging with token usage metrics
- Database query logging for AI operations
- Search operation logging with query and result tracking

### Changed

**AI Assistant Improvements**

- Enhanced AI system prompt with better markdown formatting instructions and examples
- Improved AI chat message markdown rendering with proper heading, blockquote, and list styles
- AI tool handlers now include comprehensive logging for debugging
- AI chat drawer focus management improved (removed focus outline on sheet)

**Form Improvements**

- Date inputs in EventForm, TaskForm, and ProjectForm now have max date validation to prevent invalid dates (max year 9999)

**UI/UX Enhancements**

- Markdown editor preview now has proper top padding for better readability
- MarkdownRenderer component now supports customizable zoom level via `initialZoom` prop
- Chat message bullet lists now use custom styled bullets with better spacing
- Chat message headings (h1, h2, h3) and blockquotes now properly rendered
- Note detail page now uses new `NoteContentCard` component with zoom controls

## [0.16.0] - 2025-11-06

### Added

**AI Assistant Integration**

- AI chat drawer component with conversational interface for natural language interactions
- AI assistant powered by Claude Haiku 4.5 via OpenRouter API
- Conversational AI interface accessible via Cmd+Shift+A keyboard shortcut or header button
- Chat message components with markdown rendering support for rich AI responses
- Token usage tracking and cost calculation for AI API calls
- AI conversation persistence in database with message history
- Tool/function calling support for AI to interact with app data (create tasks, search entities, get statistics)
- AI assistant trigger button in dashboard header with tooltip
- `AiDrawerProvider` context for managing chat drawer state across the app

**AI Backend Infrastructure**

- OpenRouter API integration for Claude model access
- AI conversation database schema with JSONB message storage
- AI usage tracking table for monitoring token consumption and costs
- Server actions for sending AI messages and managing conversations
- Tool handlers for AI function execution (entity operations, search, statistics)
- Type-safe AI function definitions and response handling
- Cost tracking in cents (USD) for precise billing calculations

**AI Components**

- `AiChatDrawer` - Main drawer UI with chat interface
- `AiChatTrigger` - Button component to open AI assistant
- `ChatInput` - Text input with auto-resize and keyboard shortcuts
- `ChatMessage` - Message display with markdown rendering and tool indicators
- `use-ai-drawer` hook for managing drawer open/close state

**Hook Improvements**

- Renamed `useProjectSelection` hook file from PascalCase to kebab-case for consistency
- Renamed attachment preview hooks to kebab-case naming convention

### Changed

**Code Quality & Naming Conventions**

- Migrated hook files to kebab-case naming convention:
  - `useProjectSelection.ts` → `use-project-selection.ts`
  - `useAttachmentPreview.ts` → `use-attachment-preview.ts`
  - `useImagePreview.ts` → `use-image-preview.ts`
  - `usePDFPreview.ts` → `use-pdf-preview.ts`
- Updated all import statements across components to reference new hook file names
- Improved markdown rendering in chat with syntax highlighting for code blocks
- Enhanced chat message styling with proper text color inheritance in both light and dark modes

**Dashboard Layout**

- Dashboard layout now includes AI assistant trigger in header
- Added `AiDrawerProvider` wrapper for AI state management
- Header layout improved with AI chat button positioned in top-right

**Environment Configuration**

- Added OpenRouter API configuration to environment variables
- Updated `.env.example` with AI assistant setup instructions
- Added default Claude Haiku 4.5 model configuration

**Documentation**

- Updated roadmap with AI assistant implementation status
- Removed `.env.local` from repository (moved to gitignore)
- Moved planning documentation to docs folder (ENV_SETUP.md)

**Dependencies**

- Added `rehype-sanitize` (^6.0.0) for secure markdown rendering in AI chat
- Added `react-markdown` and related plugins for chat message formatting

### Removed

- `.env.local` file removed from version control (should remain gitignored)

## [0.15.0] - 2025-11-04

### Added

**Code Reusability - Generic Entity Action Buttons**

- `EntityActionButton` component replacing entity-specific delete and archive button components
- Generic action button supporting both delete and archive operations for all entity types
- Configurable confirmation dialogs with entity-specific messaging
- Centralized loading states and error handling for destructive actions

### Changed

**Component Consolidation**

- Replaced entity-specific delete buttons with generic `EntityActionButton` across all entity detail pages
- Replaced entity-specific archive buttons with generic `EntityActionButton` across all entity detail pages
- Updated entity detail pages (tasks, events, notes, projects) to use consolidated action buttons
- Improved consistency in confirmation dialog messaging across all entity types
- Enhanced error handling with consistent toast notifications for delete and archive operations

**Code Quality**

- Removed code duplication from delete and archive button components (reduced ~500 lines of duplicate code)
- Centralized action button logic in a single reusable component
- Improved maintainability with configuration-based approach for entity-specific behavior
- Better type safety with TypeScript discriminated unions for action types
- Removed unused imports across multiple components for cleaner code

### Removed

- `src/components/tasks/DeleteTaskButton.tsx` (replaced by EntityActionButton)
- `src/components/tasks/ArchiveTaskButton.tsx` (replaced by EntityActionButton)
- `src/components/events/DeleteEventButton.tsx` (replaced by EntityActionButton)
- `src/components/events/ArchiveEventButton.tsx` (replaced by EntityActionButton)
- `src/components/notes/DeleteNoteButton.tsx` (replaced by EntityActionButton)
- `src/components/notes/ArchiveNoteButton.tsx` (replaced by EntityActionButton)
- `src/components/projects/DeleteProjectButton.tsx` (replaced by EntityActionButton)
- `src/components/projects/ArchiveProjectButton.tsx` (replaced by EntityActionButton)
- Removed planning/documentation markdown files moved to docs folder (ENV_SETUP.md, PREVIEW_REFACTORING.md, REFACTORING_PLAN.md)

## [0.14.0] - 2025-10-31

### Added

**PDF Preview Support**

- PDF preview modal with embedded viewer and navigation controls
- `usePDFPreview` hook for managing PDF-specific preview functionality with URL caching
- `PDFPreviewModal` component with download, keyboard shortcuts, and gallery navigation
- PDF preview support integrated into the attachment preview system
- `isPDFMimeType` utility function for PDF type detection

### Changed

**Attachment Preview System**

- Extended preview configuration to support PDF files
- Updated `useAttachmentPreview` hook to handle PDF previews via `usePDFPreview`
- Modified `AttachmentPreviewModal` to render PDF preview modal for PDF files
- Updated `AttachmentThumbnail` to use generic thumbnail for PDFs (icon-based)
- Improved preview type handling to support multiple file types beyond images

### Removed

- Deleted `tsconfig.tsbuildinfo` build artifact from repository

## [0.13.0] - 2025-10-31

### Added

**Attachment Preview System Refactoring**

- `AttachmentThumbnail` component as a generic wrapper for all thumbnail types
- `GenericThumbnail` component for icon-based thumbnails (non-previewable files)
- `AttachmentPreviewModal` component as a generic wrapper for preview modals
- `useAttachmentPreview` hook as a unified interface for all preview types
- Preview configuration system in `preview-config.ts` for managing preview types
- Extensible architecture supporting future preview types (PDF, video, etc.)
- Centralized preview type detection with `canPreview()` and `getPreviewType()` utilities

### Changed

**Attachment System Architecture**

- Refactored attachment preview system to use generic wrapper components
- Replaced direct usage of `ImageThumbnail` with `AttachmentThumbnail` in `AttachmentCard`
- Replaced `ImagePreviewModal` with `AttachmentPreviewModal` in `AttachmentList`
- Extracted file icon and color utilities from `AttachmentCard` to `GenericThumbnail`
- Renamed `isImage` check to `hasPreview` for better semantics
- Improved code organization with clear separation between preview types

**Code Quality**

- Reduced code duplication by centralizing file type detection logic
- Better separation of concerns with dedicated components for each thumbnail type
- Improved maintainability with configuration-based preview type system
- Added comprehensive JSDoc comments explaining extensibility patterns

## [0.12.0] - 2025-10-30

### Added

**Enhanced Attachment System**

- AttachmentCard component extracted from AttachmentList for better reusability
- Image preview modal with navigation between images
- Click-to-preview functionality for image attachments
- Keyboard navigation support for image galleries (prev/next)
- `useAttachment` hook for managing attachment state and operations
- `useAttachmentDownload` hook for handling file downloads with progress tracking
- ImagePreviewModal component with fullscreen viewing and navigation controls
- Attachment helper utilities for file type detection and icon selection

### Changed

**Component Architecture Improvements**

- AttachmentList refactored to use new AttachmentCard component for better code organization
- Image attachments now open in a preview modal instead of downloading directly
- Attachment cards now have preview capability in addition to download and delete actions
- FileUpload component improved with consistent shrink class usage

**UI/UX Enhancements**

- Improved visual consistency across attachment-related components
- Better file type indicators with color-coded icons and backgrounds
- Enhanced attachment interaction patterns with click-to-preview for images
- Improved spacing and layout in attachment cards

**Code Quality & Consistency**

- Replaced all instances of `flex-shrink-0` with Tailwind's `shrink-0` shorthand across 10+ components
- Replaced all instances of `break-words` with `wrap-break-word` for consistent text wrapping
- Standardized import ordering across all attachment components
- Fixed CSS class inconsistencies in Command component
- Removed unused variables and improved code cleanliness in StorageQuota component

**Component Refactoring**

- Attachment handling logic extracted into reusable hooks for better testability
- Download logic centralized in useAttachmentDownload hook
- File type detection and icon selection moved to utility functions
- Preview state management separated into dedicated hook

### Fixed

- Command component CSS selector syntax corrected (replaced `[&_[cmdk-*]]` with proper syntax)
- BreadcrumbList component text wrapping class updated to use correct Tailwind utility
- CommentCard word wrapping behavior improved for better text display

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

[unreleased]: https://github.com/essedev/plannerinator/compare/v0.18.0...HEAD
[0.18.0]: https://github.com/essedev/plannerinator/compare/v0.17.1...v0.18.0
[0.17.1]: https://github.com/essedev/plannerinator/compare/v0.17.0...v0.17.1
[0.17.0]: https://github.com/essedev/plannerinator/compare/v0.16.0...v0.17.0
[0.16.0]: https://github.com/essedev/plannerinator/compare/v0.15.0...v0.16.0
[0.15.0]: https://github.com/essedev/plannerinator/compare/v0.14.0...v0.15.0
[0.14.0]: https://github.com/essedev/plannerinator/compare/v0.13.0...v0.14.0
[0.13.0]: https://github.com/essedev/plannerinator/compare/v0.12.0...v0.13.0
[0.12.0]: https://github.com/essedev/plannerinator/compare/v0.11.0...v0.12.0
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
