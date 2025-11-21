<script setup lang="ts">
// Page metadata
definePageMeta({
  layout: 'admin'
})

// Mock data for dashboard stats
const stats = ref([
  {
    label: 'Total Pages',
    value: '127',
    change: '+12%',
    trend: 'up',
    icon: 'heroicons:document-text'
  },
  {
    label: 'Published',
    value: '98',
    change: '+8%',
    trend: 'up',
    icon: 'heroicons:check-circle'
  },
  {
    label: 'Drafts',
    value: '24',
    change: '-3%',
    trend: 'down',
    icon: 'heroicons:pencil-square'
  },
  {
    label: 'Menus',
    value: '5',
    change: '0%',
    trend: 'neutral',
    icon: 'heroicons:bars-3'
  }
])

// Mock recent activity
const recentActivity = ref([
  {
    id: '1',
    action: 'Page created',
    title: 'Concrete Contractors in Los Angeles',
    user: 'Admin User',
    timestamp: '2 hours ago'
  },
  {
    id: '2',
    action: 'Page updated',
    title: 'Cost of Concrete Calculator',
    user: 'Admin User',
    timestamp: '5 hours ago'
  },
  {
    id: '3',
    action: 'Menu updated',
    title: 'Footer Navigation',
    user: 'Admin User',
    timestamp: '1 day ago'
  },
  {
    id: '4',
    action: 'Page published',
    title: 'Concrete Pricing Guide 2024',
    user: 'Admin User',
    timestamp: '2 days ago'
  }
])

// Quick actions
const quickActions = ref([
  {
    label: 'Create Page',
    icon: 'heroicons:plus-circle',
    href: '/admin/pages/new',
    color: 'blue'
  },
  {
    label: 'Manage Pages',
    icon: 'heroicons:document-text',
    href: '/admin/pages',
    color: 'neutral'
  },
  {
    label: 'Manage Menus',
    icon: 'heroicons:bars-3',
    href: '/admin/menus',
    color: 'neutral'
  },
  {
    label: 'Settings',
    icon: 'heroicons:cog-6-tooth',
    href: '/admin/settings',
    color: 'neutral'
  }
])
</script>

<template>
  <div class="p-6">
    <!-- Page Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
        Dashboard
      </h1>
      <p class="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
        Welcome back! Here's what's happening with your site.
      </p>
    </div>

    <!-- Stats Grid -->
    <div class="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div
        v-for="stat in stats"
        :key="stat.label"
        class="rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-800"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-neutral-600 dark:text-neutral-400">
              {{ stat.label }}
            </p>
            <p class="mt-2 text-3xl font-bold text-neutral-900 dark:text-neutral-100">
              {{ stat.value }}
            </p>
          </div>
          <div class="rounded-full bg-blue-50 p-3 dark:bg-blue-900/20">
            <Icon
              :name="stat.icon"
              class="h-6 w-6 text-blue-600 dark:text-blue-400"
            />
          </div>
        </div>
        <div class="mt-4 flex items-center gap-1">
          <Icon
            :name="stat.trend === 'up' ? 'heroicons:arrow-trending-up' : stat.trend === 'down' ? 'heroicons:arrow-trending-down' : 'heroicons:minus'"
            class="h-4 w-4"
            :class="stat.trend === 'up' ? 'text-green-600' : stat.trend === 'down' ? 'text-red-600' : 'text-neutral-400'"
          />
          <span
            class="text-sm font-medium"
            :class="stat.trend === 'up' ? 'text-green-600' : stat.trend === 'down' ? 'text-red-600' : 'text-neutral-400'"
          >
            {{ stat.change }}
          </span>
          <span class="text-sm text-neutral-500 dark:text-neutral-400">
            from last month
          </span>
        </div>
      </div>
    </div>

    <!-- Content Grid -->
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <!-- Quick Actions -->
      <div class="rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-800">
        <h2 class="mb-4 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          Quick Actions
        </h2>
        <div class="grid grid-cols-2 gap-3">
          <NuxtLink
            v-for="action in quickActions"
            :key="action.label"
            :to="action.href"
            class="flex flex-col items-center gap-2 rounded-lg border border-neutral-200 p-4 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-700"
          >
            <Icon
              :name="action.icon"
              class="h-8 w-8"
              :class="action.color === 'blue' ? 'text-blue-600 dark:text-blue-400' : 'text-neutral-600 dark:text-neutral-400'"
            />
            <span class="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {{ action.label }}
            </span>
          </NuxtLink>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-800">
        <h2 class="mb-4 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          Recent Activity
        </h2>
        <div class="space-y-4">
          <div
            v-for="activity in recentActivity"
            :key="activity.id"
            class="flex items-start gap-3 border-b border-neutral-200 pb-4 last:border-0 last:pb-0 dark:border-neutral-700"
          >
            <div class="rounded-full bg-blue-50 p-2 dark:bg-blue-900/20">
              <Icon
                name="heroicons:clock"
                class="h-4 w-4 text-blue-600 dark:text-blue-400"
              />
            </div>
            <div class="flex-1">
              <p class="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                {{ activity.action }}
              </p>
              <p class="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                {{ activity.title }}
              </p>
              <p class="mt-1 text-xs text-neutral-500 dark:text-neutral-500">
                {{ activity.timestamp }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
