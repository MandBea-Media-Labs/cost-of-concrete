<script setup lang="ts">
// Concrete Guides & Tips component for the homepage
// Features eyebrow, heading with "See All" button, and article cards in responsive grid
// Displays popular concrete-related articles and guides

interface Article {
  image: string
  eyebrow: string
  heading: string
  body: string
  to: string
}

// Mock article data - matching reference image
const articles: Article[] = [
  {
    image: 'https://placeholdit.com/600x400',
    eyebrow: 'How To Pick A Contractor',
    heading: 'What are the signs of poor concrete installation?',
    body: 'Igns include uneven surfaces, excessive cracking, spalling (surface chipping), and poor drainage. Hiring experienced contrac...',
    to: '/'
  },
  {
    image: 'https://placeholdit.com/600x400',
    eyebrow: 'Before You Hire a Concrete Contractor',
    heading: 'Do I need rebar in my concrete?',
    body: 'This is a secondary page preview. As evident, content is displayed on this type of page.',
    to: '/'
  },
  {
    image: 'https://placeholdit.com/600x400',
    eyebrow: 'Concrete Installation Tips',
    heading: 'How thick should a concrete patio be?',
    body: 'Standard concrete patios should be at least 4 inches thick. For areas with heavy use or freeze-thaw cycles, consider 5-6 inches...',
    to: '/'
  },
  {
    image: 'https://placeholdit.com/600x400',
    eyebrow: 'How To Pick A Contractor',
    heading: 'Does Dry Pouring Concrete Hold Up',
    body: 'DIY installation is possible but requires the right tools, knowledge, and preparation. Concrete patios need proper site grading,...',
    to: '/'
  },
]
</script>

<template>
  <section class="md:py-26 bg-white py-20 dark:bg-neutral-800 lg:py-28">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <!-- Eyebrow -->
      <div class="mb-6">
        <Eyebrow
          text="Concrete Guides & Tips"
          variant="blue-blue"
          size="md"
        />
      </div>

      <!-- Heading + See All Button Row -->
      <div class="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <!-- Heading -->
        <h2 class="font-heading text-3xl font-bold leading-tight text-neutral-900 dark:text-neutral-50 md:text-4xl lg:text-5xl">
          Popular articles
        </h2>

        <!-- See All Button -->
        <div class="flex justify-start">
          <NuxtLink to="/">
            <Button
              text="See All"
              variant="primary-outline"
              size="md"
              icon="heroicons:arrow-right"
              icon-position="right"
            />
          </NuxtLink>
        </div>
      </div>

      <!-- Articles Grid -->
      <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2 lg:gap-8">
        <ArticleCard
          v-for="article in articles"
          :key="article.heading"
          :image="article.image"
          :eyebrow="article.eyebrow"
          :heading="article.heading"
          :to="article.to"
          variant="secondary-light-outline"
          :border="true"
          border-width="thin"
        >
          {{ article.body }}
        </ArticleCard>
      </div>
    </div>
  </section>
</template>

<style scoped></style>

