<script setup lang="ts">
/**
 * Admin Sidebar Component
 *
 * Collapsible sidebar navigation for admin panel.
 * Features:
 * - Desktop: Collapsible sidebar (full width / icon only)
 * - Mobile: Slide-out drawer
 * - Active route highlighting
 * - Dark mode support
 */

interface Props {
  open: boolean
  mobileOpen: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  toggle: []
  closeMobile: []
}>()

const route = useRoute()

// Navigation items
const navigationItems = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: 'heroicons:home',
    exact: true
  },
  {
    name: 'Pages',
    href: '/admin/pages',
    icon: 'heroicons:document-text',
    exact: false
  },
  {
    name: 'Menus',
    href: '/admin/menus',
    icon: 'heroicons:bars-3',
    exact: false
  },
  {
    name: 'Settings',
    href: '/admin/settings',
    icon: 'heroicons:cog-6-tooth',
    exact: false
  }
]

// Check if route is active
const isActive = (item: typeof navigationItems[0]) => {
  if (item.exact) {
    return route.path === item.href
  }
  return route.path.startsWith(item.href)
}
</script>

<template>
  <!-- Desktop Sidebar -->
  <aside
    class="hidden lg:fixed lg:inset-y-0 lg:z-30 lg:flex lg:flex-col bg-white dark:bg-neutral-800 border-r border-neutral-200 dark:border-neutral-700 transition-all duration-300"
    :class="open ? 'lg:w-64' : 'lg:w-20'"
  >
    <!-- Logo / Brand -->
    <div class="flex h-16 items-center border-b border-neutral-200 dark:border-neutral-700 px-4">
      <NuxtLink
        to="/admin"
        class="flex items-center gap-3"
      >
        <div class="h-8 w-8 rounded-lg bg-primary-600 flex items-center justify-center text-white font-bold text-sm">
          CC
        </div>
        <span
          v-if="open"
          class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 whitespace-nowrap"
        >
          Cost of Concrete
        </span>
      </NuxtLink>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 overflow-y-auto py-4">
      <ul class="space-y-1 px-3">
        <li v-for="item in navigationItems" :key="item.name">
          <NuxtLink
            :to="item.href"
            class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            :class="[
              isActive(item)
                ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'
            ]"
            :title="!open ? item.name : undefined"
          >
            <Icon :name="item.icon" class="h-5 w-5 flex-shrink-0" />
            <span v-if="open" class="whitespace-nowrap">{{ item.name }}</span>
          </NuxtLink>
        </li>
      </ul>
    </nav>

    <!-- Footer -->
    <div class="border-t border-neutral-200 dark:border-neutral-700 p-4">
      <div class="flex items-center gap-3">
        <div class="h-8 w-8 rounded-full bg-neutral-200 dark:bg-neutral-700 flex-shrink-0" />
        <div v-if="open" class="flex-1 min-w-0">
          <p class="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
            Admin User
          </p>
          <p class="text-xs text-neutral-500 dark:text-neutral-400 truncate">
            admin@example.com
          </p>
        </div>
      </div>
    </div>
  </aside>

  <!-- Mobile Sidebar -->
  <aside
    class="lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-neutral-800 border-r border-neutral-200 dark:border-neutral-700 transform transition-transform duration-300"
    :class="mobileOpen ? 'translate-x-0' : '-translate-x-full'"
  >
    <!-- Logo / Brand -->
    <div class="flex h-16 items-center justify-between border-b border-neutral-200 dark:border-neutral-700 px-4">
      <NuxtLink
        to="/admin"
        class="flex items-center gap-3"
        @click="emit('closeMobile')"
      >
        <div class="h-8 w-8 rounded-lg bg-primary-600 flex items-center justify-center text-white font-bold text-sm">
          CC
        </div>
        <span class="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          Cost of Concrete
        </span>
      </NuxtLink>

      <!-- Close Button -->
      <button
        type="button"
        class="p-2 rounded-md text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700"
        @click="emit('closeMobile')"
      >
        <Icon name="heroicons:x-mark" class="h-5 w-5" />
      </button>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 overflow-y-auto py-4">
      <ul class="space-y-1 px-3">
        <li v-for="item in navigationItems" :key="item.name">
          <NuxtLink
            :to="item.href"
            class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            :class="[
              isActive(item)
                ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'
            ]"
          >
            <Icon :name="item.icon" class="h-5 w-5 flex-shrink-0" />
            <span>{{ item.name }}</span>
          </NuxtLink>
        </li>
      </ul>
    </nav>
  </aside>
</template>

