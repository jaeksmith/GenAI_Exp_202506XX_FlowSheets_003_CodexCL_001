# FlowSheets – Enhanced Functional Specification with Interaction Details

## Overview
FlowSheets is a local, web-based visual workflow editor and tracker. It enables users to design reusable **Templates** for workflows and create live **Worksheets** instances from these templates to manage and visualize task progression.

## User Interaction Flow

### User Login and Dashboard
Upon login, users are presented with a clean dashboard. Here users see:
- **Searchable lists** of accessible Worksheets and Templates.
- Ability to double-click to open for editing.
- Right-click context menus with options:
  - Templates: Open, Rename, Copy, Delete, Create Instance
  - Worksheets: Open, Rename, Copy, Delete, Create Template

### Modes of Interaction
Worksheets support three clear interaction modes:
- **Flow Mode:** For interactive task management.
- **Edit Mode:** For structural modification of the workflow.
- **View Mode:** Read-only overview.

Mode switching is intuitive via a toggle button prominently displayed on the canvas.

### Worksheet Canvas – Visual Interaction
The Worksheet Canvas is the primary interaction area. It visually displays the state and progression of workflows through nodes and connectors:

#### Node Representation
- Nodes clearly show the current state visually:
  - **FUTURE**: Pale grey background, clock icon
  - **IN_PROCESS**: Soft yellow with diagonal stripes, play icon
  - **COMPLETE**: Gentle green with cross-hatch, checkmark icon
  - **OVERRIDDEN**: Light blue with dots, flag icon
  - **ERROR**: Soft red with heavy diagonal stripes, exclamation icon

Nodes display a checklist of associated Tasks. Completed tasks show a checkmark. Users click tasks to mark manual checks or override automatic checks. Hovering over a task provides additional details and tooltips.

#### Node Interaction (Flow Mode)
- Users check/uncheck tasks directly.
- Users can override or bypass tasks/nodes with appropriate permissions, indicated visually with a distinctive pattern (dotted/flag).

#### Node Editing (Edit Mode)
- Nodes can be repositioned freely via drag-and-drop.
- Right-dragging from a node edge quickly creates directional connections.
- ESC key or clicking away cancels operations intuitively.
- Context menus allow renaming, pattern/color adjustment, and deletion.
- Nodes and components are easily dragged from the Component-Repo palette, a dockable side panel.

#### Sub-Workflows
- Sub-workflow nodes visually differ slightly (e.g., distinctive border).
- Clicking on a sub-workflow node opens it in a separate tab/window, clearly linking back to the main workflow for context.

#### Component Interaction
- A **Config Table Component** allows defining variables (e.g., ProjectVersion, ProjectShortName) usable throughout the worksheet.
- Components such as buttons can be dragged onto the canvas and configured to trigger worksheet-level actions (e.g., re-check tasks).

#### Real-Time Collaboration
- Multiple users can simultaneously view and interact with the same worksheet.
- A **User List Panel** on the canvas shows all current viewers with their interaction modes (View, Flow, Edit).
- State changes (task completions, overrides) immediately reflect across all user instances.

#### Highlighting and State Confirmation
- Changes since the last confirmed state appear highlighted distinctly in yellow.
- Users with appropriate roles confirm changes via a clearly visible "Accept State" button. Upon confirmation:
  - Highlights clear.
  - A Confirm Snapshot is stored.
  - Optional hooks trigger for downstream integrations.

#### History and Reversion
- Right-clicking on an empty canvas space offers "Revert" functionality.
- Selecting revert opens a clear, floating panel displaying past Confirm Snapshots (timestamps).
- Choosing a snapshot restores that exact workflow state, logging this action in an activity log.

#### Undo/Redo
- Changes within a session are reversible via intuitive Undo/Redo buttons located visibly on the canvas.

### Task Types and Plug-ins
Tasks are atomic criteria that define node completion:
- **CheckboxTask:** Simple manual tick.
- **SvnTagTask:** Automatic server-side SVN checks (with regex support).
- **InputTask:** User inputs values with optional validation.

Plug-in tasks are easily added via an SPI, allowing integration of new automated checks like Git, HTTP JSON, Jenkins, etc.

### Extensibility
- Component and task types are fully pluggable.
- Security/authentication is modular, defaulting to a simple file-based system.
- APIs allow integration with external scripts or Generative AI agents.

### Accessibility
- Ensures WCAG AA compliance with redundant visual cues (color, patterns, icons).

### Persistence and Transparency
- Data stored in human-readable JSON format.
- Activity logs recorded in ISO-8601 format with daily rotation, allowing easy auditing.
- JSON files and snapshots versioned and stored in a structured file hierarchy for easy manual or scripted access.

### Non-Functional Requirements
- Responsiveness maintained with workflows up to 100 nodes and 20 concurrent users.
- UI localization-ready and supports UTF-8 for broad language coverage.

### Technical Stack
- **Language:** Java 17
- **Framework:** Spring Boot 3, Spring Security, WebSocket
- **Build System:** Gradle
- **Communication:** STOMP over WebSocket for real-time updates.

### User Experience Goals
- Clarity through visual cues and clear state transitions.
- Simplicity in workflow interaction and management.
- Real-time collaborative feedback and intuitive interactions for multiple simultaneous users.

