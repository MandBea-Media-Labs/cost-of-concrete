<script setup lang="ts">
// Card Component Showcase
</script>

<template>
  <ComponentSection
    title="Card Component"
    component-name="Card"
    description="Flexible card container with multiple variants, optional icon and heading"
  >
    <div class="space-y-8">
      <!-- Step-based Layout Examples -->
      <div>
        <h3 class="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-600 dark:text-neutral-400">
          Step-based Layout (2-Column)
        </h3>
        <div class="grid grid-cols-1 gap-6">
          <!-- Step 1 -->
          <Card
            variant="secondary-light-outline"
            icon="heroicons:map"
            heading="Search by ZIP"
            :step="1"
          >
            Find local concrete contractors by entering your ZIP code, giving you fast access to nearby service options that match your specific project needs.
          </Card>

          <!-- Step 2 -->
          <Card
            variant="secondary-light-outline"
            icon="heroicons:phone"
            heading="Contact Contractors"
            :step="2"
          >
            Reach out to multiple contractors to compare quotes, services, and availability for your concrete project.
          </Card>

          <!-- Step 3 -->
          <Card
            variant="secondary-light-outline"
            icon="heroicons:check-circle"
            heading="Schedule Installation"
            :step="3"
          >
            Choose your preferred contractor and schedule the concrete installation at a time that works best for your project timeline.
          </Card>
        </div>
      </div>

      <!-- Icon and Heading Examples -->
      <div>
        <h3 class="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-600 dark:text-neutral-400">
          With Icon and Heading (Vertical Layout)
        </h3>
        <div class="@lg:grid-cols-2 grid grid-cols-1 gap-6">
          <!-- Icon + Heading + Content -->
          <Card
            variant="primary-outline"
            icon="heroicons:shield-check"
            heading="Sealing Protects from Weather and Wear"
          >
            Applying a good-quality concrete sealer every few years shields the driveway from moisture, freeze-thaw damage, and staining, preserving appearance and strength.
          </Card>

          <!-- Icon + Heading + Content (Different Icon) -->
          <Card
            variant="primary"
            icon="heroicons:wrench-screwdriver"
            heading="Professional Installation Matters"
          >
            Hiring experienced contractors ensures proper site preparation, correct mix ratios, and expert finishing techniques for a durable, long-lasting concrete surface.
          </Card>

          <!-- Icon Only (No Heading) -->
          <Card variant="primary" icon="heroicons:check-circle">
            Card with just an icon and description text. The heading is optional, allowing for flexible layouts based on your content needs.
          </Card>

          <!-- Heading Only (No Icon) -->
          <Card variant="primary" heading="Heading Without Icon">
            This card demonstrates a heading without an icon. The layout adapts automatically based on which props are provided.
          </Card>
        </div>
      </div>

      <!-- Primary Variant -->
      <div>
        <h3 class="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-600 dark:text-neutral-400">
          Primary Variant (Traditional)
        </h3>
        <div class="@lg:grid-cols-2 grid grid-cols-1 gap-6">
          <!-- Thin Border -->
          <Card variant="primary" border-width="thin">
            <h4 class="mb-2 font-heading text-lg font-bold text-neutral-700 dark:text-neutral-200">
              Primary Card - Thin Border
            </h4>
            <p class="text-sm text-neutral-600 dark:text-neutral-300">
              This is a primary card with a thin border (1px). Perfect for subtle emphasis.
            </p>
          </Card>

          <!-- Thick Border -->
          <Card variant="primary" border-width="thick">
            <h4 class="mb-2 font-heading text-lg font-bold text-neutral-700 dark:text-neutral-200">
              Primary Card - Thick Border
            </h4>
            <p class="text-sm text-neutral-600 dark:text-neutral-300">
              This is a primary card with a thick border (2px). More prominent and bold.
            </p>
          </Card>
        </div>
      </div>

      <!-- Secondary Variant -->
      <div>
        <h3 class="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-600 dark:text-neutral-400">
          Secondary Variant
        </h3>
        <div class="@lg:grid-cols-2 grid grid-cols-1 gap-6">
          <!-- Thin Border -->
          <Card variant="secondary" border-width="thin">
            <h4 class="mb-2 font-heading text-lg font-bold text-neutral-700 dark:text-neutral-200">
              Secondary Card - Thin Border
            </h4>
            <p class="text-sm text-neutral-600 dark:text-neutral-300">
              This is a secondary card with a thin border. Great for neutral content.
            </p>
          </Card>

          <!-- Thick Border -->
          <Card variant="secondary" border-width="thick">
            <h4 class="mb-2 font-heading text-lg font-bold text-neutral-700 dark:text-neutral-200">
              Secondary Card - Thick Border
            </h4>
            <p class="text-sm text-neutral-600 dark:text-neutral-300">
              This is a secondary card with a thick border. Neutral with more definition.
            </p>
          </Card>
        </div>
      </div>

      <!-- Primary Outline Variant -->
      <div>
        <h3 class="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-600 dark:text-neutral-400">
          Primary Outline Variant
        </h3>
        <div class="@lg:grid-cols-2 grid grid-cols-1 gap-6">
          <!-- Thin Border -->
          <Card variant="primary-outline" border-width="thin">
            <h4 class="mb-2 font-heading text-lg font-bold text-blue-600 dark:text-blue-400">
              Primary Outline - Thin Border
            </h4>
            <p class="text-sm text-neutral-600 dark:text-neutral-300">
              Transparent background with blue border. Clean and minimal design.
            </p>
          </Card>

          <!-- Thick Border -->
          <Card variant="primary-outline" border-width="thick">
            <h4 class="mb-2 font-heading text-lg font-bold text-blue-600 dark:text-blue-400">
              Primary Outline - Thick Border
            </h4>
            <p class="text-sm text-neutral-600 dark:text-neutral-300">
              Transparent background with thick blue border. More prominent outline.
            </p>
          </Card>
        </div>
      </div>

      <!-- Secondary Outline Variant -->
      <div>
        <h3 class="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-600 dark:text-neutral-400">
          Secondary Outline Variant
        </h3>
        <div class="@lg:grid-cols-2 grid grid-cols-1 gap-6">
          <!-- Thin Border -->
          <Card variant="secondary-outline" border-width="thin">
            <h4 class="mb-2 font-heading text-lg font-bold text-neutral-700 dark:text-neutral-200">
              Secondary Outline - Thin Border
            </h4>
            <p class="text-sm text-neutral-600 dark:text-neutral-300">
              Transparent background with neutral border. Subtle and understated.
            </p>
          </Card>

          <!-- Thick Border -->
          <Card variant="secondary-outline" border-width="thick">
            <h4 class="mb-2 font-heading text-lg font-bold text-neutral-700 dark:text-neutral-200">
              Secondary Outline - Thick Border
            </h4>
            <p class="text-sm text-neutral-600 dark:text-neutral-300">
              Transparent background with thick neutral border. Defined edges.
            </p>
          </Card>
        </div>
      </div>

      <!-- Custom Padding Examples -->
      <div>
        <h3 class="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-600 dark:text-neutral-400">
          Custom Padding
        </h3>
        <div class="@lg:grid-cols-3 grid grid-cols-1 gap-6">
          <!-- Small Padding -->
          <Card variant="primary" padding="p-3">
            <h4 class="mb-1 font-heading text-sm font-bold text-neutral-700 dark:text-neutral-200">
              Small Padding (p-3)
            </h4>
            <p class="text-xs text-neutral-600 dark:text-neutral-300">
              Compact card with minimal padding.
            </p>
          </Card>

          <!-- Default Padding -->
          <Card variant="secondary">
            <h4 class="mb-2 font-heading text-base font-bold text-neutral-700 dark:text-neutral-200">
              Default Padding (p-6)
            </h4>
            <p class="text-sm text-neutral-600 dark:text-neutral-300">
              Standard card with default padding.
            </p>
          </Card>

          <!-- Large Padding -->
          <Card variant="primary-outline" padding="p-10">
            <h4 class="mb-3 font-heading text-lg font-bold text-blue-600 dark:text-blue-400">
              Large Padding (p-10)
            </h4>
            <p class="text-sm text-neutral-600 dark:text-neutral-300">
              Spacious card with generous padding.
            </p>
          </Card>
        </div>
      </div>

      <!-- Shadow Effect Examples -->
      <div>
        <h3 class="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-600 dark:text-neutral-400">
          Shadow Effect (Off by Default)
        </h3>
        <div class="@lg:grid-cols-2 grid grid-cols-1 gap-6">
          <!-- Without Shadow (Default) -->
          <Card variant="primary" border-width="thick">
            <h4 class="mb-2 font-heading text-lg font-bold text-neutral-700 dark:text-neutral-200">
              No Shadow (Default)
            </h4>
            <p class="text-sm text-neutral-600 dark:text-neutral-300">
              This card has no shadow effect. The shadow prop is false by default for a flat, clean appearance.
            </p>
          </Card>

          <!-- With Shadow -->
          <Card variant="primary" border-width="thick" :shadow="true">
            <h4 class="mb-2 font-heading text-lg font-bold text-neutral-700 dark:text-neutral-200">
              With Shadow
            </h4>
            <p class="text-sm text-neutral-600 dark:text-neutral-300">
              This card has shadow enabled with :shadow="true". Notice the subtle elevation effect.
            </p>
          </Card>
        </div>
      </div>

      <!-- Complex Content Example -->
      <div>
        <h3 class="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-600 dark:text-neutral-400">
          Complex Content Example
        </h3>
        <div class="@lg:grid-cols-2 grid grid-cols-1 gap-6">
          <Card variant="primary" border-width="thick" :shadow="true">
            <div class="mb-4 flex items-start justify-between">
              <h4 class="font-heading text-xl font-bold text-neutral-700 dark:text-neutral-200">
                Project Dashboard
              </h4>
              <span class="rounded-full bg-blue-500 px-3 py-1 text-xs font-medium text-neutral-50">
                Active
              </span>
            </div>
            <p class="mb-4 text-sm text-neutral-600 dark:text-neutral-300">
              Track your concrete project progress with real-time updates and cost calculations.
            </p>
            <div class="grid grid-cols-3 gap-4 border-t border-neutral-300 pt-4 text-center dark:border-neutral-600">
              <div>
                <p class="font-tight text-2xl font-bold text-neutral-700 dark:text-neutral-200">12</p>
                <p class="text-xs text-neutral-500 dark:text-neutral-400">Projects</p>
              </div>
              <div>
                <p class="font-tight text-2xl font-bold text-neutral-700 dark:text-neutral-200">$45k</p>
                <p class="text-xs text-neutral-500 dark:text-neutral-400">Budget</p>
              </div>
              <div>
                <p class="font-tight text-2xl font-bold text-neutral-700 dark:text-neutral-200">85%</p>
                <p class="text-xs text-neutral-500 dark:text-neutral-400">Complete</p>
              </div>
            </div>
          </Card>

          <Card variant="secondary-outline" border-width="thick">
            <div class="mb-4">
              <h4 class="mb-2 font-heading text-xl font-bold text-neutral-700 dark:text-neutral-200">
                Cost Calculator
              </h4>
              <p class="text-sm text-neutral-600 dark:text-neutral-300">
                Calculate concrete costs for your next project with precision.
              </p>
            </div>
            <div class="space-y-3">
              <div class="flex justify-between rounded-lg bg-neutral-100 p-3 dark:bg-neutral-700">
                <span class="text-sm font-medium text-neutral-700 dark:text-neutral-200">Material Cost</span>
                <span class="text-sm font-bold text-neutral-700 dark:text-neutral-200">$2,500</span>
              </div>
              <div class="flex justify-between rounded-lg bg-neutral-100 p-3 dark:bg-neutral-700">
                <span class="text-sm font-medium text-neutral-700 dark:text-neutral-200">Labor Cost</span>
                <span class="text-sm font-bold text-neutral-700 dark:text-neutral-200">$1,800</span>
              </div>
              <div class="flex justify-between rounded-lg bg-blue-500 p-3 text-neutral-50">
                <span class="text-sm font-bold">Total Cost</span>
                <span class="text-sm font-bold">$4,300</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  </ComponentSection>
</template>

<style scoped>
</style>

