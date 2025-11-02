<script setup lang="ts">
// Hero component for the homepage
// Features eyebrow, heading, description, and search input with button
</script>

<template>
  <section class="relative overflow-hidden rounded-lg bg-gradient-to-b from-[#edf2fc] to-neutral-100 py-16 dark:from-blue-950/20 dark:to-neutral-800 md:py-24 lg:py-32">
    <div class="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
      <!-- Content Container -->
      <div class="flex flex-col items-center text-center">
        <!-- Eyebrow -->
        <div class="mb-6">
          <Eyebrow
            text="Homeowners Guide to Concrete"
            variant="white-blue"
            size="md"
          />
        </div>

        <!-- Heading -->
        <h1 class="mb-6 font-heading text-4xl font-bold leading-tight text-neutral-900 dark:text-neutral-50 sm:text-5xl md:text-6xl lg:text-7xl">
          Find Trusted Concrete<br class="hidden sm:inline" />
          Contractors Near You
        </h1>

        <!-- Description -->
        <p class="mb-10 max-w-3xl text-base text-neutral-600 dark:text-neutral-300 sm:text-lg md:text-xl">
          Get accurate cost estimates, expert tips, and verified local pros for your next driveway,
          patio, or walkway upgrade. Start your project smarter, today.
        </p>

        <!-- Search Input with Button -->
        <div class="w-full max-w-2xl">
          <SearchInput
            placeholder="Type a city, state or zip code.."
            variant="primary-outline"
            size="md"
            button="Find Contractors"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
</style>

