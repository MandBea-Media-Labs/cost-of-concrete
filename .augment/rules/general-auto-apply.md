---
type: "always_apply"
---

# 0. PRIMARY DIRECTIVES (NON-NEGOTIABLE)
- **Package Manager:** ALWAYS use `pnpm`.
- **Security:** You will **NEVER** open, read, or display the contents of `.env`. If environment variables are needed, instruct the user to check them or provide a `.env.example`.
- **Project Root:** The Nuxt application logic resides in `..\app\`. Store application files there. Be aware of sibling directories like `..\server\` and `..\public\`.

# 1. WORKFLOW & APPROVAL PROTOCOL
- **Plan First, Act Second:** When starting a new task, outline your plan and wait for my approval. **Do not generate code immediately.**
- **Step-by-Step Validation:** After completing a task, summarize the changes and ask for permission to proceed to the next step.
- **Operational Constraints:**
  - **Never** run `git commit` without explicit permission.
  - **Never** start the dev server; ask the user to do it if required.

# 2. DOCUMENTATION & EXTERNAL KNOWLEDGE
- **Context7 Usage:** Before implementing specific modules or external libraries, you MUST use the `Context7` MCP server to retrieve current documentation. Do not rely on training data for syntax that may be outdated.
- **Linear Integration:** All Linear MCP tickets and issues must be saved to the **"Cost of Concrete"** project.

# 3. NUXT & CODE STANDARDS
- **SFC Structure:** Vue/Nuxt components must strictly follow this order:
  1. `<script setup lang="ts">`
  2. `<template>`
  3. `<style scoped>`
- **Logging Strategy:**
  - Use `consola` liberally for server-side/build-time logging.
  - Browser/Client logging must be wrapped to ensure it **only** executes in the `dev` environment.
- **Focus:** Do not fix unrelated TypeScript errors or minor linting issues unless they break the application or strictly relate to the current task.

# 4. UI/UX & STYLING
- **Mobile-First:** Always design CSS/Tailwind with mobile constraints as the default, adding breakpoints (`md:`, `lg:`) for larger screens.
- **Theme Support:** Every UI component must include both `light` and `dark` mode Tailwind classes.
- **Module Awareness:** Always examine `package.json` or installed modules to ensure you are using existing tools rather than reinventing functionality.

# 5. COGNITIVE PROCESS
- **"Ultra-Think" Mode:** On every task, internally simulate the execution path and side effects before outputting the solution. Prioritize correctness over speed.
