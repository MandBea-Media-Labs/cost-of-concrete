<script setup lang="ts">
// Dev layout for UI component showcase pages
// Features a fixed header navigation for quick component section access

const navItems = [
  { name: 'Buttons', href: '#buttons' },
  { name: 'Popovers', href: '#popovers' },
  { name: 'Dialogs', href: '#dialogs' },
  { name: 'Cards', href: '#cards' }
]
</script>

<template>
  <div class="flex min-h-screen flex-col bg-neutral-100 font-sans dark:bg-neutral-800">
    <!-- Fixed Header Navigation -->
    <header class="fixed top-0 z-50 w-full border-b border-neutral-200 bg-neutral-50/95 shadow-sm backdrop-blur-sm dark:border-neutral-700 dark:bg-neutral-900/95">
      <div class="mx-auto max-w-8xl px-4 py-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between">
          <!-- Logo/Title -->
          <div class="flex items-center gap-6">
            <NuxtLink to="/" class="font-heading text-xl font-bold text-neutral-700 transition-colors hover:text-blue-500 dark:text-neutral-200 dark:hover:text-blue-400">
              Cost of Concrete
            </NuxtLink>
            <span class="hidden text-neutral-400 sm:inline dark:text-neutral-600">|</span>
            <span class="hidden text-sm font-medium text-neutral-500 sm:inline dark:text-neutral-400">Dev UI Showcase</span>
          </div>

          <!-- Component Navigation -->
          <nav class="flex items-center gap-1">
            <a
              v-for="item in navItems"
              :key="item.href"
              :href="item.href"
              class="rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 transition-all hover:bg-neutral-100 hover:text-blue-500 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-blue-400"
            >
              {{ item.name }}
            </a>
          </nav>
        </div>
      </div>
    </header>

    <!-- Main Content with top padding to account for fixed header -->
    <main class="flex-1 pt-20">
      <div class="mx-auto max-w-8xl px-4 py-8 sm:px-6 lg:px-8">
        <slot />
      </div>
    </main>

    <!-- Footer -->
    <footer class="mt-auto border-t border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900">
      <div class="mx-auto max-w-8xl px-4 py-6 sm:px-6 lg:px-8">
        <p class="text-center text-sm text-neutral-500 dark:text-neutral-400">
          © {{ new Date().getFullYear() }} Cost of Concrete. Built with Nuxt 4 & Tailwind CSS.
        </p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
/* Smooth scrolling for anchor links */
:global(html) {
  scroll-behavior: smooth;
}

/* Add scroll padding to account for fixed header */
:global(html) {
  scroll-padding-top: 6rem;
}
</style>

