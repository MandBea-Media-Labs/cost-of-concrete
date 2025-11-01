<script setup lang="ts">
// Home page - demonstrates the TestCard component with different variants
</script>

<template>
  <div>
    <div class="mb-8">
      <h2 class="text-3xl font-bold font-heading text-neutral-700 mb-2">
        Welcome to Nuxt 4 with Tailwind CSS
      </h2>
      <p class="text-lg text-neutral-600">
        This page demonstrates the default layout and test components with custom Tailwind styling.
      </p>
    </div>

    <!-- ObjectSans Font Showcase -->
    <div class="mb-12 p-8 bg-gradient-to-br from-blue-50 to-neutral-50 rounded-xl border-2 border-blue-200 shadow-lg">
      <h2 class="text-5xl font-bold font-heading text-neutral-700 mb-4">
        ObjectSans Font Showcase
      </h2>
      <p class="text-xl font-heading text-neutral-600 mb-6">
        This heading uses the custom ObjectSans font loaded from /public/fonts
      </p>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
          <p class="text-sm text-neutral-500 mb-2">Regular Weight (400)</p>
          <p class="text-2xl font-heading font-normal text-neutral-700">
            The quick brown fox jumps over the lazy dog
          </p>
        </div>
        <div class="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
          <p class="text-sm text-neutral-500 mb-2">Bold Weight (700)</p>
          <p class="text-2xl font-heading font-bold text-neutral-700">
            The quick brown fox jumps over the lazy dog
          </p>
        </div>
        <div class="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
          <p class="text-sm text-neutral-500 mb-2">Regular Italic</p>
          <p class="text-2xl font-heading italic text-neutral-700">
            The quick brown fox jumps over the lazy dog
          </p>
        </div>
        <div class="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
          <p class="text-sm text-neutral-500 mb-2">Bold Italic</p>
          <p class="text-2xl font-heading font-bold italic text-neutral-700">
            The quick brown fox jumps over the lazy dog
          </p>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <TestCard
        variant="primary"
        title="Primary Card"
        description="This card uses the primary variant with custom blue accents and demonstrates responsive grid layout."
      />

      <TestCard
        variant="secondary"
        title="Secondary Card"
        description="This card uses the secondary variant with neutral tones and shows component reusability."
      />

      <TestCard
        variant="success"
        title="Success Card"
        description="This card uses the success variant with blue highlights and demonstrates Tailwind's utility classes."
      />
    </div>

    <div class="mt-12 p-6 bg-neutral-50 rounded-lg shadow-md border border-neutral-200">
      <h3 class="text-2xl font-semibold font-heading text-neutral-700 mb-4">
        ✨ Features Demonstrated
      </h3>
      <ul class="space-y-3">
        <li class="flex items-start">
          <span class="text-blue-500 mr-3 text-xl">✓</span>
          <span class="text-neutral-600">Nuxt 4 app directory structure with layouts, components, and pages</span>
        </li>
        <li class="flex items-start">
          <span class="text-blue-500 mr-3 text-xl">✓</span>
          <span class="text-neutral-600">Custom Tailwind CSS color palette (neutral, blue, red)</span>
        </li>
        <li class="flex items-start">
          <span class="text-blue-500 mr-3 text-xl">✓</span>
          <span class="text-neutral-600">Custom font families (ObjectSans, Inter, Inter Tight)</span>
        </li>
        <li class="flex items-start">
          <span class="text-blue-500 mr-3 text-xl">✓</span>
          <span class="text-neutral-600">Auto-imported components (no manual imports needed)</span>
        </li>
        <li class="flex items-start">
          <span class="text-blue-500 mr-3 text-xl">✓</span>
          <span class="text-neutral-600">TypeScript support with proper type definitions</span>
        </li>
        <li class="flex items-start">
          <span class="text-blue-500 mr-3 text-xl">✓</span>
          <span class="text-neutral-600">Component props with variants and computed classes</span>
        </li>
        <li class="flex items-start">
          <span class="text-blue-500 mr-3 text-xl">✓</span>
          <span class="text-neutral-600">Extended maxWidth (8xl: 1580px) for larger screens</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
</style>

