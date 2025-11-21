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

// Color mode
const colorMode = useColorMode()

// Track if component is mounted (for SSR)
const isMounted = ref(false)

// Computed: Logo source based on color mode and sidebar state
const logoSrc = computed(() => {
  if (!isMounted.value) return '/images/logo-light.webp' // SSR fallback
  return colorMode.value === 'dark' ? '/images/logo-dark.webp' : '/images/logo-light.webp'
})

// Navigation items
const navigationItems = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: 'heroicons:home',
    exact: true
  },
  {
    name: 'Menus',
    href: '/admin/menus',
    icon: 'heroicons:bars-3',
    exact: false
  },
  {
    name: 'Pages',
    href: '/admin/pages',
    icon: 'heroicons:document-text',
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

// Set mounted flag
onMounted(() => {
  isMounted.value = true
})
</script>

<template>
  <!-- Desktop Sidebar -->
  <aside
    class="hidden border-r border-neutral-200 bg-white transition-all duration-300 dark:border-neutral-700 dark:bg-neutral-800 lg:fixed lg:inset-y-0 lg:z-30 lg:flex lg:flex-col"
    :class="open ? 'lg:w-64' : 'lg:w-20'"
  >
    <!-- Logo / Brand -->
    <div class="justify-left relative flex h-16 items-center border-b border-neutral-200 px-4 dark:border-neutral-700">
      <NuxtLink
        to="/admin"
        class="flex-shrink-0 transition-opacity hover:opacity-80"
      >
        <!-- Collapsed Logo -->
        <img
          v-if="!open"
          src="/images/logo-collapsed.webp"
          alt="Cost of Concrete"
          class="h-8 w-auto"
        />
        <!-- Expanded Logo -->
        <img
          v-else
          :src="logoSrc"
          alt="Cost of Concrete"
          class="h-8 w-auto"
        />
      </NuxtLink>

      <!-- Collapse Toggle Button (Desktop Only) - Small, positioned to the right -->
      <button
        type="button"
        class="absolute -right-1 rounded-md p-1.5 text-neutral-600 dark:text-neutral-400"
        @click="emit('toggle')"
      >
        <Icon
          :name="open ? 'heroicons:chevron-left' : 'heroicons:chevron-right'"
          class="h-4 w-4"
        />
      </button>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 overflow-y-auto py-4">
      <ul class="space-y-1 px-3">
        <li v-for="item in navigationItems" :key="item.name">
          <NuxtLink
            :to="item.href"
            class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
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
    <div class="border-t border-neutral-200 p-4 dark:border-neutral-700">
      <div class="flex items-center gap-3">
        <div class="h-8 w-8 flex-shrink-0 rounded-full bg-neutral-200 dark:bg-neutral-700" />
        <div v-if="open" class="min-w-0 flex-1">
          <p class="truncate text-sm font-medium text-neutral-900 dark:text-neutral-100">
            Admin User
          </p>
          <p class="truncate text-xs text-neutral-500 dark:text-neutral-400">
            admin@example.com
          </p>
        </div>
      </div>
    </div>
  </aside>

  <!-- Mobile Sidebar -->
  <aside
    class="fixed inset-y-0 left-0 z-50 w-64 transform border-r border-neutral-200 bg-white transition-transform duration-300 dark:border-neutral-700 dark:bg-neutral-800 lg:hidden"
    :class="mobileOpen ? 'translate-x-0' : '-translate-x-full'"
  >
    <!-- Logo / Brand -->
    <div class="flex h-16 items-center justify-between border-b border-neutral-200 px-4 dark:border-neutral-700">
      <NuxtLink
        to="/admin"
        class="flex-shrink-0 transition-opacity hover:opacity-80"
        @click="emit('closeMobile')"
      >
        <img
          :src="logoSrc"
          alt="Cost of Concrete"
          class="h-8 w-auto"
        />
      </NuxtLink>

      <!-- Close Button -->
      <button
        type="button"
        class="rounded-md p-2 text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-700"
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
            class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
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

