<script setup lang="ts">
/**
 * Admin Sidebar Header
 * Displays the Cost of Concrete branding in the sidebar header
 */
import { useSidebar } from '~/components/admin-ui/sidebar'

const { state } = useSidebar()
</script>

<template>
  <UiSidebarMenu>
    <UiSidebarMenuItem>
      <UiSidebarMenuButton size="lg" as-child>
        <NuxtLink to="/admin" class="flex items-center gap-2">
          <div class="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Icon name="i-lucide-building-2" class="size-4" />
          </div>
          <div v-if="state === 'expanded'" class="grid flex-1 text-left text-sm leading-tight">
            <span class="truncate font-semibold">Cost of Concrete</span>
            <span class="truncate text-xs text-muted-foreground">Admin Panel</span>
          </div>
        </NuxtLink>
      </UiSidebarMenuButton>
    </UiSidebarMenuItem>
  </UiSidebarMenu>
</template>

