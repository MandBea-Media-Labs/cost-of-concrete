<script setup lang="ts">
// Default layout for the application
</script>

<template>
  <div class="flex min-h-screen flex-col bg-neutral-100 font-sans dark:bg-neutral-800">
    <!-- Header -->
    <Header />

    <!-- Main Content -->
    <main class="flex-1">
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
</style>

