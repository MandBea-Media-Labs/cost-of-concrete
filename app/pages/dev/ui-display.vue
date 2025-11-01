<script setup lang="ts">
// UI Components Display Page
useSeoMeta({
  title: 'UI Components Display - Cost of Concrete',
  description: 'Interactive demonstration of all UI components with variants and sizes.'
})
</script>

<template>
  <div class="space-y-12">
    <!-- Header -->
    <div class="rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 p-8 text-neutral-50">
      <h1 class="mb-3 font-heading text-4xl font-bold">
        UI Components Display
      </h1>
      <p class="text-lg text-blue-100">
        Interactive showcase of all UI components built with Reka UI primitives
      </p>
    </div>

    <!-- Button Components in 2-Column Grid -->
    <div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <!-- Primary Variant - All Sizes -->
      <section class="rounded-xl border-2 border-neutral-200 bg-neutral-50 p-8">
      <h2 class="mb-6 font-heading text-2xl font-bold text-neutral-700">
        Primary Variant
      </h2>

      <div class="space-y-6">
        <!-- Small -->
        <div>
          <h3 class="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-600">
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
          <h3 class="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-600">
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
          <h3 class="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-600">
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
          <h3 class="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-600">
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

      <!-- Primary Outline Variant - All Sizes -->
      <section class="rounded-xl border-2 border-neutral-200 bg-neutral-50 p-8">
      <h2 class="mb-6 font-heading text-2xl font-bold text-neutral-700">
        Primary Outline Variant
      </h2>

      <div class="space-y-6">
        <!-- Small -->
        <div>
          <h3 class="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-600">
            Small (sm)
          </h3>
          <div class="flex flex-wrap gap-4">
            <Button text="View Contractors" size="sm" variant="primary-outline" />
            <Button text="With Route" size="sm" variant="primary-outline" location="/" />
            <Button text="Disabled" size="sm" variant="primary-outline" :disabled="true" />
          </div>
        </div>

        <!-- Medium -->
        <div>
          <h3 class="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-600">
            Medium (md) - Default
          </h3>
          <div class="flex flex-wrap gap-4">
            <Button text="View Contractors" size="md" variant="primary-outline" />
            <Button text="With Route" size="md" variant="primary-outline" location="/" />
            <Button text="Disabled" size="md" variant="primary-outline" :disabled="true" />
          </div>
        </div>

        <!-- Large -->
        <div>
          <h3 class="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-600">
            Large (lg)
          </h3>
          <div class="flex flex-wrap gap-4">
            <Button text="View Contractors" size="lg" variant="primary-outline" />
            <Button text="With Route" size="lg" variant="primary-outline" location="/" />
            <Button text="Disabled" size="lg" variant="primary-outline" :disabled="true" />
          </div>
        </div>

        <!-- Extra Large -->
        <div>
          <h3 class="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-600">
            Extra Large (xl)
          </h3>
          <div class="flex flex-wrap gap-4">
            <Button text="View Contractors" size="xl" variant="primary-outline" />
            <Button text="With Route" size="xl" variant="primary-outline" location="/" />
            <Button text="Disabled" size="xl" variant="primary-outline" :disabled="true" />
          </div>
        </div>
      </div>
      </section>

      <!-- Secondary Variant - All Sizes -->
      <section class="rounded-xl border-2 border-neutral-200 bg-neutral-50 p-8">
      <h2 class="mb-6 font-heading text-2xl font-bold text-neutral-700">
        Secondary Variant
      </h2>

      <div class="space-y-6">
        <!-- Small -->
        <div>
          <h3 class="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-600">
            Small (sm)
          </h3>
          <div class="flex flex-wrap gap-4">
            <Button text="Learn More" size="sm" variant="secondary" />
            <Button text="With Route" size="sm" variant="secondary" location="/" />
            <Button text="Disabled" size="sm" variant="secondary" :disabled="true" />
          </div>
        </div>

        <!-- Medium -->
        <div>
          <h3 class="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-600">
            Medium (md) - Default
          </h3>
          <div class="flex flex-wrap gap-4">
            <Button text="Learn More" size="md" variant="secondary" />
            <Button text="With Route" size="md" variant="secondary" location="/" />
            <Button text="Disabled" size="md" variant="secondary" :disabled="true" />
          </div>
        </div>

        <!-- Large -->
        <div>
          <h3 class="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-600">
            Large (lg)
          </h3>
          <div class="flex flex-wrap gap-4">
            <Button text="Learn More" size="lg" variant="secondary" />
            <Button text="With Route" size="lg" variant="secondary" location="/" />
            <Button text="Disabled" size="lg" variant="secondary" :disabled="true" />
          </div>
        </div>

        <!-- Extra Large -->
        <div>
          <h3 class="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-600">
            Extra Large (xl)
          </h3>
          <div class="flex flex-wrap gap-4">
            <Button text="Learn More" size="xl" variant="secondary" />
            <Button text="With Route" size="xl" variant="secondary" location="/" />
            <Button text="Disabled" size="xl" variant="secondary" :disabled="true" />
          </div>
        </div>
      </div>
      </section>

      <!-- Secondary Outline Variant - All Sizes -->
      <section class="rounded-xl border-2 border-neutral-200 bg-neutral-50 p-8">
      <h2 class="mb-6 font-heading text-2xl font-bold text-neutral-700">
        Secondary Outline Variant
      </h2>

      <div class="space-y-6">
        <!-- Small -->
        <div>
          <h3 class="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-600">
            Small (sm)
          </h3>
          <div class="flex flex-wrap gap-4">
            <Button text="Learn More" size="sm" variant="secondary-outline" />
            <Button text="With Route" size="sm" variant="secondary-outline" location="/" />
            <Button text="Disabled" size="sm" variant="secondary-outline" :disabled="true" />
          </div>
        </div>

        <!-- Medium -->
        <div>
          <h3 class="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-600">
            Medium (md) - Default
          </h3>
          <div class="flex flex-wrap gap-4">
            <Button text="Learn More" size="md" variant="secondary-outline" />
            <Button text="With Route" size="md" variant="secondary-outline" location="/" />
            <Button text="Disabled" size="md" variant="secondary-outline" :disabled="true" />
          </div>
        </div>

        <!-- Large -->
        <div>
          <h3 class="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-600">
            Large (lg)
          </h3>
          <div class="flex flex-wrap gap-4">
            <Button text="Learn More" size="lg" variant="secondary-outline" />
            <Button text="With Route" size="lg" variant="secondary-outline" location="/" />
            <Button text="Disabled" size="lg" variant="secondary-outline" :disabled="true" />
          </div>
        </div>

        <!-- Extra Large -->
        <div>
          <h3 class="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-600">
            Extra Large (xl)
          </h3>
          <div class="flex flex-wrap gap-4">
            <Button text="Learn More" size="xl" variant="secondary-outline" />
            <Button text="With Route" size="xl" variant="secondary-outline" location="/" />
            <Button text="Disabled" size="xl" variant="secondary-outline" :disabled="true" />
          </div>
        </div>
      </div>
      </section>
    </div>

    <!-- Usage Examples -->
    <section class="rounded-xl border-2 border-blue-200 bg-blue-50 p-8">
      <h2 class="mb-6 font-heading text-2xl font-bold text-neutral-700">
        Real-World Examples
      </h2>

      <div class="space-y-8">
        <!-- Hero CTA -->
        <div class="rounded-lg bg-neutral-50 p-6">
          <h3 class="mb-4 font-heading text-lg font-semibold text-neutral-700">
            Hero Call-to-Action
          </h3>
          <div class="flex flex-wrap gap-4">
            <Button text="For Contractors" size="xl" variant="primary" location="/" />
            <Button text="View Contractors" size="xl" variant="primary-outline" location="/" />
          </div>
        </div>

        <!-- Form Actions -->
        <div class="rounded-lg bg-neutral-50 p-6">
          <h3 class="mb-4 font-heading text-lg font-semibold text-neutral-700">
            Form Actions
          </h3>
          <div class="flex flex-wrap gap-4">
            <Button text="Submit" size="md" variant="primary" />
            <Button text="Cancel" size="md" variant="secondary-outline" />
          </div>
        </div>

        <!-- Navigation -->
        <div class="rounded-lg bg-neutral-50 p-6">
          <h3 class="mb-4 font-heading text-lg font-semibold text-neutral-700">
            Navigation Buttons
          </h3>
          <div class="flex flex-wrap gap-4">
            <Button text="Home" size="sm" variant="secondary-outline" location="/" />
            <Button text="About" size="sm" variant="secondary-outline" location="/" />
            <Button text="Contact" size="sm" variant="primary" location="/" />
          </div>
        </div>
      </div>
    </section>

    <!-- Popover Component -->
    <section class="rounded-xl border-2 border-neutral-200 bg-neutral-50 p-8">
      <h2 class="mb-6 font-heading text-2xl font-bold text-neutral-700">
        Popover Component
      </h2>

      <div class="space-y-8">
        <!-- Basic Popover -->
        <div>
          <h3 class="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-600">
            Basic Popover
          </h3>
          <div class="flex flex-wrap gap-4">
            <Popover trigger-text="Open Popover">
              <div class="space-y-3">
                <h4 class="font-heading text-lg font-bold text-neutral-700">
                  Popover Title
                </h4>
                <p class="text-sm text-neutral-600">
                  This is a basic popover with some content inside. You can put any content here.
                </p>
              </div>
            </Popover>
          </div>
        </div>

        <!-- Different Sides -->
        <div>
          <h3 class="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-600">
            Different Sides
          </h3>
          <div class="flex flex-wrap gap-4">
            <Popover trigger-text="Top" side="top">
              <p class="text-sm text-neutral-600">Popover on top</p>
            </Popover>
            <Popover trigger-text="Right" side="right">
              <p class="text-sm text-neutral-600">Popover on right</p>
            </Popover>
            <Popover trigger-text="Bottom" side="bottom">
              <p class="text-sm text-neutral-600">Popover on bottom</p>
            </Popover>
            <Popover trigger-text="Left" side="left">
              <p class="text-sm text-neutral-600">Popover on left</p>
            </Popover>
          </div>
        </div>

        <!-- Different Alignments -->
        <div>
          <h3 class="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-600">
            Different Alignments
          </h3>
          <div class="flex flex-wrap gap-4">
            <Popover trigger-text="Start Align" align="start">
              <p class="text-sm text-neutral-600">Aligned to start</p>
            </Popover>
            <Popover trigger-text="Center Align" align="center">
              <p class="text-sm text-neutral-600">Aligned to center</p>
            </Popover>
            <Popover trigger-text="End Align" align="end">
              <p class="text-sm text-neutral-600">Aligned to end</p>
            </Popover>
          </div>
        </div>

        <!-- Without Arrow -->
        <div>
          <h3 class="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-600">
            Without Arrow
          </h3>
          <div class="flex flex-wrap gap-4">
            <Popover trigger-text="No Arrow" :show-arrow="false">
              <p class="text-sm text-neutral-600">This popover has no arrow</p>
            </Popover>
          </div>
        </div>

        <!-- Custom Width -->
        <div>
          <h3 class="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-600">
            Custom Width
          </h3>
          <div class="flex flex-wrap gap-4">
            <Popover trigger-text="Wide Popover" width="400px">
              <div class="space-y-3">
                <h4 class="font-heading text-lg font-bold text-neutral-700">
                  Wide Popover
                </h4>
                <p class="text-sm text-neutral-600">
                  This popover has a custom width of 400px. You can set any width you need for your content.
                </p>
              </div>
            </Popover>
          </div>
        </div>

        <!-- Custom Trigger -->
        <div>
          <h3 class="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-600">
            Custom Trigger
          </h3>
          <div class="flex flex-wrap gap-4">
            <Popover>
              <template #trigger>
                <Button text="Custom Trigger Button" variant="secondary" />
              </template>
              <div class="space-y-3">
                <h4 class="font-heading text-lg font-bold text-neutral-700">
                  Custom Trigger
                </h4>
                <p class="text-sm text-neutral-600">
                  You can use any component as a trigger by using the trigger slot.
                </p>
              </div>
            </Popover>
          </div>
        </div>
      </div>
    </section>

    <!-- Component Props -->
    <section class="rounded-xl border-2 border-neutral-200 bg-neutral-50 p-8">
      <h2 class="mb-6 font-heading text-2xl font-bold text-neutral-700">
        Button Component Props
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
              <td class="font-mono py-3 pr-4 text-sm text-blue-600">text</td>
              <td class="font-mono py-3 pr-4 text-sm">string</td>
              <td class="font-mono py-3 pr-4 text-sm">-</td>
              <td class="py-3">The text to display on the button (required)</td>
            </tr>
            <tr class="border-b border-neutral-200">
              <td class="font-mono py-3 pr-4 text-sm text-blue-600">size</td>
              <td class="font-mono py-3 pr-4 text-sm">'sm' | 'md' | 'lg' | 'xl'</td>
              <td class="font-mono py-3 pr-4 text-sm">'md'</td>
              <td class="py-3">The size of the button</td>
            </tr>
            <tr class="border-b border-neutral-200">
              <td class="font-mono py-3 pr-4 text-sm text-blue-600">variant</td>
              <td class="font-mono py-3 pr-4 text-sm">'primary' | 'secondary' | 'primary-outline' | 'secondary-outline'</td>
              <td class="font-mono py-3 pr-4 text-sm">'primary'</td>
              <td class="py-3">The visual variant of the button</td>
            </tr>
            <tr class="border-b border-neutral-200">
              <td class="font-mono py-3 pr-4 text-sm text-blue-600">location</td>
              <td class="font-mono py-3 pr-4 text-sm">string | null</td>
              <td class="font-mono py-3 pr-4 text-sm">null</td>
              <td class="py-3">Route to navigate to. If null, button does nothing on click</td>
            </tr>
            <tr>
              <td class="font-mono py-3 pr-4 text-sm text-blue-600">disabled</td>
              <td class="font-mono py-3 pr-4 text-sm">boolean</td>
              <td class="font-mono py-3 pr-4 text-sm">false</td>
              <td class="py-3">Whether the button is disabled</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Popover Component Props -->
    <section class="rounded-xl border-2 border-neutral-200 bg-neutral-50 p-8">
      <h2 class="mb-6 font-heading text-2xl font-bold text-neutral-700">
        Popover Component Props
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
              <td class="font-mono py-3 pr-4 text-sm text-blue-600">triggerText</td>
              <td class="font-mono py-3 pr-4 text-sm">string</td>
              <td class="font-mono py-3 pr-4 text-sm">'Open'</td>
              <td class="py-3">The text to display on the trigger button</td>
            </tr>
            <tr class="border-b border-neutral-200">
              <td class="font-mono py-3 pr-4 text-sm text-blue-600">side</td>
              <td class="font-mono py-3 pr-4 text-sm">'top' | 'right' | 'bottom' | 'left'</td>
              <td class="font-mono py-3 pr-4 text-sm">'bottom'</td>
              <td class="py-3">The side where the popover should appear</td>
            </tr>
            <tr class="border-b border-neutral-200">
              <td class="font-mono py-3 pr-4 text-sm text-blue-600">align</td>
              <td class="font-mono py-3 pr-4 text-sm">'start' | 'center' | 'end'</td>
              <td class="font-mono py-3 pr-4 text-sm">'center'</td>
              <td class="py-3">The alignment of the popover relative to the trigger</td>
            </tr>
            <tr class="border-b border-neutral-200">
              <td class="font-mono py-3 pr-4 text-sm text-blue-600">sideOffset</td>
              <td class="font-mono py-3 pr-4 text-sm">number</td>
              <td class="font-mono py-3 pr-4 text-sm">5</td>
              <td class="py-3">The distance in pixels from the trigger</td>
            </tr>
            <tr class="border-b border-neutral-200">
              <td class="font-mono py-3 pr-4 text-sm text-blue-600">showArrow</td>
              <td class="font-mono py-3 pr-4 text-sm">boolean</td>
              <td class="font-mono py-3 pr-4 text-sm">true</td>
              <td class="py-3">Whether to show the arrow</td>
            </tr>
            <tr class="border-b border-neutral-200">
              <td class="font-mono py-3 pr-4 text-sm text-blue-600">width</td>
              <td class="font-mono py-3 pr-4 text-sm">string</td>
              <td class="font-mono py-3 pr-4 text-sm">'260px'</td>
              <td class="py-3">Custom width for the popover content</td>
            </tr>
            <tr>
              <td class="font-mono py-3 pr-4 text-sm text-blue-600">open</td>
              <td class="font-mono py-3 pr-4 text-sm">boolean</td>
              <td class="font-mono py-3 pr-4 text-sm">undefined</td>
              <td class="py-3">Whether the popover is controlled externally (v-model:open)</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="mt-6 rounded-lg bg-blue-50 p-4">
        <h3 class="mb-2 font-heading text-sm font-semibold text-neutral-700">
          Slots
        </h3>
        <ul class="space-y-2 text-sm text-neutral-600">
          <li><span class="font-mono text-blue-600">default</span> - The content to display inside the popover</li>
          <li><span class="font-mono text-blue-600">trigger</span> - Custom trigger element (replaces default button)</li>
        </ul>
      </div>
    </section>
  </div>
</template>

<style scoped>
</style>

