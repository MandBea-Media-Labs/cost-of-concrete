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
            />
            <Button
              text="Edit"
              icon="heroicons:pencil-square"
              size="sm"
              :location="`/owner/contractors/${contractor.id}/edit`"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

