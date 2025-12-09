<script setup lang="ts">
import {
  DropdownMenuRoot,
  DropdownMenuTrigger,
  DropdownMenuPortal,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from 'reka-ui'

const user = useSupabaseUser()
const supabase = useSupabaseClient()
const router = useRouter()

// Compute user initials from email
const userInitials = computed(() => {
  if (!user.value?.email) return 'U'
  const email = user.value.email
  return email.charAt(0).toUpperCase()
})

// Compute user email for display
const userEmail = computed(() => {
  return user.value?.email || 'user@example.com'
})

// Logout handler
const handleLogout = async () => {
  try {
    await supabase.auth.signOut()
    await router.replace('/login')
  }
  catch (error) {
    if (import.meta.dev) {
      console.error('[AdminUserMenu] Logout error', error)
    }
  }
}
</script>

<template>
  <DropdownMenuRoot>
    <DropdownMenuTrigger
      class="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium cursor-pointer hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-offset-neutral-800"
    >
      {{ userInitials }}
    </DropdownMenuTrigger>

    <DropdownMenuPortal>
      <DropdownMenuContent
        class="min-w-[200px] bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700 p-1 z-50 will-change-[opacity,transform] data-[side=top]:animate-slideDownAndFade data-[side=right]:animate-slideLeftAndFade data-[side=bottom]:animate-slideUpAndFade data-[side=left]:animate-slideRightAndFade"
        :side-offset="5"
        align="end"
      >
        <!-- User Info Header -->
        <div class="px-3 py-2 border-b border-neutral-200 dark:border-neutral-700">
          <p class="text-sm font-medium text-neutral-900 dark:text-neutral-100">
            Admin User
          </p>
          <p class="text-xs text-neutral-500 dark:text-neutral-400 truncate">
            {{ userEmail }}
          </p>
        </div>

        <!-- Profile -->
        <DropdownMenuItem
          as-child
          class="flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300 rounded-md cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-700 focus:bg-neutral-100 dark:focus:bg-neutral-700 focus:outline-none"
        >
          <NuxtLink to="/admin/profile">
            <Icon name="heroicons:user" class="h-4 w-4" />
            <span>Profile</span>
          </NuxtLink>
        </DropdownMenuItem>

        <!-- Settings -->
        <DropdownMenuItem
          as-child
          class="flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300 rounded-md cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-700 focus:bg-neutral-100 dark:focus:bg-neutral-700 focus:outline-none"
        >
          <NuxtLink to="/admin/settings">
            <Icon name="heroicons:cog-6-tooth" class="h-4 w-4" />
            <span>Settings</span>
          </NuxtLink>
        </DropdownMenuItem>

        <!-- Dark Mode Switch -->
        <div class="px-3 py-2">
          <DarkModeSwitch />
        </div>

        <!-- Separator -->
        <DropdownMenuSeparator class="h-px bg-neutral-200 dark:bg-neutral-700 my-1" />

        <!-- Logout -->
        <DropdownMenuItem
          class="flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 rounded-md cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20 focus:bg-red-50 dark:focus:bg-red-900/20 focus:outline-none"
          @click="handleLogout"
        >
          <Icon name="heroicons:arrow-right-on-rectangle" class="h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenuPortal>
  </DropdownMenuRoot>
</template>

