<script setup lang="ts">
/**
 * Admin Dashboard
 *
 * Main dashboard for the admin panel using shadcn-based components.
 */

// Page metadata - use new admin layout
definePageMeta({
  layout: 'admin-new'
})

// Mock data for dashboard stats
const stats = ref([
  {
    label: 'Total Pages',
    value: '127',
    change: '+12%',
    trend: 'up' as const,
    icon: 'heroicons:document-text'
  },
  {
    label: 'Published',
    value: '98',
    change: '+8%',
    trend: 'up' as const,
    icon: 'heroicons:check-circle'
  },
  {
    label: 'Drafts',
    value: '24',
    change: '-3%',
    trend: 'down' as const,
    icon: 'heroicons:pencil-square'
  },
  {
    label: 'Menus',
    value: '5',
    change: '0%',
    trend: 'neutral' as const,
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
    variant: 'default' as const
  },
  {
    label: 'Manage Pages',
    icon: 'heroicons:document-text',
    href: '/admin/pages',
    variant: 'outline' as const
  },
  {
    label: 'Manage Menus',
    icon: 'heroicons:bars-3',
    href: '/admin/menus',
    variant: 'outline' as const
  },
  {
    label: 'Settings',
    icon: 'heroicons:cog-6-tooth',
    href: '/admin/settings',
    variant: 'outline' as const
  }
])

/**
 * Get trend icon based on trend direction
 */
function getTrendIcon(trend: 'up' | 'down' | 'neutral'): string {
  switch (trend) {
    case 'up':
      return 'heroicons:arrow-trending-up'
    case 'down':
      return 'heroicons:arrow-trending-down'
    default:
      return 'heroicons:minus'
  }
}

/**
 * Get trend badge variant based on trend direction
 */
function getTrendVariant(trend: 'up' | 'down' | 'neutral'): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (trend) {
    case 'up':
      return 'default'
    case 'down':
      return 'destructive'
    default:
      return 'secondary'
  }
}
</script>

<template>
  <div>
    <!-- Page Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold">
        Dashboard
      </h1>
      <p class="mt-1 text-sm text-muted-foreground">
        Welcome back! Here's what's happening with your site.
      </p>
    </div>

    <!-- Stats Grid -->
    <div class="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <UiCard v-for="stat in stats" :key="stat.label">
        <UiCardContent class="pt-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-muted-foreground">
                {{ stat.label }}
              </p>
              <p class="mt-2 text-3xl font-bold">
                {{ stat.value }}
              </p>
            </div>
            <div class="rounded-full bg-primary/10 p-3">
              <Icon
                :name="stat.icon"
                class="size-6 text-primary"
              />
            </div>
          </div>
          <div class="mt-4 flex items-center gap-2">
            <UiBadge :variant="getTrendVariant(stat.trend)" class="gap-1">
              <Icon :name="getTrendIcon(stat.trend)" class="size-3" />
              {{ stat.change }}
            </UiBadge>
            <span class="text-sm text-muted-foreground">
              from last month
            </span>
          </div>
        </UiCardContent>
      </UiCard>
    </div>

    <!-- Content Grid -->
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <!-- Quick Actions -->
      <UiCard>
        <UiCardHeader>
          <UiCardTitle>Quick Actions</UiCardTitle>
        </UiCardHeader>
        <UiCardContent>
          <div class="grid grid-cols-2 gap-3">
            <UiButton
              v-for="action in quickActions"
              :key="action.label"
              :variant="action.variant"
              as-child
              class="h-auto flex-col gap-2 py-4"
            >
              <NuxtLink :to="action.href">
                <Icon :name="action.icon" class="size-8" />
                <span class="text-sm font-medium">
                  {{ action.label }}
                </span>
              </NuxtLink>
            </UiButton>
          </div>
        </UiCardContent>
      </UiCard>

      <!-- Recent Activity -->
      <UiCard>
        <UiCardHeader>
          <UiCardTitle>Recent Activity</UiCardTitle>
        </UiCardHeader>
        <UiCardContent>
          <div class="space-y-4">
            <div
              v-for="activity in recentActivity"
              :key="activity.id"
              class="flex items-start gap-3 border-b pb-4 last:border-0 last:pb-0"
            >
              <div class="rounded-full bg-primary/10 p-2">
                <Icon
                  name="heroicons:clock"
                  class="size-4 text-primary"
                />
              </div>
              <div class="flex-1">
                <p class="text-sm font-medium">
                  {{ activity.action }}
                </p>
                <p class="mt-1 text-sm text-muted-foreground">
                  {{ activity.title }}
                </p>
                <p class="mt-1 text-xs text-muted-foreground">
                  {{ activity.timestamp }}
                </p>
              </div>
            </div>
          </div>
        </UiCardContent>
      </UiCard>
    </div>
  </div>
</template>
