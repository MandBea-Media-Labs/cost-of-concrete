<script setup lang="ts">
/**
 * PopularServices - Directory navigation component for finding contractors by service type
 * Displays service categories as clickable cards with icons
 */

interface ServiceCategory {
  name: string
  slug: string
  description: string
  icon: string
}

// Service categories matching existing filter options
const services: ServiceCategory[] = [
  {
    name: 'Driveways',
    slug: 'driveways',
    description: 'Installation, repair, and resurfacing for residential and commercial driveways',
    icon: 'heroicons:truck'
  },
  {
    name: 'Patios',
    slug: 'patios',
    description: 'Custom outdoor living spaces with decorative finishes and durable construction',
    icon: 'heroicons:sun'
  },
  {
    name: 'Foundations',
    slug: 'foundations',
    description: 'Structural concrete work including slabs, footings, and foundation repair',
    icon: 'heroicons:home-modern'
  },
  {
    name: 'Walkways',
    slug: 'walkways',
    description: 'Sidewalks, garden paths, and front entry walkways built to last',
    icon: 'heroicons:arrow-long-right'
  },
  {
    name: 'Stamped & Decorative',
    slug: 'stamped-decorative',
    description: 'Colored, stamped, and textured concrete for unique aesthetic appeal',
    icon: 'heroicons:sparkles'
  },
  {
    name: 'Concrete Repair',
    slug: 'concrete-repair',
    description: 'Crack repair, slab lifting, and surface restoration services',
    icon: 'heroicons:wrench-screwdriver'
  }
]

/**
 * Generate the URL for a specific service
 */
const getServiceUrl = (slug: string): string => {
  return `/${slug}`
}
</script>

<template>
  <section class="bg-neutral-100 py-12 dark:bg-neutral-800 md:py-16">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <!-- Section Header -->
      <div class="mb-8">
        <Eyebrow
          text="Browse by Service"
          variant="blue-blue"
          size="md"
          class="mb-4"
        />
        <h2 class="font-heading text-2xl font-bold text-neutral-900 dark:text-neutral-50 md:text-3xl">
          Popular Concrete Services
        </h2>
        <p class="mt-2 text-neutral-600 dark:text-neutral-400">
          Find contractors specialized in your specific project type
        </p>
      </div>

      <!-- Services Grid -->
      <!-- Mobile: 1 col | Tablet: 2 cols | Desktop: 3 cols -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <NuxtLink
          v-for="service in services"
          :key="service.slug"
          :to="getServiceUrl(service.slug)"
          class="group flex items-start gap-4 rounded-xl border border-neutral-200 bg-white p-5 transition-all hover:border-blue-300 hover:shadow-md dark:border-neutral-700 dark:bg-neutral-900 dark:hover:border-blue-600"
        >
          <!-- Icon Container -->
          <div class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 transition-colors group-hover:bg-blue-500 group-hover:text-white dark:bg-blue-900/30 dark:text-blue-400 dark:group-hover:bg-blue-600 dark:group-hover:text-white">
            <Icon :name="service.icon" class="h-6 w-6" />
          </div>

          <!-- Content -->
          <div class="flex-1">
            <h3 class="mb-1 font-semibold text-neutral-900 transition-colors group-hover:text-blue-600 dark:text-neutral-100 dark:group-hover:text-blue-400">
              {{ service.name }}
            </h3>
            <p class="text-sm text-neutral-600 dark:text-neutral-400">
              {{ service.description }}
            </p>
          </div>

          <!-- Arrow -->
          <Icon
            name="heroicons:chevron-right"
            class="h-5 w-5 flex-shrink-0 text-neutral-400 transition-transform group-hover:translate-x-1 group-hover:text-blue-500 dark:text-neutral-500 dark:group-hover:text-blue-400"
          />
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Component styles handled by Tailwind */
</style>

