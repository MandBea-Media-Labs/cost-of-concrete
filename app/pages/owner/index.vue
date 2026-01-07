<script setup lang="ts">
/**
 * Owner Dashboard
 *
 * Lists all businesses claimed by the current user with links to edit.
 */

definePageMeta({
  layout: 'owner'
})

useSeoMeta({
  title: 'My Businesses | Cost of Concrete',
  robots: 'noindex, nofollow'
})

import { useClipboard } from '@vueuse/core'
import { getStateByCode } from '~/utils/usStates'

interface Contractor {
  id: string
  companyName: string
  slug: string
  description: string | null
  phone: string | null
  email: string | null
  rating: number | null
  reviewCount: number | null
  status: string
  claimedAt: string | null
  embedToken: string | null
  city: {
    name: string
    slug: string
    stateCode: string
  } | null
}

interface ContractorsResponse {
  contractors: Contractor[]
  total: number
}

const { data, pending, error, refresh } = await useFetch<ContractorsResponse>('/api/owner/contractors')

const contractors = computed(() => data.value?.contractors || [])

// Build the public profile URL with SEO-optimized structure
function getProfileUrl(contractor: Contractor): string {
  if (!contractor.city?.stateCode || !contractor.city?.slug) {
    return '#'
  }
  const state = getStateByCode(contractor.city.stateCode)
  if (!state) return '#'
  return `/${state.slug}/${contractor.city.slug}/concrete-contractors/${contractor.slug}`
}

// Badge embed functionality
const { copy } = useClipboard()
const copiedContractorId = ref<string | null>(null)

function getBadgeUrl(embedToken: string): string {
  return `https://costofconcrete.com/api/public/badges/${embedToken}.svg`
}

function getBadgeHtml(embedToken: string): string {
  return `<img src="${getBadgeUrl(embedToken)}" alt="Verified Contractor on Cost of Concrete" width="200" height="40" />`
}

async function copyBadgeUrl(contractorId: string, embedToken: string) {
  await copy(getBadgeUrl(embedToken))
  copiedContractorId.value = contractorId
  setTimeout(() => {
    if (copiedContractorId.value === contractorId) {
      copiedContractorId.value = null
    }
  }, 2000)
}

// Track expanded badge sections
const expandedBadgeSections = ref<Set<string>>(new Set())

function toggleBadgeSection(contractorId: string) {
  if (expandedBadgeSections.value.has(contractorId)) {
    expandedBadgeSections.value.delete(contractorId)
  } else {
    expandedBadgeSections.value.add(contractorId)
  }
}
</script>

<template>
  <div>
    <!-- Page Header -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
        My Businesses
      </h1>
      <p class="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
        Manage your claimed business profiles
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="pending" class="flex items-center justify-center py-12">
      <div class="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/20">
      <p class="text-red-600 dark:text-red-400">
        Failed to load your businesses. Please try again.
      </p>
      <Button text="Retry" variant="secondary-outline" size="sm" class="mt-4" @click="refresh()" />
    </div>

    <!-- Empty State -->
    <div v-else-if="contractors.length === 0" class="rounded-lg border border-neutral-200 bg-white p-8 text-center dark:border-neutral-700 dark:bg-neutral-800">
      <Icon name="heroicons:building-office-2" class="mx-auto h-12 w-12 text-neutral-400" />
      <h3 class="mt-4 text-lg font-medium text-neutral-900 dark:text-neutral-100">
        No businesses yet
      </h3>
      <p class="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
        You haven't claimed any business profiles. Find your business in our directory and claim it.
      </p>
      <Button text="Find Your Business" location="/search" class="mt-6" />
    </div>

    <!-- Contractors List -->
    <div v-else class="space-y-4">
      <div
        v-for="contractor in contractors"
        :key="contractor.id"
        class="rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-800"
      >
        <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <!-- Business Info -->
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              {{ contractor.companyName }}
            </h3>
            <p v-if="contractor.city" class="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
              {{ contractor.city.name }}, {{ contractor.city.stateCode }}
            </p>
            <div v-if="contractor.rating" class="mt-2 flex items-center gap-2">
              <Icon name="heroicons:star-solid" class="h-4 w-4 text-yellow-500" />
              <span class="text-sm text-neutral-600 dark:text-neutral-400">
                {{ contractor.rating.toFixed(1) }} ({{ contractor.reviewCount }} reviews)
              </span>
            </div>
            <p v-if="contractor.phone" class="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
              {{ contractor.phone }}
            </p>
          </div>

          <!-- Actions -->
          <div class="flex flex-shrink-0 gap-2">
            <Button
              text="View"
              icon="heroicons:eye"
              variant="secondary-outline"
              size="sm"
              :location="getProfileUrl(contractor)"
              external
            />
            <Button
              text="Edit"
              icon="heroicons:pencil-square"
              size="sm"
              :location="`/owner/contractors/${contractor.id}/edit`"
            />
          </div>
        </div>

        <!-- Badge Embed Section -->
        <div class="mt-4 border-t border-neutral-200 pt-4 dark:border-neutral-700">
          <button
            type="button"
            class="flex w-full items-center justify-between text-left"
            @click="toggleBadgeSection(contractor.id)"
          >
            <div class="flex items-center gap-2">
              <Icon name="heroicons:code-bracket" class="h-5 w-5 text-orange-500" />
              <span class="text-sm font-medium text-neutral-700 dark:text-neutral-300">Badge Embed</span>
            </div>
            <Icon
              :name="expandedBadgeSections.has(contractor.id) ? 'heroicons:chevron-up' : 'heroicons:chevron-down'"
              class="h-4 w-4 text-neutral-400"
            />
          </button>

          <!-- Expanded Badge Section -->
          <div v-if="expandedBadgeSections.has(contractor.id)" class="mt-4 space-y-4">
            <!-- Show message if no embed token -->
            <div v-if="!contractor.embedToken" class="rounded-md bg-yellow-50 p-3 dark:bg-yellow-900/20">
              <p class="text-xs text-yellow-700 dark:text-yellow-400">
                Badge embed is not yet available for this business. Please contact support if you need assistance.
              </p>
            </div>

            <!-- Badge content when token is available -->
            <template v-else>
              <!-- Badge Preview -->
              <div class="flex items-center gap-4">
                <img
                  :src="getBadgeUrl(contractor.embedToken)"
                  alt="Verified Contractor Badge"
                  class="h-10"
                />
                <span class="text-xs text-neutral-500 dark:text-neutral-400">Badge preview</span>
              </div>

              <!-- Copy URL Section -->
              <div>
                <label class="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                  Image URL
                </label>
                <div class="flex gap-2">
                  <input
                    type="text"
                    readonly
                    :value="getBadgeUrl(contractor.embedToken)"
                    class="flex-1 rounded-md border border-neutral-300 bg-neutral-50 px-3 py-2 text-xs font-mono text-neutral-700 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-300"
                  />
                  <button
                    type="button"
                    class="inline-flex items-center gap-1 rounded-md bg-orange-500 px-3 py-2 text-xs font-medium text-white hover:bg-orange-600 transition-colors"
                    @click="copyBadgeUrl(contractor.id, contractor.embedToken!)"
                  >
                    <Icon
                      :name="copiedContractorId === contractor.id ? 'heroicons:check' : 'heroicons:clipboard'"
                      class="h-4 w-4"
                    />
                    {{ copiedContractorId === contractor.id ? 'Copied!' : 'Copy' }}
                  </button>
                </div>
              </div>

              <!-- HTML Embed Code -->
              <div>
                <label class="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                  HTML Embed Code
                </label>
                <code class="block rounded-md border border-neutral-300 bg-neutral-50 px-3 py-2 text-xs font-mono text-neutral-700 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-300 break-all">
                  {{ getBadgeHtml(contractor.embedToken) }}
                </code>
              </div>

              <!-- Instructions -->
              <div class="rounded-md bg-blue-50 p-3 dark:bg-blue-900/20">
                <h4 class="text-xs font-semibold text-blue-800 dark:text-blue-300 mb-2">
                  Add this badge to your website
                </h4>
                <ul class="space-y-1 text-xs text-blue-700 dark:text-blue-400">
                  <li>1. Copy the image URL or HTML embed code above</li>
                  <li>2. Paste it into your website's HTML</li>
                  <li>3. Each view helps track your listing performance</li>
                </ul>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

