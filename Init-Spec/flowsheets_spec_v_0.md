# FlowSheets – Functional Specification v0.2

> **Change log vs v0.1**\
> • Incorporated user answers Q1‑Q12.\
> • Replaced term *Aspect* → **Task**.\
> • Added colour+pattern accessibility rules.\
> • Added third **View Mode** and clarified mode switching & component visibility.\
> • Detailed Component‑Repo palette & User‑list panel.\
> • Introduced Confirm/Revert semantics distinct from Undo/Redo.\
> • Refined Task plug‑in types (Checkbox, SVN‑Tag, User‑Input) & refresh cadence (10 min default).\
> • Switched build to Gradle; stack remains Java 17 + Spring Boot 3.\
> • Added per‑worksheet ACL & capability mapping.\
> • Activity log now ISO‑8601 date‑stamped; supports log rotation.

---

## 1  Overview & Goals

FlowSheets is a **local, web‑based visual workflow editor & tracker**. Users design reusable **templates** and spawn **worksheets** (live instances) to drive any sequential or branching process – software release flows, cooking recipes, personal daily plans, and more.

### 1.1 Typical Usage Flow

1. **Design a template** – In *Edit Mode* the author drags nodes from the Component‑Repo palette, wires them, and attaches Tasks (e.g. SVN tag check, manual checkbox).
2. **Instantiate** – From the dashboard the user right‑clicks → *Create Instance* to spawn a worksheet from that template.
3. **Run the flow** – Team members open the worksheet in *Flow Mode* (or *View Mode* if read‑only). They tick Tasks, watch auto‑checks roll in, and visually track progress via colour/pattern cues.
4. **Confirm** – When satisfied, a privileged user clicks *Accept State*. This stores a **Confirm Snapshot**, clears the yellow "changed" highlight overlay, and (optionally) triggers downstream hooks.
5. **Revisit / Revert** – Need to roll back? Right‑click the canvas → *Revert…* to open a floating history panel listing snapshots newest‑first. Selecting a timestamp re‑loads that exact state and logs the action.

Core goals:

- **Visual clarity** – colour + pattern cues, minimal clutter.
- **Extensible** – plug‑in tasks, palette items, auth modules.
- **Collaborative** – real‑time multi‑user editing with roles.
- **Human‑readable** storage & open Web API for scripts/AI.

---

## 2  Terminology

| Term                 | Meaning                                                                                                                                                            |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Template**         | Blueprint workflow (editable).                                                                                                                                     |
| **Worksheet**        | Live instance created from a template.                                                                                                                             |
| **Node**             | Rectangle in the diagram. Encodes **Node State** (see below) and contains 0‑n **Tasks**. Specialisations: Basic Node, Sub‑Workflow Node, Async Split, Async Merge. |
| **Task**             | Atomic check/criterion that must settle before its parent node can be **Complete**. Plug‑in based.                                                                 |
| **Node State**       | `FUTURE`·`IN_PROCESS`·`COMPLETE`·`OVERRIDDEN`·`ERROR`. Mapped to colour + hatch pattern for colour‑blind safety.                                                   |
| **Modes**            | `FLOW` (interactive run‑time), `EDIT` (structural), `VIEW` (read‑only).                                                                                            |
| **Confirm Snapshot** | Persistent save‑point of the entire worksheet state; enables **Revert**.                                                                                           |
| **Undo / Redo**      | In‑memory stack (depth 200) for step‑wise edits within current session.                                                                                            |
| **Roles**            | `admin`, `editor`, `contributor`, `viewer`. Each maps to a capability set; ACL stored per worksheet.                                                               |

---

## 3  User‑Facing Features

### 3.1 Login & Home

- Pluggable authentication (file provider default).
- Ships with user `jaek` // password hash("test").
- Dashboard lists Worksheets & Templates with search, context‑menus (Open, Rename, Copy, Delete, Make‑Template / Create‑Instance).

### 3.2 Worksheet Canvas

- **Mode Toggle** – right‑click surface → "Switch to Edit / Flow / View".\
  *Flow Mode Pill* component (default on new worksheets) also toggles; removable in Edit Mode.
- **Colour/Pattern Scheme**
  | Node State  | Colour (subtle) | Pattern          | Tooltip icon  |
  | ----------- | --------------- | ---------------- | ------------- |
  | FUTURE      | pale grey       | none             | clock         |
  | IN\_PROCESS | soft yellow     | diagonal stripes | play ▶        |
  | COMPLETE    | gentle green    | cross‑hatch      | check ✓       |
  | OVERRIDDEN  | light blue      | dotted           | flag ⚑        |
  | ERROR       | soft red        | heavy diagonal   | exclamation ! |
- **Node Interaction (Flow/View)**\
  – tick/untick Tasks.\
  – override/bypass Task or whole Node (permission‑gated).
- **Node Editing (Edit)**\
  – drag to move, right‑drag to connect, ESC cancels.\
  – context menus for rename, colour/pattern pick, delete.\
  – palette drag‑in new nodes/components.
- **Component‑Repo Palette**\
  – Dockable panel (Edit‑only) with Tabs: *Primary*, *Recent*, *Search*.\
  – Drag items onto canvas.
- **User List Panel**\
  – Shows current viewers; badge colour = their mode.\
  – Future: right‑click actions, drag‑to‑assign.
- **Refresh & Confirm**\
  – Auto refresh every 10 min (configurable).\
  – *Re‑check* button component can be placed on canvas.\
  – *Accept State* button stores Confirm Snapshot, clears change highlights.
- **History / Undo** component – recent changes with undo/redo arrows.

**Revert** – Right‑click blank canvas → *Revert…* opens a floating list of Confirm Snapshots (reverse‑chronological). Selecting one reloads that version and records the revert in the activity log.

### 3.3 Tasks (Built‑in Types)

| Type             | Behaviour                                                                                                                                                                                                                     | Key Fields                          |                                                                                                           |                    |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- | --------------------------------------------------------------------------------------------------------- | ------------------ |
| **CheckboxTask** | Manual tick/bypass.                                                                                                                                                                                                           | `label`                             |                                                                                                           |                    |
| **SvnTagTask**   | Pass when first SVN path matching `regex` exists under `baseUrl` (variables resolved). Error if >1 match. The check is executed server‑side using the **application‑level SVN credentials** configured in `application.yaml`. | `baseUrl`, `regex`                  | Pass when first SVN path matching `regex` exists under `baseUrl` (variables resolved). Error if >1 match. | `baseUrl`, `regex` |
| **InputTask**    | Prompts user for a value (text/number/date). Considered *complete* once value entered & checkbox ticked.                                                                                                                      | `label`, `value`, `validatorRegex?` |                                                                                                           |                    |

Plug‑in SPI allows new task types (e.g. Git, HTTP JSON, Jenkins).

---

## 4  Backend Design

| Area            | Spec                                                                                                                                                   |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Language**    | Java 17                                                                                                                                                |
| **Frameworks**  | Spring Boot 3, Spring Security, Spring WebSocket                                                                                                       |
| **Build**       | Gradle 8 wrapper (`./gradlew build`)                                                                                                                   |
| **Persistence** | JSON files in `/data/worksheets/` & `/data/templates/`; Confirm snapshots stored version‑numbered; ISO‑8601 activity log (`.log`) with daily rotation. |
| **Real‑time**   | STOMP over WebSocket; topic per worksheet.                                                                                                             |
| **Auth**        | `AuthProvider` SPI. Default file `users.json` { username, bcryptHash, roles }.                                                                         |
| **SCM Creds**   | Global *application account* for SVN/Git stored in encrypted `application.yaml`; all automated Task checks run under this account.                     |
| **API**         | REST + WS under `/api/v1/`. Version prefix allows future `v2`.                                                                                         |
| **Plug‑ins**    | Java ServiceLoader (`META-INF/services/...`).                                                                                                          |
| **Tests**       | JUnit 5 + Testcontainers (for SVN mock). Requirements tagged `@Req("R‑ID")`.                                                                           |

## 5  Data Model (high‑level)

  Data Model (high‑level)

```jsonc
{
  "id": "ws‑42",
  "templateId": "tmpl‑recipe‑v1",
  "name": "Dinner‑Plan 2025‑06‑30",
  "nodeStateStyle": "colour+pattern",  // global preference
  "config": { "ProjectVersion": "1.1.0" },
  "nodes": [ ... ],
  "connections": [ ... ],
  "acl": {
    "admin": ["jaek"],
    "editor": ["alice"],
    "contributor": ["bob", "carol"],
    "viewer": ["*"]
  },
  "confirmSnapshots": ["2025-06-30T14:05:21Z", "2025-06-30T15:47:03Z"]
}
```

---

## 6  Non‑Functional & Accessibility

- **Responsive** under 100‑node worksheets, 20 concurrent users.
- **Accessibility**: WCAG AA; every colour cue duplicated by pattern & icon.
- **Localization**: all UI strings externalized; UTF‑8 throughout.

---

## 7  Open Items (v0.3 target)

1. **User drag‑assign interactions** – spec handshake with future Task types that accept user assignees.
2. **Colour & pattern theme editor** – future configuration panel.
3. **Automatic SCM commit of JSON files** – pluggable commit‑on‑Confirm.
4. **Gen‑AI Agent interface** – design event schema & security model.

