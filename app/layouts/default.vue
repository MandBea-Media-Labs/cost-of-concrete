<script setup lang="ts">
// Default layout for the application
</script>

<template>
  <div class="flex min-h-screen flex-col bg-neutral-100 font-sans">
    <!-- Header -->
    <header class="border-b border-neutral-200 bg-neutral-50 shadow-sm">
      <div class="mx-auto max-w-8xl px-4 py-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between">
          <h1 class="font-heading text-2xl font-bold text-neutral-700">
            Cost of Concrete
          </h1>
          <nav class="flex gap-6">
            <NuxtLink to="/" class="font-medium text-neutral-500 transition-colors hover:text-neutral-700">
              Home
            </NuxtLink>
            <NuxtLink to="/dev/ui-showcase" class="font-medium text-neutral-500 transition-colors hover:text-neutral-700">
              UI Showcase
            </NuxtLink>
          </nav>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1">
      <div class="mx-auto max-w-8xl px-4 py-8 sm:px-6 lg:px-8">
        <slot />
      </div>
    </main>

    <!-- Footer -->
    <footer class="mt-auto border-t border-neutral-200 bg-neutral-50">
      <div class="mx-auto max-w-8xl px-4 py-6 sm:px-6 lg:px-8">
        <p class="text-center text-sm text-neutral-500">
          © {{ new Date().getFullYear() }} Cost of Concrete. Built with Nuxt 4 & Tailwind CSS.
        </p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
</style>

