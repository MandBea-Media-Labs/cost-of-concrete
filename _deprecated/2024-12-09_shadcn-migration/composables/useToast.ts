/**
 * Toast Notification Composable
 *
 * Global state management for toast notifications across the application.
 *
 * Features:
 * - Queue management with max 3 toasts
 * - Auto-dismiss with configurable duration (default: 5000ms)
 * - 4 toast types: success, error, warning, info
 * - Optional action button
 * - SSR-compatible using useState
 *
 * @example
 * ```ts
 * const toast = useToast()
 *
 * // Simple usage
 * toast.success('Page created successfully!')
 * toast.error('Failed to save page')
 *
 * // With options
 * toast.success('Page published!', {
 *   duration: 3000,
 *   action: {
 *     label: 'View',
 *     onClick: () => router.push('/page-url')
 *   }
 * })
 * ```
 */

export interface ToastAction {
  label: string
  onClick: () => void
}

export interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
  action?: ToastAction
}

export interface ToastOptions {
  message?: string
  duration?: number
  action?: ToastAction
}

const MAX_TOASTS = 3
const DEFAULT_DURATION = 5000

export function useToast() {
  // Global toast queue (SSR-compatible)
  const toasts = useState<Toast[]>('toast-queue', () => [])

  /**
   * Add a toast to the queue
   */
  function addToast(toast: Toast) {
    // If queue is full, remove the oldest toast
    if (toasts.value.length >= MAX_TOASTS) {
      toasts.value.shift()
    }

    // Add new toast
    toasts.value.push(toast)

    if (import.meta.dev) {
      console.log('[useToast] Toast added:', toast)
    }
  }

  /**
   * Remove a toast by ID
   */
  function removeToast(id: string) {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index !== -1) {
      toasts.value.splice(index, 1)

      if (import.meta.dev) {
        console.log('[useToast] Toast removed:', id)
      }
    }
  }

  /**
   * Show a success toast
   */
  function success(title: string, options: ToastOptions = {}) {
    const toast: Toast = {
      id: crypto.randomUUID(),
      type: 'success',
      title,
      message: options.message,
      duration: options.duration ?? DEFAULT_DURATION,
      action: options.action
    }
    addToast(toast)
  }

  /**
   * Show an error toast
   */
  function error(title: string, options: ToastOptions = {}) {
    const toast: Toast = {
      id: crypto.randomUUID(),
      type: 'error',
      title,
      message: options.message,
      duration: options.duration ?? DEFAULT_DURATION,
      action: options.action
    }
    addToast(toast)
  }

  /**
   * Show a warning toast
   */
  function warning(title: string, options: ToastOptions = {}) {
    const toast: Toast = {
      id: crypto.randomUUID(),
      type: 'warning',
      title,
      message: options.message,
      duration: options.duration ?? DEFAULT_DURATION,
      action: options.action
    }
    addToast(toast)
  }

  /**
   * Show an info toast
   */
  function info(title: string, options: ToastOptions = {}) {
    const toast: Toast = {
      id: crypto.randomUUID(),
      type: 'info',
      title,
      message: options.message,
      duration: options.duration ?? DEFAULT_DURATION,
      action: options.action
    }
    addToast(toast)
  }

  /**
   * Clear all toasts
   */
  function clearAll() {
    toasts.value = []

    if (import.meta.dev) {
      console.log('[useToast] All toasts cleared')
    }
  }

  return {
    toasts: readonly(toasts),
    success,
    error,
    warning,
    info,
    removeToast,
    clearAll
  }
}

