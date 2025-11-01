<script setup lang="ts">
// Button demo page
useSeoMeta({
  title: 'Button Component Demo - Cost of Concrete',
  description: 'Interactive demonstration of the Button UI component with all variants and sizes.'
})
</script>

<template>
  <div class="space-y-12">
    <!-- Header -->
    <div class="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-8 text-neutral-50">
      <h1 class="text-4xl font-bold font-heading mb-3">
        Button Component
      </h1>
      <p class="text-blue-100 text-lg">
        A flexible, accessible button component built with Reka UI primitives
      </p>
    </div>

    <!-- Primary Variant - All Sizes -->
    <section class="bg-neutral-50 rounded-xl p-8 border-2 border-neutral-200">
      <h2 class="text-2xl font-bold font-heading text-neutral-700 mb-6">
        Primary Variant
      </h2>

      <div class="space-y-6">
        <!-- Small -->
        <div>
          <h3 class="text-sm font-semibold text-neutral-600 mb-3 uppercase tracking-wide">
            Small (sm)
          </h3>
          <div class="flex flex-wrap gap-4">
            <Button text="For Contractors" size="sm" variant="primary" />
            <Button text="With Route" size="sm" variant="primary" location="/" />
            <Button text="Disabled" size="sm" variant="primary" :disabled="true" />
          </div>
        </div>

        <!-- Medium -->
        <div>
          <h3 class="text-sm font-semibold text-neutral-600 mb-3 uppercase tracking-wide">
            Medium (md) - Default
          </h3>
          <div class="flex flex-wrap gap-4">
            <Button text="For Contractors" size="md" variant="primary" />
            <Button text="With Route" size="md" variant="primary" location="/" />
            <Button text="Disabled" size="md" variant="primary" :disabled="true" />
          </div>
        </div>

        <!-- Large -->
        <div>
          <h3 class="text-sm font-semibold text-neutral-600 mb-3 uppercase tracking-wide">
            Large (lg)
          </h3>
          <div class="flex flex-wrap gap-4">
            <Button text="For Contractors" size="lg" variant="primary" />
            <Button text="With Route" size="lg" variant="primary" location="/" />
            <Button text="Disabled" size="lg" variant="primary" :disabled="true" />
          </div>
        </div>

        <!-- Extra Large -->
        <div>
          <h3 class="text-sm font-semibold text-neutral-600 mb-3 uppercase tracking-wide">
            Extra Large (xl)
          </h3>
          <div class="flex flex-wrap gap-4">
            <Button text="For Contractors" size="xl" variant="primary" />
            <Button text="With Route" size="xl" variant="primary" location="/" />
            <Button text="Disabled" size="xl" variant="primary" :disabled="true" />
          </div>
        </div>
      </div>
    </section>

    <!-- Secondary Variant - All Sizes -->
    <section class="bg-neutral-50 rounded-xl p-8 border-2 border-neutral-200">
      <h2 class="text-2xl font-bold font-heading text-neutral-700 mb-6">
        Secondary Variant
      </h2>

      <div class="space-y-6">
        <!-- Small -->
        <div>
          <h3 class="text-sm font-semibold text-neutral-600 mb-3 uppercase tracking-wide">
            Small (sm)
          </h3>
          <div class="flex flex-wrap gap-4">
            <Button text="Learn More" size="sm" variant="secondary" />
            <Button text="With Route" size="sm" variant="secondary" location="/about" />
            <Button text="Disabled" size="sm" variant="secondary" :disabled="true" />
          </div>
        </div>

        <!-- Medium -->
        <div>
          <h3 class="text-sm font-semibold text-neutral-600 mb-3 uppercase tracking-wide">
            Medium (md) - Default
          </h3>
          <div class="flex flex-wrap gap-4">
            <Button text="Learn More" size="md" variant="secondary" />
            <Button text="With Route" size="md" variant="secondary" location="/about" />
            <Button text="Disabled" size="md" variant="secondary" :disabled="true" />
          </div>
        </div>

        <!-- Large -->
        <div>
          <h3 class="text-sm font-semibold text-neutral-600 mb-3 uppercase tracking-wide">
            Large (lg)
          </h3>
          <div class="flex flex-wrap gap-4">
            <Button text="Learn More" size="lg" variant="secondary" />
            <Button text="With Route" size="lg" variant="secondary" location="/about" />
            <Button text="Disabled" size="lg" variant="secondary" :disabled="true" />
          </div>
        </div>

        <!-- Extra Large -->
        <div>
          <h3 class="text-sm font-semibold text-neutral-600 mb-3 uppercase tracking-wide">
            Extra Large (xl)
          </h3>
          <div class="flex flex-wrap gap-4">
            <Button text="Learn More" size="xl" variant="secondary" />
            <Button text="With Route" size="xl" variant="secondary" location="/about" />
            <Button text="Disabled" size="xl" variant="secondary" :disabled="true" />
          </div>
        </div>
      </div>
    </section>

    <!-- Usage Examples -->
    <section class="bg-blue-50 rounded-xl p-8 border-2 border-blue-200">
      <h2 class="text-2xl font-bold font-heading text-neutral-700 mb-6">
        Real-World Examples
      </h2>

      <div class="space-y-8">
        <!-- Hero CTA -->
        <div class="bg-neutral-50 rounded-lg p-6">
          <h3 class="text-lg font-semibold font-heading text-neutral-700 mb-4">
            Hero Call-to-Action
          </h3>
          <div class="flex flex-wrap gap-4">
            <Button text="For Contractors" size="xl" variant="primary" location="/contractors" />
            <Button text="Learn More" size="xl" variant="secondary" location="/about" />
          </div>
        </div>

        <!-- Form Actions -->
        <div class="bg-neutral-50 rounded-lg p-6">
          <h3 class="text-lg font-semibold font-heading text-neutral-700 mb-4">
            Form Actions
          </h3>
          <div class="flex flex-wrap gap-4">
            <Button text="Submit" size="md" variant="primary" />
            <Button text="Cancel" size="md" variant="secondary" />
          </div>
        </div>

        <!-- Navigation -->
        <div class="bg-neutral-50 rounded-lg p-6">
          <h3 class="text-lg font-semibold font-heading text-neutral-700 mb-4">
            Navigation Buttons
          </h3>
          <div class="flex flex-wrap gap-4">
            <Button text="Home" size="sm" variant="secondary" location="/" />
            <Button text="About" size="sm" variant="secondary" location="/about" />
            <Button text="Contact" size="sm" variant="primary" location="/contact" />
          </div>
        </div>
      </div>
    </section>

    <!-- Component Props -->
    <section class="bg-neutral-50 rounded-xl p-8 border-2 border-neutral-200">
      <h2 class="text-2xl font-bold font-heading text-neutral-700 mb-6">
        Component Props
      </h2>

      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead>
            <tr class="border-b-2 border-neutral-300">
              <th class="pb-3 pr-4 font-heading font-semibold text-neutral-700">Prop</th>
              <th class="pb-3 pr-4 font-heading font-semibold text-neutral-700">Type</th>
              <th class="pb-3 pr-4 font-heading font-semibold text-neutral-700">Default</th>
              <th class="pb-3 font-heading font-semibold text-neutral-700">Description</th>
            </tr>
          </thead>
          <tbody class="text-neutral-600">
            <tr class="border-b border-neutral-200">
              <td class="py-3 pr-4 font-mono text-sm text-blue-600">text</td>
              <td class="py-3 pr-4 font-mono text-sm">string</td>
              <td class="py-3 pr-4 font-mono text-sm">-</td>
              <td class="py-3">The text to display on the button (required)</td>
            </tr>
            <tr class="border-b border-neutral-200">
              <td class="py-3 pr-4 font-mono text-sm text-blue-600">size</td>
              <td class="py-3 pr-4 font-mono text-sm">'sm' | 'md' | 'lg' | 'xl'</td>
              <td class="py-3 pr-4 font-mono text-sm">'md'</td>
              <td class="py-3">The size of the button</td>
            </tr>
            <tr class="border-b border-neutral-200">
              <td class="py-3 pr-4 font-mono text-sm text-blue-600">variant</td>
              <td class="py-3 pr-4 font-mono text-sm">'primary' | 'secondary'</td>
              <td class="py-3 pr-4 font-mono text-sm">'primary'</td>
              <td class="py-3">The visual variant of the button</td>
            </tr>
            <tr class="border-b border-neutral-200">
              <td class="py-3 pr-4 font-mono text-sm text-blue-600">location</td>
              <td class="py-3 pr-4 font-mono text-sm">string | null</td>
              <td class="py-3 pr-4 font-mono text-sm">null</td>
              <td class="py-3">Route to navigate to. If null, button does nothing on click</td>
            </tr>
            <tr>
              <td class="py-3 pr-4 font-mono text-sm text-blue-600">disabled</td>
              <td class="py-3 pr-4 font-mono text-sm">boolean</td>
              <td class="py-3 pr-4 font-mono text-sm">false</td>
              <td class="py-3">Whether the button is disabled</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<style scoped>
</style>

