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

    <!-- Button Components -->
    <ComponentSection
      title="Button Component"
      component-name="Button"
      description="Versatile button component with multiple variants and sizes for all your UI needs"
    >
      <!-- Button Components in 2-Column Grid -->
      <div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <!-- Primary Variant - All Sizes -->
        <div class="rounded-xl border-2 border-neutral-200 bg-neutral-50 p-8 dark:border-neutral-700 dark:bg-neutral-800">
        <h3 class="mb-6 font-heading text-xl font-bold text-neutral-700 dark:text-neutral-200">
          Primary Variant
        </h3>

      <div class="space-y-6">
        <!-- Small -->
        <div>
          <h4 class="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-600 dark:text-neutral-400">
            Small (sm)
          </h4>
          <div class="flex flex-wrap gap-4">
            <Button text="For Contractors" size="sm" variant="primary" />
            <Button text="With Route" size="sm" variant="primary" location="/" />
            <Button text="Disabled" size="sm" variant="primary" :disabled="true" />
          </div>
        </div>

        <!-- Medium -->
        <div>
          <h4 class="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-600 dark:text-neutral-400">
            Medium (md) - Default
          </h4>
          <div class="flex flex-wrap gap-4">
            <Button text="For Contractors" size="md" variant="primary" />
            <Button text="With Route" size="md" variant="primary" location="/" />
            <Button text="Disabled" size="md" variant="primary" :disabled="true" />
          </div>
        </div>

        <!-- Large -->
        <div>
          <h4 class="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-600 dark:text-neutral-400">
            Large (lg)
          </h4>
          <div class="flex flex-wrap gap-4">
            <Button text="For Contractors" size="lg" variant="primary" />
            <Button text="With Route" size="lg" variant="primary" location="/" />
            <Button text="Disabled" size="lg" variant="primary" :disabled="true" />
          </div>
        </div>

        <!-- Extra Large -->
        <div>
          <h4 class="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-600 dark:text-neutral-400">
            Extra Large (xl)
          </h4>
          <div class="flex flex-wrap gap-4">
            <Button text="For Contractors" size="xl" variant="primary" />
            <Button text="With Route" size="xl" variant="primary" location="/" />
            <Button text="Disabled" size="xl" variant="primary" :disabled="true" />
          </div>
        </div>
      </div>
      </div>

      <!-- Primary Outline Variant - All Sizes -->
      <div class="rounded-xl border-2 border-neutral-200 bg-neutral-50 p-8 dark:border-neutral-700 dark:bg-neutral-800">
      <h3 class="mb-6 font-heading text-xl font-bold text-neutral-700 dark:text-neutral-200">
        Primary Outline Variant
      </h3>

      <div class="space-y-6">
        <!-- Small -->
        <div>
          <h4 class="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-600 dark:text-neutral-400">
            Small (sm)
          </h4>
          <div class="flex flex-wrap gap-4">
            <Button text="View Contractors" size="sm" variant="primary-outline" />
            <Button text="With Route" size="sm" variant="primary-outline" location="/" />
            <Button text="Disabled" size="sm" variant="primary-outline" :disabled="true" />
          </div>
        </div>

        <!-- Medium -->
        <div>
          <h4 class="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-600 dark:text-neutral-400">
            Medium (md) - Default
          </h4>
          <div class="flex flex-wrap gap-4">
            <Button text="View Contractors" size="md" variant="primary-outline" />
            <Button text="With Route" size="md" variant="primary-outline" location="/" />
            <Button text="Disabled" size="md" variant="primary-outline" :disabled="true" />
          </div>
        </div>

        <!-- Large -->
        <div>
          <h4 class="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-600 dark:text-neutral-400">
            Large (lg)
          </h4>
          <div class="flex flex-wrap gap-4">
            <Button text="View Contractors" size="lg" variant="primary-outline" />
            <Button text="With Route" size="lg" variant="primary-outline" location="/" />
            <Button text="Disabled" size="lg" variant="primary-outline" :disabled="true" />
          </div>
        </div>

        <!-- Extra Large -->
        <div>
          <h4 class="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-600 dark:text-neutral-400">
            Extra Large (xl)
          </h4>
          <div class="flex flex-wrap gap-4">
            <Button text="View Contractors" size="xl" variant="primary-outline" />
            <Button text="With Route" size="xl" variant="primary-outline" location="/" />
            <Button text="Disabled" size="xl" variant="primary-outline" :disabled="true" />
          </div>
        </div>
      </div>
      </div>

      <!-- Secondary Variant - All Sizes -->
      <div class="rounded-xl border-2 border-neutral-200 bg-neutral-50 p-8 dark:border-neutral-700 dark:bg-neutral-800">
      <h3 class="mb-6 font-heading text-xl font-bold text-neutral-700 dark:text-neutral-200">
        Secondary Variant
      </h3>

      <div class="space-y-6">
        <!-- Small -->
        <div>
          <h4 class="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-600 dark:text-neutral-400">
            Small (sm)
          </h4>
          <div class="flex flex-wrap gap-4">
            <Button text="Learn More" size="sm" variant="secondary" />
            <Button text="With Route" size="sm" variant="secondary" location="/" />
            <Button text="Disabled" size="sm" variant="secondary" :disabled="true" />
          </div>
        </div>

        <!-- Medium -->
        <div>
          <h4 class="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-600 dark:text-neutral-400">
            Medium (md) - Default
          </h4>
          <div class="flex flex-wrap gap-4">
            <Button text="Learn More" size="md" variant="secondary" />
            <Button text="With Route" size="md" variant="secondary" location="/" />
            <Button text="Disabled" size="md" variant="secondary" :disabled="true" />
          </div>
        </div>

        <!-- Large -->
        <div>
          <h4 class="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-600 dark:text-neutral-400">
            Large (lg)
          </h4>
          <div class="flex flex-wrap gap-4">
            <Button text="Learn More" size="lg" variant="secondary" />
            <Button text="With Route" size="lg" variant="secondary" location="/" />
            <Button text="Disabled" size="lg" variant="secondary" :disabled="true" />
          </div>
        </div>

        <!-- Extra Large -->
        <div>
          <h4 class="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-600 dark:text-neutral-400">
            Extra Large (xl)
          </h4>
          <div class="flex flex-wrap gap-4">
            <Button text="Learn More" size="xl" variant="secondary" />
            <Button text="With Route" size="xl" variant="secondary" location="/" />
            <Button text="Disabled" size="xl" variant="secondary" :disabled="true" />
          </div>
        </div>
      </div>
      </div>

      <!-- Secondary Outline Variant - All Sizes -->
      <div class="rounded-xl border-2 border-neutral-200 bg-neutral-50 p-8 dark:border-neutral-700 dark:bg-neutral-800">
      <h3 class="mb-6 font-heading text-xl font-bold text-neutral-700 dark:text-neutral-200">
        Secondary Outline Variant
      </h3>

      <div class="space-y-6">
        <!-- Small -->
        <div>
          <h4 class="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-600 dark:text-neutral-400">
            Small (sm)
          </h4>
          <div class="flex flex-wrap gap-4">
            <Button text="Learn More" size="sm" variant="secondary-outline" />
            <Button text="With Route" size="sm" variant="secondary-outline" location="/" />
            <Button text="Disabled" size="sm" variant="secondary-outline" :disabled="true" />
          </div>
        </div>

        <!-- Medium -->
        <div>
          <h4 class="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-600 dark:text-neutral-400">
            Medium (md) - Default
          </h4>
          <div class="flex flex-wrap gap-4">
            <Button text="Learn More" size="md" variant="secondary-outline" />
            <Button text="With Route" size="md" variant="secondary-outline" location="/" />
            <Button text="Disabled" size="md" variant="secondary-outline" :disabled="true" />
          </div>
        </div>

        <!-- Large -->
        <div>
          <h4 class="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-600 dark:text-neutral-400">
            Large (lg)
          </h4>
          <div class="flex flex-wrap gap-4">
            <Button text="Learn More" size="lg" variant="secondary-outline" />
            <Button text="With Route" size="lg" variant="secondary-outline" location="/" />
            <Button text="Disabled" size="lg" variant="secondary-outline" :disabled="true" />
          </div>
        </div>

        <!-- Extra Large -->
        <div>
          <h4 class="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-600 dark:text-neutral-400">
            Extra Large (xl)
          </h4>
          <div class="flex flex-wrap gap-4">
            <Button text="Learn More" size="xl" variant="secondary-outline" />
            <Button text="With Route" size="xl" variant="secondary-outline" location="/" />
            <Button text="Disabled" size="xl" variant="secondary-outline" :disabled="true" />
          </div>
        </div>
      </div>
      </div>
      </div>
    </ComponentSection>

    <!-- Popover Component -->
    <ComponentSection
      title="Popover Component"
      component-name="Popover"
      description="Floating content panel that appears on trigger interaction"
    >
      <div class="space-y-8">
        <!-- Basic Popover -->
        <div>
          <h3 class="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-600 dark:text-neutral-400">
            Basic Popover
          </h3>
          <div class="flex flex-wrap gap-4">
            <Popover trigger-text="Open Popover">
              <div class="space-y-3">
                <h4 class="font-heading text-lg font-bold text-neutral-700 dark:text-neutral-200">
                  Popover Title
                </h4>
                <p class="text-sm text-neutral-600 dark:text-neutral-300">
                  This is a basic popover with some content inside. You can put any content here.
                </p>
              </div>
            </Popover>
          </div>
        </div>

        <!-- Different Sides -->
        <div>
          <h3 class="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-600 dark:text-neutral-400">
            Different Sides
          </h3>
          <div class="flex flex-wrap gap-4">
            <Popover trigger-text="Top" side="top">
              <p class="text-sm text-neutral-600 dark:text-neutral-300">Popover on top</p>
            </Popover>
            <Popover trigger-text="Right" side="right">
              <p class="text-sm text-neutral-600 dark:text-neutral-300">Popover on right</p>
            </Popover>
            <Popover trigger-text="Bottom" side="bottom">
              <p class="text-sm text-neutral-600 dark:text-neutral-300">Popover on bottom</p>
            </Popover>
            <Popover trigger-text="Left" side="left">
              <p class="text-sm text-neutral-600 dark:text-neutral-300">Popover on left</p>
            </Popover>
          </div>
        </div>

        <!-- Different Alignments -->
        <div>
          <h3 class="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-600 dark:text-neutral-400">
            Different Alignments
          </h3>
          <div class="flex flex-wrap gap-4">
            <Popover trigger-text="Start Align" align="start">
              <p class="text-sm text-neutral-600 dark:text-neutral-300">Aligned to start</p>
            </Popover>
            <Popover trigger-text="Center Align" align="center">
              <p class="text-sm text-neutral-600 dark:text-neutral-300">Aligned to center</p>
            </Popover>
            <Popover trigger-text="End Align" align="end">
              <p class="text-sm text-neutral-600 dark:text-neutral-300">Aligned to end</p>
            </Popover>
          </div>
        </div>

        <!-- Without Arrow -->
        <div>
          <h3 class="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-600 dark:text-neutral-400">
            Without Arrow
          </h3>
          <div class="flex flex-wrap gap-4">
            <Popover trigger-text="No Arrow" :show-arrow="false">
              <p class="text-sm text-neutral-600 dark:text-neutral-300">This popover has no arrow</p>
            </Popover>
          </div>
        </div>

        <!-- Custom Width -->
        <div>
          <h3 class="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-600 dark:text-neutral-400">
            Custom Width
          </h3>
          <div class="flex flex-wrap gap-4">
            <Popover trigger-text="Wide Popover" width="400px">
              <div class="space-y-3">
                <h4 class="font-heading text-lg font-bold text-neutral-700 dark:text-neutral-200">
                  Wide Popover
                </h4>
                <p class="text-sm text-neutral-600 dark:text-neutral-300">
                  This popover has a custom width of 400px. You can set any width you need for your content.
                </p>
              </div>
            </Popover>
          </div>
        </div>

        <!-- Custom Trigger -->
        <div>
          <h3 class="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-600 dark:text-neutral-400">
            Custom Trigger
          </h3>
          <div class="flex flex-wrap gap-4">
            <Popover>
              <template #trigger>
                <Button text="Custom Trigger Button" variant="secondary" />
              </template>
              <div class="space-y-3">
                <h4 class="font-heading text-lg font-bold text-neutral-700 dark:text-neutral-200">
                  Custom Trigger
                </h4>
                <p class="text-sm text-neutral-600 dark:text-neutral-300">
                  You can use any component as a trigger by using the trigger slot.
                </p>
              </div>
            </Popover>
          </div>
        </div>
      </div>
    </ComponentSection>

    <!-- Dialog Component -->
    <ComponentSection
      title="Dialog Component"
      component-name="Dialog"
      description="Modal dialog with customizable content, sizes, and behavior"
    >

      <div class="space-y-8">
        <!-- Basic Dialog -->
        <div>
          <h3 class="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-600 dark:text-neutral-400">
            Basic Dialog
          </h3>
          <div class="flex flex-wrap gap-4">
            <Dialog
              trigger-text="Open Dialog"
              title="Welcome"
              description="This is a basic dialog with title and description."
            >
              <div class="space-y-3">
                <p class="text-sm text-neutral-600 dark:text-neutral-400">
                  This is the main content area of the dialog. You can put any content here including forms, images, or other components.
                </p>
                <p class="text-sm text-neutral-600 dark:text-neutral-400">
                  The dialog will close when you click the X button, press Escape, or click outside the dialog.
                </p>
              </div>
            </Dialog>
          </div>
        </div>

        <!-- Different Sizes -->
        <div>
          <h3 class="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-600 dark:text-neutral-400">
            Different Sizes
          </h3>
          <div class="flex flex-wrap gap-4">
            <Dialog
              trigger-text="Small"
              size="sm"
              title="Small Dialog"
              description="This is a small dialog (max-w-sm)"
            >
              <p class="text-sm text-neutral-600 dark:text-neutral-400">
                Small dialog content
              </p>
            </Dialog>

            <Dialog
              trigger-text="Medium (Default)"
              size="md"
              title="Medium Dialog"
              description="This is a medium dialog (max-w-md)"
            >
              <p class="text-sm text-neutral-600 dark:text-neutral-400">
                Medium dialog content
              </p>
            </Dialog>

            <Dialog
              trigger-text="Large"
              size="lg"
              title="Large Dialog"
              description="This is a large dialog (max-w-lg)"
            >
              <p class="text-sm text-neutral-600 dark:text-neutral-400">
                Large dialog content
              </p>
            </Dialog>

            <Dialog
              trigger-text="Extra Large"
              size="xl"
              title="Extra Large Dialog"
              description="This is an extra large dialog (max-w-xl)"
            >
              <p class="text-sm text-neutral-600 dark:text-neutral-400">
                Extra large dialog content
              </p>
            </Dialog>

            <Dialog
              trigger-text="Full Width"
              size="full"
              title="Full Width Dialog"
              description="This dialog takes up the full width with margins"
            >
              <p class="text-sm text-neutral-600 dark:text-neutral-400">
                Full width dialog content
              </p>
            </Dialog>
          </div>
        </div>

        <!-- Custom Trigger -->
        <div>
          <h3 class="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-600 dark:text-neutral-400">
            Custom Trigger
          </h3>
          <div class="flex flex-wrap gap-4">
            <Dialog
              title="Settings"
              description="Manage your account settings and preferences."
            >
              <template #trigger>
                <Button text="Open Settings" variant="secondary" />
              </template>
              <div class="space-y-4">
                <div>
                  <label class="mb-1 block text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    class="w-full rounded-lg border-2 border-neutral-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800"
                  >
                </div>
                <div>
                  <label class="mb-1 block text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                    Username
                  </label>
                  <input
                    type="text"
                    placeholder="username"
                    class="w-full rounded-lg border-2 border-neutral-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800"
                  >
                </div>
              </div>
            </Dialog>
          </div>
        </div>

        <!-- With Footer Actions -->
        <div>
          <h3 class="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-600 dark:text-neutral-400">
            With Footer Actions
          </h3>
          <div class="flex flex-wrap gap-4">
            <Dialog
              trigger-text="Confirm Action"
              title="Delete Account"
              description="Are you sure you want to delete your account? This action cannot be undone."
            >
              <template #default>
                <div class="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
                  <p class="text-sm font-semibold text-red-700 dark:text-red-400">
                    Warning: This is a destructive action!
                  </p>
                  <p class="mt-2 text-sm text-red-600 dark:text-red-300">
                    All your data will be permanently deleted and cannot be recovered.
                  </p>
                </div>
              </template>
              <template #footer>
                <Button text="Cancel" variant="secondary-outline" size="sm" />
                <Button text="Delete Account" variant="primary" size="sm" />
              </template>
            </Dialog>
          </div>
        </div>

        <!-- Custom Slots -->
        <div>
          <h3 class="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-600 dark:text-neutral-400">
            Custom Title & Description Slots
          </h3>
          <div class="flex flex-wrap gap-4">
            <Dialog trigger-text="Custom Slots">
              <template #title>
                <div class="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="text-blue-500"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                  <span>Important Information</span>
                </div>
              </template>
              <template #description>
                <div class="flex items-start gap-2">
                  <span class="text-sm italic">
                    This dialog uses custom slots for title and description with icons and styling.
                  </span>
                </div>
              </template>
              <p class="text-sm text-neutral-600 dark:text-neutral-400">
                You can customize the title and description using slots to add icons, badges, or any other content.
              </p>
            </Dialog>
          </div>
        </div>

        <!-- Without Overlay Click to Close -->
        <div>
          <h3 class="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-600 dark:text-neutral-400">
            Prevent Close on Overlay Click
          </h3>
          <div class="flex flex-wrap gap-4">
            <Dialog
              trigger-text="Modal Dialog"
              title="Important Form"
              description="This dialog won't close when clicking outside."
              :close-on-overlay-click="false"
            >
              <p class="text-sm text-neutral-600 dark:text-neutral-400">
                You must use the close button or press Escape to close this dialog.
                Clicking outside won't work.
              </p>
            </Dialog>
          </div>
        </div>

        <!-- Without Close Button -->
        <div>
          <h3 class="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-600 dark:text-neutral-400">
            Without Close Button
          </h3>
          <div class="flex flex-wrap gap-4">
            <Dialog
              trigger-text="No Close Button"
              title="Custom Close"
              description="This dialog has no X button."
              :show-close-button="false"
            >
              <template #default>
                <p class="mb-4 text-sm text-neutral-600 dark:text-neutral-400">
                  You can provide your own close mechanism in the content or footer.
                </p>
              </template>
              <template #footer>
                <Button text="Close Dialog" variant="primary" size="sm" />
              </template>
            </Dialog>
          </div>
        </div>
      </div>
    </ComponentSection>

    <!-- Card Component -->
    <ComponentSection
      title="Card Component"
      component-name="Card"
      description="Flexible card container with multiple variants and customizable border widths"
    >
      <div class="space-y-8">
        <!-- Primary Variant -->
        <div>
          <h3 class="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-600 dark:text-neutral-400">
            Primary Variant
          </h3>
          <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
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
          <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
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
          <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
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
          <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
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
          <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
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
          <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
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
          <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
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
  </div>
</template>

<style scoped>
</style>

