---
type: "manual"
---

# Linear Workflow & Issue Management

**Trigger:** Use this protocol whenever we begin a new Feature, Refactor, or Implementation Plan.

### 1. Initialization & Context
*   **Project Enforcement:** Per global rules, target the `Project Name` project.
*   **Discovery:** Before creating *any* tickets, use the Linear MCP to query the project and retrieve the correct `Team ID` and `Project ID` to ensure we don't create orphaned tickets.
*   **Context Linking:** If the user provided a PRD or a specific goal, reference it in the main issue description.

### 2. Hierarchy Creation Strategy
You will organize the work using a strict **Parent-Child** relationship:

*   **Step A: The Root Issue**
    *   Create **ONE** high-level Issue acting as the container for the entire implementation.
    *   **Title Format:** `[Feat] {Implementation Name}` or `[Refactor] {Scope Name}`.
    *   **Description:** High-level summary of the goal.

*   **Step B: The Phase Sub-Issues**
    *   Create a **Sub-Issue** (linked to the Root Issue) for *each* Phase of the plan.
    *   **Ordering:** Create these strictly in sequential order (Phase 1, Phase 2, etc.).
    *   **Title Format:** `Phase {X}: {Phase Title}`.

*   **Step C: The Task Checklists**
    *   **Do not** create separate issues for every small task.
    *   Inside each **Phase Sub-Issue**, create a **Markdown Checklist** in the description for the specific batches of tasks.
    *   *Example:*
        ```markdown
        - [ ] Create Component X
        - [ ] Add Unit Tests
        - [ ] Integrate with Store
        ```

*   **Step D: Direction Comment***
    *   Create an initial **Comment** for *each* issue (Root Issue and Sub-Issue(s)) with the following directions:
        **Comment Message**:
        ```markdown
        - When checking out and beginning work on an issue:
        -   You must mark the root issue and sub-issue as 'In Progress'
        -   Build the appropriate unit tests to match the logic. For anyting UI based we will manually test this in the browser.
            - API endpoints are critical for unit testing.
        - When completing an issue always:
            - Ensure a detailed work summary comment was left within the issue
            - Update the markdown Task List in the description truthfully
            - Mark the issue as 'Done'
        - After completing the issue:
            - Complete all unit tests
        ```

### 3. Execution & Completion Protocol
**Only proceed to the next phase after completing the following loop:**

1.  **The "Paper Trail" Comment:**
    *   Upon completing a Phase, use the Linear MCP to post a comment on the **current Sub-Issue**.
    *   **Comment Content:** A brief summary of what was achieved and any technical decisions made (e.g., "Implemented generic data fetcher, opted to use existing Zod schema").
2.  **Git State:**
    *   **Stage** the changes.
    *   **Generate** a commit message following Conventional Commits (e.g., `feat: complete phase 1 component logic`).
    *   **PAUSE:** Display the commit message and ask: *"Ready to commit and proceed to Phase {X}?"*
3.  **Phase Closure:**
    *   Once approved and committed, mark the Linear Sub-Issue as **Done** (or your team's equivalent state).

### 4. Safety Check
*   **Clarification:** If the implementation plan seems vague, ask: *"I am about to create {X} tickets in Linear. Do you want to review the ticket titles first?"*
