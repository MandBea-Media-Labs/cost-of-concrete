<script setup lang="ts">
// Staining Concrete Hub Page
// Template for hub pages with sidebar navigation and topic cards grid

import { stainingConcreteNavigation, stainingConcreteTopicCards } from '~/mock-data/hubNavigation'

// SEO Meta
useSeoMeta({
  title: 'The Art of Acid Stained Concrete | Complete Guide',
  description: 'Learn how to use acid-based chemical stains to impart rich, earth-toned color to plain concrete floors. Expert tips, cost breakdowns, and contractor recommendations.'
})

// Import navigation sections and topic cards from mock data
const navigationSections = stainingConcreteNavigation
const topicCards = stainingConcreteTopicCards
</script>

<template>
  <div class="min-h-screen bg-neutral-50 dark:bg-neutral-900">
    <div class="mx-auto max-w-8xl px-4 py-8 sm:px-6 lg:px-8">
      <!-- Main Grid: Sidebar (1/4) + Content (3/4) -->
      <div class="grid grid-cols-1 gap-8 lg:grid-cols-4 lg:gap-12">
        <!-- Sidebar Navigation (1/4) -->
        <div class="lg:col-span-1">
          <HubSidebar
            :sections="navigationSections"
            active-page="/staining-concrete"
            :sticky="true"
          />
        </div>

        <!-- Main Content Area (3/4) -->
        <article class="lg:col-span-3">
          <!-- Hero Section -->
          <section class="mb-12">
            <!-- Eyebrow -->
            <div class="mb-4">
              <Eyebrow
                text="Concrete Guide"
                variant="blue-blue"
                size="md"
              />
            </div>

            <!-- Title -->
            <h1 class="mb-4 font-heading text-4xl font-bold leading-tight text-neutral-900 dark:text-neutral-50 md:text-5xl lg:text-6xl">
              The Art of Acid Stained Concrete
            </h1>

            <!-- Subtitle -->
            <p class="mb-6 text-lg text-neutral-600 dark:text-neutral-300 md:text-xl">
              Learn how to use acid-based chemical stains to impart rich, earth-toned color to plain concrete floors
            </p>

            <!-- Date -->
            <p class="mb-8 text-sm text-neutral-500 dark:text-neutral-400">
              Updated May 12, 2025
            </p>

            <!-- Featured Image -->
            <div class="relative overflow-hidden rounded-lg">
              <img
                src="/images/mock-data/hub-pages/concrete-stained-basement-floor.webp"
                alt="Beautiful acid stained concrete floor"
                class="h-auto w-full object-contain"
              />
              <!-- Image Caption -->
              <div class="absolute bottom-4 right-4 rounded-md bg-neutral-900/80 px-3 py-2 text-sm text-white backdrop-blur-sm">
                Concrete Wizards, Charlotte, NC
              </div>
            </div>
          </section>

          <!-- Introduction -->
          <section class="mb-12">
            <div class="prose prose-lg dark:prose-invert max-w-none">
              <p class="text-neutral-700 dark:text-neutral-300">
                Staining imparts a luxurious richness that can't be achieved by any other coloring medium. Rather than produce a solid, opaque effect like paint, stains permeate the concrete to infuse it with luminous, translucent tones that vary depending on the surface they are applied to. The application techniques used, the results can mimic everything from polished marble to tanned leather to natural stone or even stained wood.
              </p>
              <p class="text-neutral-700 dark:text-neutral-300">
                <NuxtLink to="/search" class="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                  Find stained concrete contractors near me
                </NuxtLink>
              </p>
            </div>
          </section>

          <!-- Topic Cards Grid Section -->
          <section class="mb-16">
            <!-- Section Heading -->
            <h2 class="mb-8 font-heading text-3xl font-bold text-neutral-900 dark:text-neutral-50 md:text-4xl">
              Stained Concrete Information
            </h2>

            <!-- 3-Column Grid of Topic Cards -->
            <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <HubTopicCard
                v-for="card in topicCards"
                :key="card.to"
                :image="card.image"
                :title="card.title"
                :description="card.description"
                :to="card.to"
              />
            </div>
          </section>

          <!-- Article Content Section -->
          <section class="mb-16 space-y-12">
            <!-- Section: Acid Stains vs Water-Based Stains -->
            <div>
              <h2 class="mb-6 font-heading text-3xl font-bold text-neutral-900 dark:text-neutral-50">
                Acid Stains Vs Water-Based Stains
              </h2>
              <div class="prose prose-lg dark:prose-invert max-w-none">
                <p class="text-neutral-700 dark:text-neutral-300">
                  Stains for concrete come in two general categories: acid-based chemical stains and water-based stains. Both types of stain penetrate the surface to add permanent color, but they achieve this in different ways.
                </p>
                <p class="text-neutral-700 dark:text-neutral-300">
                  Acid stains react chemically with the concrete to create variegated, translucent color effects. Water-based stains, on the other hand, deposit colored particles into the concrete's pores to produce more uniform, opaque colors. Each type has its own unique characteristics and application methods.
                </p>
              </div>
            </div>

            <!-- Section: Types of Concrete Stains -->
            <div>
              <h2 class="mb-6 font-heading text-3xl font-bold text-neutral-900 dark:text-neutral-50">
                Types of Concrete Stains
              </h2>
              <div class="prose prose-lg dark:prose-invert max-w-none">
                <p class="text-neutral-700 dark:text-neutral-300">
                  Understanding the different types of concrete stains available will help you choose the right product for your project. Acid stains offer earth-toned colors like browns, tans, and terra cottas, while water-based stains provide a broader color palette including blues, greens, reds, and blacks.
                </p>
              </div>
            </div>

            <!-- Section: Application Process -->
            <div>
              <h2 class="mb-6 font-heading text-3xl font-bold text-neutral-900 dark:text-neutral-50">
                Application Process
              </h2>
              <div class="prose prose-lg dark:prose-invert max-w-none">
                <p class="text-neutral-700 dark:text-neutral-300">
                  The application of concrete stain requires careful surface preparation, proper safety equipment, and attention to detail. The concrete must be clean, dry, and free of any sealers or coatings. The stain is typically applied with a sprayer, brush, or sponge, and the final appearance depends on factors like application technique, concrete porosity, and dwell time.
                </p>
              </div>
            </div>
          </section>

          <!-- Bottom CTA Section -->
          <section class="rounded-lg border border-neutral-200 bg-white p-8 dark:border-neutral-700 dark:bg-neutral-900 md:p-12">
            <!-- Eyebrow -->
            <div class="mb-4">
              <Eyebrow
                text="Ready to Get Started?"
                variant="blue-blue"
                size="md"
              />
            </div>

            <!-- Heading -->
            <h2 class="mb-4 font-heading text-3xl font-bold text-neutral-900 dark:text-neutral-50 md:text-4xl">
              Find Local Concrete Contractors
            </h2>

            <!-- Description -->
            <p class="mb-8 text-lg text-neutral-600 dark:text-neutral-300">
              Connect with experienced concrete staining professionals in your area. Get free quotes and compare services to find the perfect contractor for your project.
            </p>

            <!-- CTA Buttons -->
            <div class="flex flex-col gap-4 sm:flex-row">
              <Button
                text="Find a Contractor"
                variant="primary"
                size="lg"
                location="/search"
                icon="heroicons:magnifying-glass"
              />
              <Button
                text="Get Free Quote"
                variant="primary-outline"
                size="lg"
                icon="heroicons:document-text"
              />
            </div>
          </section>
        </article>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>

