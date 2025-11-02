<script setup lang="ts">
// Footer component for the application
// Features logo, quick links, social icons, and copyright section
// Background: #00174c (dark navy blue)

// Navigation links
const quickLinks = [
  { text: 'Home', to: '/' },
  { text: 'Find a Contractor', to: '/' },
  { text: 'About', to: '/' },
  { text: 'Articles', to: '/' }
]

// Social media links
const socialLinks = [
  { name: 'X (Twitter)', icon: 'mdi:twitter', to: '/', ariaLabel: 'Follow us on X (Twitter)' },
  { name: 'Facebook', icon: 'mdi:facebook', to: '/', ariaLabel: 'Follow us on Facebook' },
  { name: 'Instagram', icon: 'mdi:instagram', to: '/', ariaLabel: 'Follow us on Instagram' },
  { name: 'LinkedIn', icon: 'mdi:linkedin', to: '/', ariaLabel: 'Follow us on LinkedIn' }
]

// Legal links
const legalLinks = [
  { text: 'Privacy Policy', to: '/' },
  { text: 'Terms & Conditions', to: '/' }
]

// Current year for copyright
const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="w-full" style="background-color: #00174c;">
    <div class="mx-auto max-w-8xl px-4 py-12 sm:px-6 lg:px-8">
      <!-- Top Section: Logo on left, Quick Links + Social on right -->
      <div class="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
        <!-- Logo Section -->
        <div class="flex flex-col items-start">
          <NuxtLink to="/" class="transition-opacity hover:opacity-80">
            <img
              src="/images/logo-light.webp"
              alt="Cost of Concrete"
              class="h-12 w-auto brightness-0 invert"
              style="filter: brightness(0) invert(1);"
            />
          </NuxtLink>
        </div>

        <!-- Right Side: Quick Links + Social -->
        <div class="flex flex-col gap-8 sm:flex-row sm:gap-16 md:gap-20 lg:gap-24">
          <!-- Quick Links Section -->
          <div>
            <h3 class="mb-4 font-heading text-lg font-semibold text-white">
              Quick Links
            </h3>
            <nav>
              <ul class="space-y-3">
                <li v-for="link in quickLinks" :key="link.text">
                  <NuxtLink
                    :to="link.to"
                    class="text-neutral-300 transition-colors hover:text-white"
                  >
                    {{ link.text }}
                  </NuxtLink>
                </li>
              </ul>
            </nav>
          </div>

          <!-- Social Section -->
          <div>
            <h3 class="mb-4 font-heading text-lg font-semibold text-white">
              Social
            </h3>
            <div class="flex gap-4">
              <NuxtLink
                v-for="social in socialLinks"
                :key="social.name"
                :to="social.to"
                :aria-label="social.ariaLabel"
                class="text-neutral-300 transition-colors hover:text-white"
              >
                <Icon :name="social.icon" class="h-6 w-6" />
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>

      <!-- Divider -->
      <div class="my-8 border-t border-white/20"></div>

      <!-- Bottom Section: Copyright & Legal Links -->
      <div class="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <!-- Copyright -->
        <p class="text-sm text-neutral-300">
          © {{ currentYear }} Cost of Concrete. All rights reserved.
        </p>

        <!-- Legal Links -->
        <div class="flex gap-6">
          <NuxtLink
            v-for="link in legalLinks"
            :key="link.text"
            :to="link.to"
            class="text-sm text-neutral-300 transition-colors hover:text-white"
          >
            {{ link.text }}
          </NuxtLink>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
</style>

