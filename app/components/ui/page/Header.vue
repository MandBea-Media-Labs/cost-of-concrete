<script setup lang="ts">
// Header component for the application
// Handles desktop and mobile navigation with responsive design
// Auto-imports: ref, computed, onMounted, onUnmounted, useColorMode (from Nuxt)

// Color mode
const colorMode = useColorMode()

// Mobile menu state
const isMobileMenuOpen = ref(false)

// Track if component is mounted (for SSR)
const isMounted = ref(false)

// Computed: Logo source based on color mode
const logoSrc = computed(() => {
  if (!isMounted.value) return '/images/logo-light.webp' // SSR fallback
  return colorMode.value === 'dark' ? '/images/logo-dark.webp' : '/images/logo-light.webp'
})

// Open mobile menu
const openMobileMenu = () => {
  isMobileMenuOpen.value = true
  // Lock body scroll on client side only
  if (import.meta.client) {
    document.body.style.overflow = 'hidden'
  }
}

// Close mobile menu
const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
  // Unlock body scroll on client side only
  if (import.meta.client) {
    document.body.style.overflow = ''
  }
}

// Handle ESC key to close menu
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isMobileMenuOpen.value) {
    closeMobileMenu()
  }
}

// Add/remove keyboard event listener
onMounted(() => {
  isMounted.value = true
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  // Ensure scroll is unlocked when component unmounts
  if (import.meta.client) {
    document.body.style.overflow = ''
  }
})
</script>

<template>
  <header class="border-b border-neutral-200 bg-neutral-50 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
    <div class="mx-auto max-w-8xl px-4 py-4 sm:px-6 lg:px-8">
      <!-- Desktop & Mobile Header -->
      <div class="flex items-center justify-between gap-4">
        <!-- Logo (Left) -->
        <NuxtLink to="/" class="flex-shrink-0 transition-opacity hover:opacity-80">
          <img
            :src="logoSrc"
            alt="Cost of Concrete"
            class="h-11 w-auto"
          />
        </NuxtLink>

        <!-- Desktop Navigation (Center & Right) - Hidden on mobile -->
        <div class="hidden flex-1 items-center justify-between gap-6 md:flex">
          <!-- Center: SearchInput -->
          <div class="mx-auto w-full max-w-md">
            <SearchInput
              placeholder="Type a city, state or zip code.."
              variant="secondary-light-outline"
              size="md"
            />
          </div>

          <!-- Right: Auth Buttons -->
          <div class="flex flex-shrink-0 items-center gap-3">
            <Button
              text="Login"
              variant="primary"
              size="md"
            />
            <Button
              text="Sign Up"
              variant="primary-outline"
              size="md"
            />
          </div>
        </div>

        <!-- Mobile: Hamburger Menu Button - Visible only on mobile -->
        <button
          @click="openMobileMenu"
          class="flex-shrink-0 rounded-lg p-2 text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-blue-500 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-blue-400 md:hidden"
          aria-label="Open menu"
        >
          <Icon name="heroicons:bars-3" class="h-6 w-6" />
        </button>
      </div>
    </div>

    <!-- Mobile Menu Backdrop -->
    <Transition
      enter-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-300"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isMobileMenuOpen"
        @click="closeMobileMenu"
        class="fixed inset-0 z-40 bg-neutral-900/50 backdrop-blur-sm dark:bg-neutral-950/70 md:hidden"
        aria-hidden="true"
      />
    </Transition>

    <!-- Mobile Menu Slide-out Panel -->
    <Transition
      enter-active-class="transition-transform duration-300 ease-out"
      enter-from-class="translate-x-full"
      enter-to-class="translate-x-0"
      leave-active-class="transition-transform duration-300 ease-in"
      leave-from-class="translate-x-0"
      leave-to-class="translate-x-full"
    >
      <div
        v-if="isMobileMenuOpen"
        class="fixed right-0 top-0 z-50 h-full w-80 max-w-[85vw] overflow-y-auto bg-neutral-50 shadow-2xl dark:bg-neutral-900 md:hidden"
      >
        <!-- Mobile Menu Header -->
        <div class="flex items-center justify-between border-b border-neutral-200 p-4 dark:border-neutral-700">
          <h2 class="font-heading text-xl font-bold text-neutral-700 dark:text-neutral-100">
            Menu
          </h2>
          <button
            @click="closeMobileMenu"
            class="rounded-lg p-2 text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-red-500 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-red-400"
            aria-label="Close menu"
          >
            <Icon name="heroicons:x-mark" class="h-6 w-6" />
          </button>
        </div>

        <!-- Mobile Menu Content -->
        <div class="flex flex-col gap-6 p-6">
          <!-- SearchInput -->
          <div>
            <SearchInput
              placeholder="Type a city, state or zip code.."
              variant="secondary-light-outline"
              size="sm"
            />
          </div>

          <!-- Divider -->
          <Divider />

          <!-- Auth Buttons -->
          <div class="flex flex-col gap-3">
            <Button
              text="Login"
              variant="primary"
              size="lg"
            />
            <Button
              text="Sign Up"
              variant="primary-outline"
              size="lg"
            />
          </div>
        </div>
      </div>
    </Transition>
  </header>
</template>

<style scoped>
</style>

