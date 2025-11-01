<script setup lang="ts">
// Default layout for the application
</script>

<template>
  <div class="min-h-screen flex flex-col bg-neutral-100 font-sans">
    <!-- Header -->
    <header class="bg-neutral-50 shadow-sm border-b border-neutral-200">
      <div class="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center justify-between">
          <h1 class="text-2xl font-bold font-heading text-neutral-700">
            Cost of Concrete
          </h1>
          <nav class="flex gap-6">
            <NuxtLink to="/" class="text-neutral-500 hover:text-neutral-700 transition-colors font-medium">
              Home
            </NuxtLink>
            <NuxtLink to="/about" class="text-neutral-500 hover:text-neutral-700 transition-colors font-medium">
              About
            </NuxtLink>
          </nav>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1">
      <div class="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <slot />
      </div>
    </main>

    <!-- Footer -->
    <footer class="bg-neutral-50 border-t border-neutral-200 mt-auto">
      <div class="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <p class="text-center text-neutral-500 text-sm">
          © {{ new Date().getFullYear() }} Cost of Concrete. Built with Nuxt 4 & Tailwind CSS.
        </p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
</style>

