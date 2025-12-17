<script setup lang="ts">
/**
 * ArticleTemplate - Block-ready article template
 *
 * Features:
 * - Hero section with breadcrumbs, title, optional grayscale background
 * - 2-column layout (2/3 content, 1/3 sticky sidebar)
 * - Sidebar with TOC, optional author, last updated
 * - Mobile bottom sheet for TOC
 * - Block-ready architecture (markdown, faq blocks)
 */
import type { Database } from '~/types/supabase'

type Page = Database['public']['Tables']['pages']['Row']

/** Content block types */
interface MarkdownBlock {
  type: 'markdown'
  content: string
}

interface FaqBlock {
  type: 'faq'
  items: Array<{ question: string; answer: string }>
}

type ContentBlock = MarkdownBlock | FaqBlock

/** Article template metadata */
interface ArticleMetadata {
  heroImage?: string
  author?: string
  showTableOfContents?: boolean
  blocks?: ContentBlock[]
}

interface Props {
  page: Page
  children?: Page[] | null
  breadcrumbs?: Array<{ id: string; title: string; full_path: string }> | null
  showBreadcrumbs?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showBreadcrumbs: true
})

// Parse metadata
const metadata = computed<ArticleMetadata>(() => {
  const pageMetadata = props.page.metadata as any
  return pageMetadata?.template || {}
})

// Show TOC (default true)
const showToc = computed(() => metadata.value.showTableOfContents !== false)

// Mobile TOC sheet state
const isTocSheetOpen = ref(false)

// Render markdown content (legacy support when no blocks defined)
const { html: legacyContent } = useMarkdown(computed(() => props.page.content || ''))

// Content blocks (use blocks if defined, otherwise wrap content as single markdown block)
const contentBlocks = computed<ContentBlock[]>(() => {
  if (metadata.value.blocks && metadata.value.blocks.length > 0) {
    return metadata.value.blocks
  }
  // Legacy: wrap page.content as single markdown block
  return [{ type: 'markdown', content: props.page.content || '' }]
})

// Extract TOC from all markdown blocks
const tableOfContents = computed(() => {
  if (!showToc.value) return []

  const headings: Array<{ id: string; text: string; level: 'h2' | 'h3' }> = []
  let headingIndex = 0

  for (const block of contentBlocks.value) {
    if (block.type === 'markdown' && block.content) {
      // Simple regex to extract markdown headings
      const matches = block.content.matchAll(/^(#{2,3})\s+(.+)$/gm)
      for (const match of matches) {
        headings.push({
          id: `heading-${headingIndex++}`,
          text: match[2].trim(),
          level: match[1].length === 2 ? 'h2' : 'h3'
        })
      }
    }
  }
  return headings
})

// Format dates
const formattedDate = computed(() => {
  const date = props.page.updated_at || props.page.published_at
  if (!date) return null
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  })
})

// Scroll to heading
const scrollToHeading = (id: string) => {
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    isTocSheetOpen.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-neutral-50 dark:bg-neutral-900">
    <!-- Hero Section -->
    <header
      class="relative py-12 lg:py-16"
      :class="metadata.heroImage ? 'bg-neutral-800' : 'bg-white dark:bg-neutral-800'"
    >
      <!-- Optional grayscale background image -->
      <div
        v-if="metadata.heroImage"
        class="absolute inset-0 bg-cover bg-center grayscale opacity-20"
        :style="{ backgroundImage: `url(${metadata.heroImage})` }"
      />

      <div class="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <!-- Breadcrumbs -->
        <Breadcrumbs
          v-if="showBreadcrumbs && breadcrumbs"
          :items="breadcrumbs"
          class="mb-6"
        />

        <!-- Title -->
        <h1 class="font-heading text-3xl font-bold leading-tight text-neutral-900 dark:text-neutral-50 md:text-4xl lg:text-5xl"
            :class="metadata.heroImage ? 'text-white' : ''">
          {{ page.title }}
        </h1>

        <!-- Description -->
        <p v-if="page.description"
           class="mt-4 text-lg text-neutral-600 dark:text-neutral-300 max-w-3xl"
           :class="metadata.heroImage ? 'text-neutral-200' : ''">
          {{ page.description }}
        </p>
      </div>
    </header>

    <!-- Main Content Area: 2-column layout -->
    <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <div class="lg:grid lg:grid-cols-3 lg:gap-12">
        <!-- Content Column (2/3) -->
        <article class="lg:col-span-2">
          <!-- Render content blocks -->
          <template v-for="(block, idx) in contentBlocks" :key="idx">
            <!-- Markdown Block -->
            <div v-if="block.type === 'markdown'"
                 class="prose prose-lg prose-neutral max-w-none dark:prose-invert prose-headings:font-heading prose-headings:font-bold prose-a:text-blue-600 hover:prose-a:text-blue-700 dark:prose-a:text-blue-400 mb-8"
                 v-html="useMarkdown(block.content).html.value" />

            <!-- FAQ Block -->
            <div v-else-if="block.type === 'faq'" class="mb-8">
              <FaqAccordion :items="block.items" />
            </div>
          </template>
        </article>

        <!-- Sidebar Column (1/3) - Desktop only -->
        <aside class="hidden lg:block lg:col-span-1">
          <div class="sticky top-8 space-y-6">
            <!-- Table of Contents -->
            <nav v-if="showToc && tableOfContents.length > 0" class="rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-800">
              <h2 class="mb-4 font-heading text-sm font-bold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                On this page
              </h2>
              <ul class="space-y-2 text-sm">
                <li v-for="item in tableOfContents" :key="item.id" :class="item.level === 'h3' ? 'ml-3' : ''">
                  <button type="button" @click="scrollToHeading(item.id)"
                    class="text-left text-neutral-600 hover:text-blue-600 dark:text-neutral-300 dark:hover:text-blue-400 transition-colors">
                    {{ item.text }}
                  </button>
                </li>
              </ul>
            </nav>

            <!-- Author & Updated -->
            <div v-if="metadata.author || formattedDate" class="rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-800">
              <div v-if="metadata.author" class="mb-3">
                <span class="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">Author</span>
                <p class="mt-1 font-medium text-neutral-900 dark:text-neutral-50">{{ metadata.author }}</p>
              </div>
              <div v-if="formattedDate">
                <span class="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">Last updated</span>
                <p class="mt-1 text-neutral-600 dark:text-neutral-300">{{ formattedDate }}</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>

    <!-- Mobile TOC Bottom Tab -->
    <div v-if="showToc && tableOfContents.length > 0" class="fixed bottom-0 left-0 right-0 lg:hidden z-30">
      <button
        type="button"
        @click="isTocSheetOpen = true"
        class="w-full flex items-center justify-center gap-2 py-3 bg-white dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 font-medium shadow-lg"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
          <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
        </svg>
        Table of Contents
      </button>
    </div>

    <!-- Mobile TOC Bottom Sheet -->
    <BottomSheet v-model:open="isTocSheetOpen" title="Table of Contents">
      <ul class="space-y-3">
        <li v-for="item in tableOfContents" :key="item.id" :class="item.level === 'h3' ? 'ml-4' : ''">
          <button type="button" @click="scrollToHeading(item.id)"
            class="w-full text-left py-2 text-neutral-700 hover:text-blue-600 dark:text-neutral-200 dark:hover:text-blue-400 transition-colors">
            {{ item.text }}
          </button>
        </li>
      </ul>
    </BottomSheet>
  </div>
</template>

