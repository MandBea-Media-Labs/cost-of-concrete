<script setup lang="ts">
/**
 * Admin Breadcrumbs Component
 * 
 * Displays breadcrumb navigation based on current route.
 * Automatically generates breadcrumbs from route path.
 */

const route = useRoute()

interface Breadcrumb {
  name: string
  href?: string
}

// Generate breadcrumbs from route
const breadcrumbs = computed<Breadcrumb[]>(() => {
  const path = route.path
  const crumbs: Breadcrumb[] = []

  // Always start with Admin
  crumbs.push({ name: 'Admin', href: '/admin' })

  // Parse path segments
  const segments = path.split('/').filter(Boolean)

  // Remove 'admin' from segments (already added)
  if (segments[0] === 'admin') {
    segments.shift()
  }

  // Build breadcrumbs from segments
  let currentPath = '/admin'
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i]
    currentPath += `/${segment}`

    // Skip dynamic segments (UUIDs)
    if (segment.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      continue
    }

    // Format segment name
    let name = segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')

    // Special cases
    if (name === 'New') {
      name = 'Create New'
    } else if (name === 'Edit') {
      name = 'Edit'
    }

    // Add breadcrumb
    // Last segment is current page (no link)
    if (i === segments.length - 1) {
      crumbs.push({ name })
    } else {
      crumbs.push({ name, href: currentPath })
    }
  }

  return crumbs
})
</script>

<template>
  <nav class="flex" aria-label="Breadcrumb">
    <ol class="flex items-center space-x-2">
      <li
        v-for="(crumb, index) in breadcrumbs"
        :key="index"
        class="flex items-center"
      >
        <!-- Separator -->
        <Icon
          v-if="index > 0"
          name="heroicons:chevron-right"
          class="h-4 w-4 text-neutral-400 dark:text-neutral-500 mx-2"
        />

        <!-- Breadcrumb Link or Text -->
        <NuxtLink
          v-if="crumb.href"
          :to="crumb.href"
          class="text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
        >
          {{ crumb.name }}
        </NuxtLink>
        <span
          v-else
          class="text-sm font-medium text-neutral-900 dark:text-neutral-100"
        >
          {{ crumb.name }}
        </span>
      </li>
    </ol>
  </nav>
</template>

