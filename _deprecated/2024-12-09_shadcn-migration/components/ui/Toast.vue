<script setup lang="ts">
/**
 * Toast Component
 *
 * Individual toast notification with auto-dismiss timer and progress bar.
 *
 * Features:
 * - 4 types: success (green), error (red), warning (yellow), info (blue)
 * - Auto-dismiss with configurable duration
 * - Progress bar showing remaining time
 * - Manual close button
 * - Slide-in animation
 * - Dark mode support
 * - Accessible (ARIA labels)
 */

import { ref, onMounted, computed } from 'vue'
import type { ToastAction } from '~/composables/useToast'

interface Props {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
  action?: ToastAction
}

const props = withDefaults(defineProps<Props>(), {
  duration: 5000
})

interface Emits {
  (e: 'close', id: string): void
}

const emit = defineEmits<Emits>()

// Progress bar state
const progress = ref(100)
let progressInterval: NodeJS.Timeout | null = null
let autoCloseTimeout: NodeJS.Timeout | null = null

// Type-specific styling
const typeConfig = computed(() => {
  switch (props.type) {
    case 'success':
      return {
        bgClass: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
        iconClass: 'text-green-600 dark:text-green-400',
        iconName: 'heroicons:check-circle',
        progressClass: 'bg-green-500 dark:bg-green-400'
      }
    case 'error':
      return {
        bgClass: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
        iconClass: 'text-red-600 dark:text-red-400',
        iconName: 'heroicons:x-circle',
        progressClass: 'bg-red-500 dark:bg-red-400'
      }
    case 'warning':
      return {
        bgClass: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
        iconClass: 'text-yellow-600 dark:text-yellow-400',
        iconName: 'heroicons:exclamation-triangle',
        progressClass: 'bg-yellow-500 dark:bg-yellow-400'
      }
    case 'info':
      return {
        bgClass: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
        iconClass: 'text-blue-600 dark:text-blue-400',
        iconName: 'heroicons:information-circle',
        progressClass: 'bg-blue-500 dark:bg-blue-400'
      }
  }
})

// Start auto-dismiss timer
onMounted(() => {
  if (props.duration && props.duration > 0) {
    // Update progress bar every 50ms
    const updateInterval = 50
    const steps = props.duration / updateInterval
    const decrement = 100 / steps

    progressInterval = setInterval(() => {
      progress.value = Math.max(0, progress.value - decrement)
    }, updateInterval)

    // Auto-close after duration
    autoCloseTimeout = setTimeout(() => {
      handleClose()
    }, props.duration)
  }
})

// Cleanup timers
onBeforeUnmount(() => {
  if (progressInterval) clearInterval(progressInterval)
  if (autoCloseTimeout) clearTimeout(autoCloseTimeout)
})

// Handle close
function handleClose() {
  emit('close', props.id)
}

// Handle action click
function handleActionClick() {
  if (props.action) {
    props.action.onClick()
    handleClose()
  }
}
</script>

<template>
  <div
    :class="[
      'relative overflow-hidden rounded-lg border shadow-lg',
      'min-w-[320px] max-w-md',
      'animate-in slide-in-from-right duration-300',
      typeConfig.bgClass
    ]"
    role="alert"
    :aria-live="type === 'error' ? 'assertive' : 'polite'"
  >
    <!-- Main Content -->
    <div class="p-4">
      <div class="flex items-start gap-3">
        <!-- Icon -->
        <Icon
          :name="typeConfig.iconName"
          :class="['h-5 w-5 flex-shrink-0 mt-0.5', typeConfig.iconClass]"
        />

        <!-- Text Content -->
        <div class="flex-1 min-w-0">
          <p class="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            {{ title }}
          </p>
          <p
            v-if="message"
            class="mt-1 text-sm text-neutral-600 dark:text-neutral-400"
          >
            {{ message }}
          </p>

          <!-- Action Button -->
          <button
            v-if="action"
            type="button"
            class="mt-2 text-sm font-medium underline hover:no-underline"
            :class="typeConfig.iconClass"
            @click="handleActionClick"
          >
            {{ action.label }}
          </button>
        </div>

        <!-- Close Button -->
        <button
          type="button"
          class="flex-shrink-0 rounded-md p-1 hover:bg-neutral-200/50 dark:hover:bg-neutral-700/50 transition-colors"
          @click="handleClose"
          aria-label="Close notification"
        >
          <Icon
            name="heroicons:x-mark"
            class="h-4 w-4 text-neutral-500 dark:text-neutral-400"
          />
        </button>
      </div>
    </div>

    <!-- Progress Bar -->
    <div
      v-if="duration && duration > 0"
      class="h-1 bg-neutral-200 dark:bg-neutral-700"
    >
      <div
        :class="['h-full transition-all duration-50 ease-linear', typeConfig.progressClass]"
        :style="{ width: `${progress}%` }"
      />
    </div>
  </div>
</template>

