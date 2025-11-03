<script setup lang="ts">
// Explore Categories component for the homepage
// Features eyebrow, heading with carousel controls, and category cards in responsive grid
// Static implementation - carousel logic to be added later

interface Category {
  title: string
  description: string
  image: string
}

// Mock category data - matching reference image
const categories: Category[] = [
  {
    title: 'Driveway',
    description: 'Durable concrete driveway solutions for residential and commercial properties, built to handle heavy use and enhance curb appeal.',
    image: 'https://placeholdit.com/600x400'
  },
  {
    title: 'Patio',
    description: 'Custom concrete patios designed for outdoor living, offering style, comfort, and long-lasting performance in any climate.',
    image: 'https://placeholdit.com/600x400'
  },
  {
    title: 'Foundation',
    description: 'Professional foundation pouring and repair services to ensure structural stability, protection from shifting soil, and long-term durability.',
    image: 'https://placeholdit.com/600x400'
  }
]
</script>

<template>
  <section class="md:py-26 bg-white py-20 dark:bg-neutral-800 lg:py-28">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <!-- Eyebrow -->
      <div class="mb-6">
        <Eyebrow
          text="Explore by Categories"
          variant="blue-blue"
          size="md"
        />
      </div>

      <!-- Heading + Carousel Controls Row -->
      <div class="mb-12 grid grid-cols-1 items-center gap-6 md:grid-cols-2 md:gap-8">
        <!-- Heading -->
        <h2 class="font-heading text-3xl font-bold leading-tight text-neutral-900 dark:text-neutral-50 md:text-4xl">
          Find the Right Service<br />for Your Project
        </h2>

        <!-- Carousel Controls (Desktop only) -->
        <div class="flex justify-start gap-3 md:justify-end">
          <!-- Previous Button -->
          <button
            type="button"
            class="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500 text-white transition-colors hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-500 dark:hover:bg-blue-600"
            aria-label="Previous category"
          >
            <Icon name="heroicons:chevron-left" class="h-6 w-6" />
          </button>

          <!-- Next Button -->
          <button
            type="button"
            class="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500 text-white transition-colors hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-500 dark:hover:bg-blue-600"
            aria-label="Next category"
          >
            <Icon name="heroicons:chevron-right" class="h-6 w-6" />
          </button>
        </div>
      </div>

      <!-- Category Cards Grid -->
      <!-- 1 column on mobile, 2 columns on tablet, 3 columns on desktop -->
      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="category in categories"
          :key="category.title"
          class="flex flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-neutral-700 dark:bg-neutral-900"
        >
          <!-- Category Image -->
          <div class="aspect-[3/2] w-full overflow-hidden">
            <img
              :src="category.image"
              :alt="category.title"
              class="h-full w-full object-cover"
            />
          </div>

          <!-- Category Content -->
          <div class="flex flex-1 flex-col p-6">
            <!-- Category Title -->
            <h3 class="mb-3 font-heading text-2xl font-bold text-neutral-900 dark:text-neutral-50">
              {{ category.title }}
            </h3>

            <!-- Category Description -->
            <p class="mb-6 flex-1 text-base text-neutral-600 dark:text-neutral-300">
              {{ category.description }}
            </p>

            <!-- View Contractors Button -->
            <div>
              <NuxtLink to="/">
                <Button
                  text="View Contractors"
                  variant="primary-outline"
                  size="md"
                />
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
</style>

