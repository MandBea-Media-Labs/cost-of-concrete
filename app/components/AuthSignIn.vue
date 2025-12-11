<script setup lang="ts">
import consola from 'consola'
import { Icon } from '#components'

const router = useRouter()
const supabase = useSupabaseClient()
const user = useSupabaseUser()

// Redirect path stored via useState (set by auth middlewares)
const redirectAfterLogin = useState<string | null>('auth:redirectAfterLogin', () => null)

const email = ref('')
const password = ref('')
const isLoading = ref(false)
const errorMessage = ref<string | null>(null)
const isRedirecting = ref(false)

// Default redirect destination
const defaultRedirect = '/admin'

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
  if (user.value && !isRedirecting.value) {
    const destination = redirectTo.value

    if (import.meta.dev) {
      consola.info('Login page: user already authenticated, redirecting to:', destination)
    }

    redirectAfterLogin.value = null
    router.replace(destination)
  }
})

async function onSubmit(event: Event) {
  event.preventDefault()

  try {
    isLoading.value = true
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
      errorMessage.value = 'Invalid email or password. Please try again.'
      return
    }

    // Invalidate the middleware's cached auth state to force re-fetch on next navigation
    const authUserState = useState<any | null | undefined>('admin-auth:user', () => undefined)
    const isAdminState = useState<boolean | undefined>('admin-auth:isAdmin', () => undefined)
    const accountStatusState = useState<string | null | undefined>('admin-auth:status', () => undefined)
    authUserState.value = undefined
    isAdminState.value = undefined
    accountStatusState.value = undefined

    const destination = redirectTo.value

    if (import.meta.dev) {
      consola.success('Login successful, redirecting to:', destination)
    }

    redirectAfterLogin.value = null
    isRedirecting.value = true

    await router.replace(destination)
  } catch (err: any) {
    if (import.meta.dev) {
      consola.error('Unexpected login error:', err)
    }
    errorMessage.value = 'An unexpected error occurred. Please try again.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="grid gap-6">
    <!-- Google Sign In Button (Placeholder) -->
    <Button
      text="Login with Google"
      type="button"
      size="md"
      variant="secondary-outline"
      :disabled="true"
      icon="logos:google-icon"
    />

    <!-- Divider -->
    <div class="relative">
      <div class="absolute inset-0 flex items-center">
        <span class="w-full border-t border-neutral-200 dark:border-neutral-700" />
      </div>
      <div class="relative flex justify-center text-xs uppercase">
        <span class="bg-white dark:bg-zinc-900 px-2 text-neutral-500 dark:text-neutral-400">
          Or continue with
        </span>
      </div>
    </div>

    <!-- Error Message -->
    <div
      v-if="errorMessage"
      class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-200"
    >
      {{ errorMessage }}
    </div>

    <!-- Email/Password Form -->
    <form class="grid gap-4" @submit="onSubmit">
      <TextInput
        v-model="email"
        type="email"
        size="md"
        label="Email"
        placeholder="you@example.com"
        :disabled="isLoading"
        icon="heroicons:envelope"
      />

      <div class="grid gap-2">
        <div class="flex items-center justify-between">
          <label class="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Password
          </label>
          <NuxtLink
            to="#"
            class="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 underline"
          >
            Forgot your password?
          </NuxtLink>
        </div>
        <PasswordInput
          v-model="password"
          size="md"
          placeholder="Enter your password"
          :disabled="isLoading"
          icon="heroicons:lock-closed"
        />
      </div>

      <Button
        :text="isLoading ? 'Signing in...' : 'Sign In'"
        type="submit"
        size="md"
        variant="primary"
        :disabled="isLoading"
        :loading="isLoading"
      />
    </form>

    <!-- Sign Up Link -->
    <div class="text-center text-sm text-neutral-600 dark:text-neutral-400">
      Don't have an account?
      <NuxtLink
        to="#"
        class="text-blue-600 dark:text-blue-400 underline font-medium"
      >
        Sign up
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped>

</style>

