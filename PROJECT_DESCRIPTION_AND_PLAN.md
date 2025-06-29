# FlowSheets Project Overview and Implementation Plan

## Project Summary
FlowSheets is a local web-based tool for creating **workflow templates** and running **worksheets** (live workflow instances). It provides a visual canvas where users arrange nodes, attach tasks, and track progress in real time. Each node shows its state using color and pattern cues for accessibility. Tasks may be manually checked or automatically evaluated via plug-ins such as an SVN tag check. The system supports multi-user collaboration, role-based permissions, and persistent storage in human-readable JSON files.

### Key Features
- **Templates and Worksheets** – reusable templates spawn worksheets used to track real processes.
- **Three Interaction Modes** – *Flow* (interactive run-time), *Edit* (structural changes), and *View* (read-only).
- **Visual Canvas** – drag-and-drop node editing, directional connections, sub-workflow nodes, configuration table component, and optional action buttons.
- **Task Plug‑ins** – built-in task types include CheckboxTask, SvnTagTask, and InputTask. Additional types can be added via a Java Service Provider Interface.
- **Real-Time Collaboration** – updates are pushed via WebSockets so multiple users see changes immediately. A user list panel shows who is connected and their current mode.
- **Confirm/Revert** – privileged users can store “Confirm Snapshots” and later revert to any snapshot. Undo/redo tracks recent session edits.
- **Persistence** – all worksheets, templates, and snapshots stored as JSON in a file hierarchy. Activity logs rotate daily and are ISO‑8601 stamped.
- **Accessibility** – every state uses both color and pattern cues, ensuring WCAG AA compliance.
- **Technology Stack** – Java 17, Spring Boot 3, Gradle, Spring Security, STOMP over WebSocket for real-time sync, and a React/TypeScript front end.

## Clarifications Needed
1. **Asynchronous split/merge nodes** – should support for async branching be part of the first release or deferred?
2. **Generative AI interface** – is integration with external AI agents required initially or planned for a later phase?
3. **Front-end framework** – is React with TypeScript the preferred choice for the UI, or is plain JavaScript acceptable?
4. **Task plug‑in packaging** – should new tasks be loaded dynamically from external JARs at runtime or compiled into the application?

## Implementation Plan
The following phased tasks build the minimal working version and prepare for future extensions. Each step should be checked off once complete.

1. **Project Skeleton**
   - Set up a Gradle-based Spring Boot project with Java 17.
   - Create a React/TypeScript front-end project served by Spring Boot.
   - Define the folder structure for `/data/templates/` and `/data/worksheets/`.

2. **Authentication and Roles**
   - Implement a file-based `AuthProvider` with users, bcrypt hashes, and roles (`admin`, `editor`, `contributor`, `viewer`).
   - Provide an initial user `jaek` with password `test`.
   - Enforce per-worksheet ACLs.

3. **Core Data Model**
   - Define JSON schemas for templates and worksheets including nodes, tasks, connections, configuration values, ACL, and confirm snapshot list.
   - Implement load/save utilities and an append-only activity log (daily rotated).

4. **Task Plug‑in SPI**
   - Design the Java ServiceLoader interface for task types.
   - Implement built-in tasks: CheckboxTask, SvnTagTask (server-side credentials in `application.yaml`), and InputTask.
   - Support periodic auto-refresh (default every 10 minutes) and manual recheck.

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
   - Implement the configuration table component and generic action button component.
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

