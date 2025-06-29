# FlowSheets Project Overview and Implementation Plan

## Project Summary
FlowSheets is a local web-based tool for creating **workflow templates** and running **worksheets** (live workflow instances). It provides a visual canvas where users arrange nodes, attach tasks, and track progress in real time. Each node shows its state using color and pattern cues for accessibility. Tasks may be manually checked or automatically evaluated via plug-ins such as an SVN tag check. The system supports multi-user collaboration, role-based permissions, and persistent storage in human-readable JSON files.

### Key Features
- **Templates and Worksheets** – reusable templates spawn worksheets used to track real processes.
- **Three Interaction Modes** – *Flow* (interactive run-time), *Edit* (structural changes), and *View* (read-only).
- **Visual Canvas** – drag-and-drop editing with a single generic flow node. Any node can connect to multiple downstream nodes to create branches. Additional components such as sub-workflow nodes, configuration tables, notes, and optional action buttons are available.
- **Task Plug‑ins** – built-in task types include CheckboxTask, SvnTagTask, and InputTask. Additional types can be added via a Java Service Provider Interface.
- **Real-Time Collaboration** – updates are pushed via WebSockets so multiple users see changes immediately. A user list panel shows who is connected and their current mode.
- **Confirm/Revert** – privileged users can store “Confirm Snapshots” and later revert to any snapshot. Undo/redo tracks recent session edits.
- **Persistence** – all worksheets, templates, and snapshots stored as JSON in a file hierarchy. Activity logs rotate daily and are ISO‑8601 stamped.
- **Accessibility** – every state uses both color and pattern cues, ensuring WCAG AA compliance.
- **Technology Stack** – Java 17, Spring Boot 3, Gradle, Spring Security, STOMP over WebSocket for real-time sync, and a front end initially built with plain JavaScript (React/TypeScript optional).

## Clarifications
- **Asynchronous branching** – branching is achieved by connecting any node to multiple targets. No dedicated split/merge nodes are planned for the first release.
- **Generative AI interface** – integration with external AI agents will be deferred; design APIs with future AI use in mind.
- **Front-end framework** – the initial UI can be implemented in plain JavaScript. React with TypeScript is optional.
- **Task plug‑in packaging** – core tasks are compiled in now, but the plug‑in SPI should allow dynamic loading from external JARs later.

## Implementation Plan
The following phased tasks build the minimal working version and prepare for future extensions. Each step should be checked off once complete.

1. **Project Skeleton**
   - Set up a Gradle-based Spring Boot project with Java 17.
   - Create a front-end served by Spring Boot using plain JavaScript (React/TypeScript optional).
   - Define the folder structure for `/data/templates/` and `/data/worksheets/`.

2. **Authentication and Roles**
   - Implement a file-based `AuthProvider` with users, bcrypt hashes, and roles (`admin`, `editor`, `contributor`, `viewer`).
   - Provide an initial user `jaek` with password `test`.
   - Enforce per-worksheet ACLs.

3. **Core Data Model**
   - Define JSON schemas for templates and worksheets including nodes, tasks, connections, configuration values, ACL, and confirm snapshot list.
   - Implement load/save utilities and an append-only activity log (daily rotated).

4. **Task Plug‑in SPI**
   - Design the Java ServiceLoader interface for task types with future support for loading external JARs at runtime.
   - Implement built-in tasks: CheckboxTask, SvnTagTask (server-side credentials in `application.yaml`), and InputTask. These tasks are packaged with the application.
   - Support periodic auto-refresh (default every 10 minutes) and manual recheck.

5. **REST and WebSocket API**
   - Provide endpoints under `/api/v1/` for listing, creating, renaming, deleting, and copying worksheets and templates.
   - Implement STOMP topics for worksheet updates so connected clients receive real-time changes.

6. **Front-End Dashboard**
   - Build login flow and dashboard showing searchable lists of templates and worksheets.
   - Implement context menus for actions (Open, Rename, Copy, Delete, Create Instance/Template).

7. **Worksheet Canvas Basics**
   - Render nodes with state-based color/pattern and icons.
   - Allow mode switching (Flow/Edit/View) via a toggle component and right-click menu.
   - Support drag-and-drop node positioning and connection creation in Edit mode.
   - Display task checklist within each node and allow ticking/unticking or override.

8. **Components and Sub-Workflows**
   - Provide a single flow node type; nodes may branch to multiple targets.
   - Implement the configuration table, generic action button, and note components.
   - Support sub-workflow nodes that open in a new tab or window.
   - Add a dockable Component-Repo palette (Edit mode only).
9. **Collaboration Features**
   - Show connected users with their interaction mode in a panel on the canvas.
   - Ensure simultaneous edits merge correctly and broadcast via WebSocket.

10. **Confirm/Revert and History**
    - Implement “Accept State” to store confirm snapshots and clear highlights.
    - Provide a Revert dialog listing snapshots chronologically.
    - Add an undo/redo component with a stack depth of 200 actions.

11. **Testing and Accessibility Verification**
    - Write JUnit 5 tests for backend services; use Testcontainers to mock SVN operations.
    - Verify WCAG AA compliance of color and pattern cues.

12. **Documentation**
    - Create user guides covering template design, worksheet operation, and collaboration features.
    - Document the REST/WebSocket API for future integrations.

13. **Future Enhancements (not in initial release)**
    - Theme editor for color/pattern schemes.
    - Automatic SCM commits of JSON files.
    - Drag-assignment of users to tasks.
    - Generative AI agent interface and additional task plug-ins (Git, HTTP, Jenkins).

