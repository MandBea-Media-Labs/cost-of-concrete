<script setup lang="ts">
/**
 * Admin Layout
 * 
 * WordPress-style admin layout with collapsible sidebar navigation.
 * Features:
 * - Collapsible sidebar (desktop)
 * - Mobile drawer (responsive)
 * - Dark mode support
 * - Breadcrumbs
 */

// Sidebar state
const sidebarOpen = ref(true)
const mobileMenuOpen = ref(false)

// Toggle sidebar (desktop)
const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

// Toggle mobile menu
const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

// Close mobile menu when route changes
const route = useRoute()
watch(() => route.path, () => {
  mobileMenuOpen.value = false
})
</script>

<template>
  <div class="flex h-screen bg-neutral-50 dark:bg-neutral-900">
    <!-- Mobile Menu Overlay -->
    <div
      v-if="mobileMenuOpen"
      class="fixed inset-0 z-40 bg-black/50 lg:hidden"
      @click="toggleMobileMenu"
    />

    <!-- Sidebar -->
    <AdminSidebar
      :open="sidebarOpen"
      :mobile-open="mobileMenuOpen"
      @toggle="toggleSidebar"
      @close-mobile="toggleMobileMenu"
    />

    <!-- Main Content Area -->
    <div
      class="flex flex-1 flex-col overflow-hidden transition-all duration-300"
      :class="sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'"
    >
      <!-- Top Header Bar -->
      <header class="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 z-10">
        <div class="flex items-center justify-between px-4 py-3">
          <!-- Mobile Menu Button -->
          <button
            type="button"
            class="lg:hidden p-2 rounded-md text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700"
            @click="toggleMobileMenu"
          >
            <Icon name="heroicons:bars-3" class="h-6 w-6" />
          </button>

          <!-- Desktop Sidebar Toggle -->
          <button
            type="button"
            class="hidden lg:block p-2 rounded-md text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700"
            @click="toggleSidebar"
          >
            <Icon
              :name="sidebarOpen ? 'heroicons:chevron-left' : 'heroicons:chevron-right'"
              class="h-5 w-5"
            />
          </button>

          <!-- Breadcrumbs -->
          <div class="flex-1 px-4">
            <AdminBreadcrumbs />
          </div>

          <!-- User Menu Placeholder -->
          <div class="flex items-center gap-3">
            <!-- Dark Mode Toggle -->
            <button
              type="button"
              class="p-2 rounded-md text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700"
              @click="$colorMode.preference = $colorMode.value === 'dark' ? 'light' : 'dark'"
            >
              <Icon
                :name="$colorMode.value === 'dark' ? 'heroicons:sun' : 'heroicons:moon'"
                class="h-5 w-5"
              />
            </button>

            <!-- User Avatar Placeholder -->
            <div class="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-medium">
              A
            </div>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="flex-1 overflow-y-auto">
        <slot />
      </main>
    </div>
  </div>
</template>

