---
type: "manual"
description: "Example description"
---

# Linear Task Execution & Implementation

**Trigger:** Use this when provided a Linear Issue ID (Root or Sub-issue) to **build, refactor, or implement** functionality.

### 1. Deep Context & Hierarchy Extraction
Your first step is to orient yourself within the project scope.
1.  **Hierarchy Alignment:** Fetch the provided Issue ID.
    *   If it is a **Root Issue**, identify the current active **Sub-Issue** to work on.
    *   If it is a **Sub-Issue**, identify the **Parent Issue** to understand the broader goal.
2.  **Spec Extraction:** Read the descriptions and comments of the Root and Sub-issues to extract:
    *   **User Stories / Requirements:** What is being built?
    *   **Acceptance Criteria:** What does "Done" look like?
    *   **Design Assets:** Are there links to Figma or architectural constraints?
3.  **State Check:** Confirm the ticket status (ensure we aren't working on a "Done" ticket).

### 2. The "Ultra Think" Strategy (Architecture Fit)
Before writing code, simulate the implementation mentally:
*   **Integration Points:** Where in the `..\app\` structure will this new feature live? Does it require new directories or extend existing components?
*   **Dependency Audit:** Do we need new modules? (Check `package.json` vs requirements). Use `Context7` to check docs if new libraries are required.
*   **Data Flow:** How will data reach this new feature? (Pinia, API, Props?).

### 3. The Implementation Plan
Present a numbered plan focused on the **Current Sub-Issue**. **Do not write code yet.**
*   **Scope Definition:** Explicitly state: "I am working on Sub-Issue [ID]: [Title]."
*   **Verification Strategy:** Define how we will prove the feature exists and works (e.g., "We will verify that the new 'Settings' route loads and saves data").
*   *Wait for user approval before proceeding.*

### 4. Implementation & Validation Protocol
Once approved, execute this cycle:

**Update the Root Iissue and Sub-Issue Status:** Set to "In Progress"

**A. Conditional Baseline (The "Before" State)**
*   **IF this is a BUG:** You **MUST** use **Playwright MCP** to reproduce the issue and confirm the failure state ("Red" state) before fixing.
*   **IF this is a FEATURE or REFACTOR:** Do **NOT** run Playwright yet. Rely on code analysis and your "Ultra Think" simulation to understand the starting point.

**B. The Execution (The Build)**
*   Implement the code following **General Rules** (Mobile-first, `..\app\` structure, `pnpm`).
*   **Incremental Checks:** If the task is large, stop halfway to check in with the user.

**C. Final Verification (The "Green" State)**
*   **MANDATORY:** Once the code is implemented/fixed, use **Playwright** to test the result.
*   **Assert:**
    *   *Features:* The new UI elements appear and interact correctly.
    *   *Refactors:* The functionality persists (no regressions).
    *   *Bugs:* The error is definitively gone.

### 5. Finalization (The Paper Trail)
*   **Linear Sync:**
    *   Post a comment on the **Sub-Issue** (and Root if applicable) detailing the implementation (e.g., "Added UserProfile.vue and connected to store"). This comment is curcial to helping other developers understand the progress and work completed. Make sure you keep this in mind when creating to comment as this is to be useful for future dev work.
    *   Mark the **Sub-Issue** as 'Done' and if this is the last **Sub-Issue** to be completed in the **Root Issue** mark the **Root Issue** as 'Done' as well.
    *   **Task List Update:** If the ticket has a Markdown task list in the description, verify the items completed. Only check items that were actually compelted.
*   **Git:** Stage changes and ask permission to commit with a Semantic Message (e.g., `feat(user): implement profile settings page`).
