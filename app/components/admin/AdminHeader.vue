<script setup lang="ts">
/**
 * Admin Header
 * Top header bar with sidebar trigger, breadcrumbs, and user actions
 */
const route = useRoute()

function setLinks() {
  // Remove /admin prefix and build breadcrumbs
  const path = route.fullPath.replace(/^\/admin\/?/, '')

  if (!path || path === '/') {
    return [{ title: 'Dashboard', href: '/admin' }]
  }

  const segments = path.split('/').filter(item => item !== '' && !item.startsWith('?'))

  const breadcrumbs = segments.map((item, index) => {
    const str = item.replace(/-/g, ' ')
    const title = str
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')

    return {
      title,
      href: `/admin/${segments.slice(0, index + 1).join('/')}`,
    }
  })

  return [{ title: 'Dashboard', href: '/admin' }, ...breadcrumbs]
}

const links = ref<{ title: string; href: string }[]>(setLinks())

watch(() => route.fullPath, (val) => {
  if (val) {
    links.value = setLinks()
  }
})
</script>

<template>
  <header class="sticky top-0 md:top-2 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 md:px-6 md:rounded-tl-xl md:rounded-tr-xl before:absolute before:-top-2 before:left-0 before:right-0 before:h-2 before:bg-sidebar before:hidden md:before:block">
    <div class="flex w-full items-center gap-4">
      <UiSidebarTrigger />
      <UiSeparator orientation="vertical" class="!h-4" />
      <UiBreadcrumb>
        <UiBreadcrumbList>
          <template v-for="(link, index) in links" :key="link.href">
            <UiBreadcrumbItem>
              <UiBreadcrumbLink v-if="index < links.length - 1" as-child>
                <NuxtLink :to="link.href">{{ link.title }}</NuxtLink>
              </UiBreadcrumbLink>
              <UiBreadcrumbPage v-else>{{ link.title }}</UiBreadcrumbPage>
            </UiBreadcrumbItem>
            <UiBreadcrumbSeparator v-if="index < links.length - 1" />
          </template>
        </UiBreadcrumbList>
      </UiBreadcrumb>
    </div>
    <div class="ml-auto flex items-center gap-2">
      <slot />
    </div>
  </header>
</template>

