<script setup lang="ts">
/**
 * Toast Container Component
 *
 * Fixed positioned container that renders the global toast queue.
 *
 * Features:
 * - Fixed positioning (bottom-right on desktop, top-center on mobile)
 * - Stacks toasts vertically with gap
 * - Auto-animate enter/exit transitions
 * - Z-index above modals
 * - Consumes useToast composable
 */

import { vAutoAnimate } from '@formkit/auto-animate/vue'

const { toasts, removeToast } = useToast()

// Handle toast close
function handleClose(id: string) {
  removeToast(id)
}
</script>

<template>
  <div
    v-auto-animate
    class="fixed z-50 flex flex-col gap-3 pointer-events-none"
    :class="[
      // Mobile: top-center
      'top-4 left-1/2 -translate-x-1/2',
      // Desktop: bottom-right
      'lg:top-auto lg:bottom-4 lg:right-4 lg:left-auto lg:translate-x-0'
    ]"
  >
    <Toast
      v-for="toast in toasts"
      :key="toast.id"
      :id="toast.id"
      :type="toast.type"
      :title="toast.title"
      :message="toast.message"
      :duration="toast.duration"
      :action="toast.action"
      class="pointer-events-auto"
      @close="handleClose"
    />
  </div>
</template>

