<script setup lang="ts">
import consola from 'consola'

// =====================================================
// PAGE META
// =====================================================

useHead({
  title: 'Login'
})

// =====================================================
// STATE
// =====================================================

const router = useRouter()
const supabase = useSupabaseClient()
const user = useSupabaseUser()

// Redirect path stored via useState (set by auth middlewares)
const redirectAfterLogin = useState<string | null>('auth:redirectAfterLogin', () => null)

const email = ref<string | null>('')
const password = ref<string | null>('')
const isSubmitting = ref(false)
const errorMessage = ref<string | null>(null)

// Default redirect destination
const defaultRedirect = '/admin/pages'

// Determine redirect destination after successful login
const redirectTo = computed(() => {
  const storedRedirect = redirectAfterLogin.value
  if (storedRedirect && storedRedirect.startsWith('/')) {
    return storedRedirect
  }
  return defaultRedirect
})

// If already logged in, redirect to destination
watchEffect(() => {
  if (user.value) {
    const destination = redirectTo.value

    if (import.meta.dev) {
      consola.info('Login page: user already authenticated, redirecting to:', destination)
    }

    // Clear the stored redirect path
    redirectAfterLogin.value = null

    router.replace(destination)
  }
})

// =====================================================
// HANDLERS
// =====================================================

async function handleSubmit() {
  try {
    isSubmitting.value = true
    errorMessage.value = null

    const emailValue = email.value?.trim() || ''
    const passwordValue = password.value || ''

    if (!emailValue || !passwordValue) {
      errorMessage.value = 'Please enter both email and password.'
      return
    }

    if (import.meta.dev) {
      consola.info('Attempting login with email:', emailValue)
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: emailValue,
      password: passwordValue
    })

    if (error) {
      if (import.meta.dev) {
        consola.warn('Login failed:', error.message)
      }
      // Generic error message for security; customize as needed
      errorMessage.value = 'Invalid email or password. Please try again.'
      return
    }

    const destination = redirectTo.value

    if (import.meta.dev) {
      consola.success('Login successful, redirecting to:', destination)
    }

    // Clear the stored redirect path before navigating
    redirectAfterLogin.value = null

    await router.replace(destination)
  } catch (err: any) {
    if (import.meta.dev) {
      consola.error('Unexpected login error:', err)
    }
    errorMessage.value = 'An unexpected error occurred. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-neutral-50 px-4 py-12 dark:bg-neutral-900">
    <div class="mx-auto flex w-full max-w-md flex-col items-center">
      <!-- Card -->
      <form
        class="w-full rounded-2xl border border-neutral-200 bg-white p-6 shadow-lg shadow-neutral-200/60 dark:border-neutral-800 dark:bg-neutral-900/90 dark:shadow-black/40 sm:p-8"
        @submit.prevent="handleSubmit"
      >
        <!-- Heading -->
        <div class="mb-6 text-center">
          <h1 class="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
            Welcome Back
          </h1>
          <p class="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
            Sign in with your credentials below.
          </p>
        </div>

        <!-- Error Message -->
        <div
          v-if="errorMessage"
          class="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-200"
        >
          {{ errorMessage }}
        </div>

        <!-- Email -->
        <div class="mb-4">
          <TextInput
            v-model="email"
            type="email"
            size="md"
            label="Email"
            placeholder="you@example.com"
            :disabled="isSubmitting"
            icon="heroicons:envelope"
          />
        </div>

        <!-- Password -->
        <div class="mb-6">
          <TextInput
            v-model="password"
            type="password"
            size="md"
            label="Password"
            placeholder="Enter your password"
            :disabled="isSubmitting"
            icon="heroicons:lock-closed"
          />
        </div>

        <!-- Submit Button -->
        <div class="flex flex-col gap-3">
          <!-- Hidden native submit for Enter key support -->
          <button type="submit" class="hidden" aria-hidden="true" />

          <Button
            text="Sign In"
            size="md"
            variant="primary"
            :disabled="isSubmitting"
            @click="handleSubmit"
          />

          <p class="text-center text-xs text-neutral-500 dark:text-neutral-400">
            Access is restricted to authorized users. If you need access, please contact the site owner.
          </p>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
</style>

