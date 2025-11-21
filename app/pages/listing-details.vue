<script setup lang="ts">
const heroImage = "http://localhost:3845/assets/d482219c19a2dcbdbe5ea9578a02e19c44f230de.png"
const garageImage = "http://localhost:3845/assets/6ca788727f12ebfbc896bc0ef51ee71c8817e47c.png"

const breadcrumbs = [
  { id: 'texas', title: 'Texas', full_path: '/texas' },
  { id: 'provider', title: 'SolidStone Concrete LLC', full_path: '/listing-details' }
]

const tabs = ['Overview', 'Products & Services', 'Photos', 'Reviews', 'Resources']
const activeTab = ref('Overview')
</script>

<template>
  <div class="pb-20">
    <!-- Hero Section -->
    <section class="mb-8 rounded-3xl bg-[#F2F6FA] px-8 py-12 dark:bg-blue-900/20">
      <div class="mb-6 px-20">
        <Breadcrumbs :items="breadcrumbs" />
      </div>

      <div class="flex flex-col justify-between gap-8 px-20 lg:flex-row lg:items-start">
        <div class="space-y-4">
          <h1 class="font-heading text-5xl font-bold text-neutral-900 dark:text-white md:text-6xl">
            SolidStone Concrete LLC
          </h1>

          <div class="flex flex-wrap items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
            <div class="flex items-center text-yellow-500">
              <span class="mr-1 text-lg font-bold">4.9</span>
              <div class="flex">
                <Icon name="heroicons:star-solid" class="h-4 w-4" />
                <Icon name="heroicons:star-solid" class="h-4 w-4" />
                <Icon name="heroicons:star-solid" class="h-4 w-4" />
                <Icon name="heroicons:star-solid" class="h-4 w-4" />
                <Icon name="heroicons:star-solid" class="h-4 w-4" />
              </div>
            </div>
            <span>(124)</span>
            <span class="mx-2">•</span>
            <span>Houston, TX</span>
            <span class="mx-2">•</span>
            <span>Since 2008</span>
            <span class="mx-2">•</span>
            <span>Licensed & Insured</span>
          </div>

          <p class="max-w-3xl text-lg text-neutral-600 dark:text-neutral-300">
            Explore verified pros for driveways, patios, foundations, and decorative concrete.
            Compare services, reviews, and pricing—then contact your top choices with confidence.
          </p>
        </div>

        <div class="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-col">
          <Button
            text="Call (833) 555-1234"
            variant="primary-outline"
            class="whitespace-nowrap bg-white hover:bg-blue-50 dark:bg-transparent"
          />
          <Button
            text="Request a Quote"
            variant="primary"
            class="whitespace-nowrap"
          />
        </div>
      </div>
    </section>

    <div class="grid grid-cols-1 gap-8 px-20 lg:grid-cols-12">
      <!-- Sidebar -->
      <div class="space-y-6 lg:col-span-4">
        <!-- Company Info Card -->
        <Card
          :step="1"
          heading="Company Info"
          padding="p-6"
          :background-colors="['#ffffff', '#171717']"
          border-width="thick"
          :border-color="['#e5e7eb', '#404040']"
        >
          <div class="space-y-3 text-sm">
            <div class="grid grid-cols-[100px_1fr] gap-2">
              <span class="font-bold text-neutral-900 dark:text-white">Service Area:</span>
              <span class="text-neutral-600 dark:text-neutral-400">Greater Houston</span>
            </div>
            <div class="grid grid-cols-[100px_1fr] gap-2">
              <span class="font-bold text-neutral-900 dark:text-white">Hours:</span>
              <span class="text-neutral-600 dark:text-neutral-400">Mon-Sat · 8am-6pm</span>
            </div>
            <div class="grid grid-cols-[100px_1fr] gap-2">
              <span class="font-bold text-neutral-900 dark:text-white">License:</span>
              <span class="text-neutral-600 dark:text-neutral-400">TX-CON-44210</span>
            </div>
            <div class="grid grid-cols-[100px_1fr] gap-2">
              <span class="font-bold text-neutral-900 dark:text-white">Insurance:</span>
              <span class="text-neutral-600 dark:text-neutral-400">$2M liability</span>
            </div>
            <div class="grid grid-cols-[100px_1fr] gap-2">
              <span class="font-bold text-neutral-900 dark:text-white">Website:</span>
              <a href="#" class="text-blue-500 hover:underline">solidstone.example</a>
            </div>
          </div>

          <div class="mt-4 flex flex-wrap gap-2">
            <Badge text="Residential" variant="primary-outline" size="sm" class="rounded-full" />
            <Badge text="Light Commercial" variant="primary-outline" size="sm" class="rounded-full" />
            <Badge text="Warranty" variant="primary-outline" size="sm" class="rounded-full" />
            <Badge text="Free Estimates" variant="primary-outline" size="sm" class="rounded-full" />
          </div>

          <div class="mt-6">
            <Button
              text="Company Brochure (PDF)"
              variant="primary"
              class="w-full justify-between"
              icon="heroicons:arrow-down-tray"
            />
          </div>
        </Card>

        <!-- Contact Card -->
        <Card
          :step="2"
          heading="Contact"
          padding="p-6"
          :background-colors="['#ffffff', '#171717']"
          border-width="thick"
          :border-color="['#e5e7eb', '#404040']"
        >
          <p class="mb-4 text-xs text-neutral-500">Replies within 24 hours</p>

          <form class="space-y-4" @submit.prevent>
            <input
              type="text"
              placeholder="Full Name"
              class="w-full rounded-lg border border-blue-200 bg-white px-4 py-3 text-sm placeholder-neutral-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800"
            >
            <input
              type="email"
              placeholder="Email"
              class="w-full rounded-lg border border-blue-200 bg-white px-4 py-3 text-sm placeholder-neutral-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800"
            >
            <input
              type="tel"
              placeholder="Phone"
              class="w-full rounded-lg border border-blue-200 bg-white px-4 py-3 text-sm placeholder-neutral-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800"
            >
            <textarea
              placeholder="What Can We Build For You"
              rows="4"
              class="w-full rounded-lg border border-blue-200 bg-white px-4 py-3 text-sm placeholder-neutral-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800"
            ></textarea>

            <div class="grid grid-cols-2 gap-3">
              <Button text="Send" variant="primary" class="w-full" />
              <Button text="Call (833) 555-1234" variant="primary-outline" class="w-full whitespace-nowrap px-2 text-sm" />
            </div>
          </form>
        </Card>
      </div>

      <!-- Main Content -->
      <div class="lg:col-span-8">
        <!-- Tabs -->
        <div class="mb-8 flex flex-wrap gap-2">
          <button
            v-for="tab in tabs"
            :key="tab"
            @click="activeTab = tab"
            :class="[
              'rounded-full px-6 py-2 text-sm font-bold transition-colors',
              activeTab === tab
                ? 'bg-blue-600 text-white dark:bg-blue-500'
                : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700'
            ]"
          >
            {{ tab }}
          </button>
        </div>

        <Card
          padding="p-8"
          class="space-y-8"
          :background-colors="['#ffffff', '#171717']"
          border-width="thick"
          :border-color="['#e5e7eb', '#404040']"
        >
          <div v-if="activeTab === 'Overview'" class="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div class="space-y-6">
              <div>
                <h2 class="font-heading text-2xl font-bold text-neutral-900 dark:text-white">About SolidStone</h2>
                <p class="text-sm text-neutral-500">Phoenix, AZ</p>
              </div>

              <div class="space-y-4 text-neutral-600 dark:text-neutral-300">
                <p>
                  SolidStone Concrete LLC builds driveways, patios, and structural slabs that stand up to Gulf Coast weather.
                  Our prep work, base, and reinforcement deliver clean lines, proper drainage, and long-lasting performance.
                </p>
                <div class="flex items-center gap-1 text-yellow-500">
                  <Icon name="heroicons:star-solid" class="h-4 w-4" />
                  <Icon name="heroicons:star-solid" class="h-4 w-4" />
                  <Icon name="heroicons:star-solid" class="h-4 w-4" />
                  <Icon name="heroicons:star-solid" class="h-4 w-4" />
                  <Icon name="heroicons:star-solid" class="h-4 w-4" />
                  <span class="ml-1 text-neutral-600 dark:text-neutral-400">4.9 (88)</span>
                </div>
              </div>

              <div class="flex gap-4">
                <div class="rounded-2xl border border-neutral-200 p-4 text-center dark:border-neutral-700">
                  <div class="font-heading text-2xl font-bold text-neutral-900 dark:text-white">15+ yrs</div>
                  <div class="text-sm text-neutral-500">Experience</div>
                </div>
                <div class="rounded-2xl border border-neutral-200 p-4 text-center dark:border-neutral-700">
                  <div class="flex items-center justify-center gap-1 font-heading text-2xl font-bold text-neutral-900 dark:text-white">
                    4.9 <Icon name="heroicons:star-solid" class="h-5 w-5" />
                  </div>
                  <div class="text-sm text-neutral-500">Average Rating</div>
                </div>
              </div>
            </div>

            <div class="overflow-hidden rounded-2xl">
              <img
                :src="garageImage"
                alt="Garage interior"
                class="h-full w-full object-cover"
              >
            </div>
          </div>

          <div v-else class="flex h-64 items-center justify-center text-neutral-500">
            Content for {{ activeTab }} tab coming soon...
          </div>
        </Card>
      </div>
    </div>

    <!-- Bottom CTA -->
    <ListingBottomCta />
  </div>
</template>

<style scoped>
/* Custom styles to match specific design tweaks */
</style>
