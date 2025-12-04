---
type: "manual"
description: "Example description"
---

# Linear Issue Resolution & Implementation

**Trigger:** Use this when provided a specific Linear Issue ID to fix or implement.

### 1. Deep Context Extraction
Your first step is **Analysis**, not action.
1.  **Retrieve & Audit:** Fetch the main Issue ID.
2.  **Hierarchy Scan:** Search for all linked **Sub-Issues**.
    *   *Prioritize:* Focus on the specific sub-issue that is currently "In Progress" or "Todo".
3.  **Conversation Review:** Read the comment history on both the parent and sub-issues. Look for:
    *   Hidden requirements or constraints mentioned by the team.
    *   Previous failed attempts to fix the issue.
    *   Specific **Acceptance Criteria**.

### 2. The "Ultra Think" Strategy (Simulation)
Before proposing a plan, internally simulate the issue:
*   **Hypothesis:** Based on the ticket description, where exactly in the `..\app\` structure is the logic failing?
*   **Impact Analysis:** What other components rely on this logic? (Review `package.json` and imports).
*   **Documentation:** Use `Context7` to check documentation for any involved modules to ensure we aren't using deprecated methods.

### 3. The Plan Proposal
Present a numbered implementation plan. **Do not write code yet.**
*   **Verification Strategy:** Define exactly how we will prove the fix works (e.g., "We will verify that clicking 'Submit' no longer throws a 400 error").
*   *Wait for user approval before proceeding.*

### 4. Implementation & Validation Protocol
Once approved, execute in this order:

**A. Reproduction (The "Red" State)**
*   Use the **Playwright MCP** to navigate to the relevant page.
*   Attempt to trigger the bug/issue as described.
*   **Monitor:** Capture logs from the **Browser Console** (client side) and **Server Terminal** (server side/`consola`).
*   *Confirm you have reproduced the issue.*

**B. The Fix (The Code)**
*   Apply the fix following the **General Rules** (Mobile-first, standard file structure, `pnpm`).

**C. Verification (The "Green" State)**
*   Use **Playwright** again to run the exact same steps from Step A.
*   **Assert:** Confirm the error is gone and the `consola` logs show success.

### 5. Finalization (The Paper Trail)
*   **Update Linear:** Post a comment on the issue with a summary of the fix and the specific file(s) changed.
*   **Git:** Stage changes and ask the user for permission to commit using a Conventional Commit message (e.g., `fix(auth): handle null token in session store`).
