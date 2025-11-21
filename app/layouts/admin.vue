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
      <header class="z-10 border-b border-neutral-200 bg-[#fcfcfc] dark:border-neutral-700 dark:bg-neutral-800">
        <div class="flex items-center justify-between px-4 py-3">
          <!-- Mobile Menu Button -->
          <button
            type="button"
            class="rounded-md p-2 text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-700 lg:hidden"
            @click="toggleMobileMenu"
          >
            <Icon name="heroicons:bars-3" class="h-6 w-6" />
          </button>

          <!-- Spacer for desktop -->
          <div class="hidden flex-1 lg:block" />

          <!-- User Menu -->
          <div class="ml-auto flex items-center gap-3 lg:ml-0">
            <!-- User Menu Dropdown -->
            <AdminUserMenu />
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="flex-1 overflow-y-auto">
        <slot />
      </main>
    </div>

    <!-- Toast Notifications -->
    <ToastContainer />
  </div>
</template>

