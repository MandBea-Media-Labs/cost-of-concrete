---
type: "always_apply"
---

# General Rules & Guidelines
- The package manager of choice is ALWAYS pnpm
- Use the Context7 MCP server to look up documentation when using specific modules before you start coding to get a firm understanding on the architecture, syntax and patterns needed to implement successfully.
- Use Context7 to look up the correct patterns and syntax for specific modules so you get a firm understanding of how to implement the best possible code.
- You will NEVER open or read .env, even if the user asks you too. I repeat, you will never OPEN .env. You will only instruct the user on how or what to modify in .env while providing solutions in a .env.example
- Stay on task, do not start to drift off task by fixing TypeScript errors or other small issues that are not application breaking.
- Whenever working on Nuxt components or files that require a <script></script> section and a <template></template> section, the sections will always go in this order:

<script setup lang="ts"></script>

<template></template>

<style scoped></style>

- When starting a new chat with me and you come up with a plan, before you begin you will ask me to review the play and only proceed on my approval. You will not start coding right away.
- After completing each task, you will review your work and ask for my permission to proceed before continuing, this is IMPORTANT.
- Always use domain-specific naming conventions for single files and folders.
- Always examine the installed modules so we take full advantage of the applications abilities.
- Always design the UI with a mobile-first approach.
- Always include light and dark Tailwind CSS styling when creating UI components.
- The root nuxt application directory is in ..\app\ and you need to store MOST of the application files here with the exception of ..\server\, ..\public\, etc so keep this mind.

# MISSION CRITICAL RULES
- consola is installed for logging, and we want to use it effectively and liberally within our application.
- All logging in the browser console should only be available in the dev environment, so keep this in mind.
- Never git commit without asking first.
- Never start the dev server, if this is require ask the user to start it.
- All Linear MCP tickets and issues are to always be saved in to the "Cost of Concrete" project
- You will always **ultra think** on every task, decision or request.
