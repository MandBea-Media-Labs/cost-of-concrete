<script setup lang="ts">
import { computed } from 'vue'

/**
 * SeoTemplateSheet - Sheet component for SEO & Template settings
 *
 * Contains: Template Metadata Fields, SEO Settings
 * Uses existing TemplateMetadataFields and SeoFieldsSection components.
 */

import type { TemplateSlug } from '~/types/templates'
import type { PageFormData } from '~/schemas/admin/page-form.schema'

interface Props {
  open: boolean
  // Template metadata
  template: TemplateSlug
  metadata: Record<string, any> | null
  // SEO values and errors
  seoValues: Partial<PageFormData>
  seoErrors: Partial<Record<keyof PageFormData, string | undefined>>
  // Disabled state
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false
})

const emit = defineEmits<{
  'update:open': [value: boolean]
  'update:metadata': [value: Record<string, any>]
  'update:seoField': [name: keyof PageFormData, value: any]
}>()

// SEO fields that belong to this sheet
const seoFields = [
  'metaTitle', 'metaDescription', 'metaKeywords', 'focusKeyword',
  'canonicalUrl', 'metaRobots', 'sitemapPriority', 'sitemapChangefreq',
  'redirectUrl', 'redirectType',
  'ogTitle', 'ogDescription', 'ogImage', 'ogType',
  'twitterCard', 'twitterTitle', 'twitterDescription', 'twitterImage',
  'schemaType'
] as const

// Check if this sheet has any validation errors
const hasErrors = computed(() => {
  return seoFields.some(field => props.seoErrors[field])
})

// Handle close attempt - only allow if no errors
function handleClose() {
  if (!hasErrors.value) {
    emit('update:open', false)
  }
}
</script>

<template>
  <UiSheet :open="open" @update:open="hasErrors ? undefined : emit('update:open', $event)">
    <UiSheetContent side="right" class="w-full sm:max-w-xl overflow-hidden flex flex-col p-6">
      <UiSheetHeader class="flex-shrink-0 pb-4">
        <UiSheetTitle>SEO & Template Settings</UiSheetTitle>
        <UiSheetDescription>
          Configure template-specific fields and search engine optimization
        </UiSheetDescription>
      </UiSheetHeader>

      <div class="flex-1 overflow-y-auto min-h-0">
        <div class="space-y-6 py-4">
          <!-- Template Metadata Section -->
          <div class="space-y-4">
            <div class="flex items-center gap-2">
              <Icon name="heroicons:adjustments-horizontal" class="size-5 text-primary" />
              <h3 class="font-semibold">Template Settings</h3>
            </div>
            <div class="rounded-lg border border-border bg-card p-4">
              <TemplateMetadataFields
                :template="template"
                :metadata="metadata"
                :disabled="disabled"
                @update:metadata="emit('update:metadata', $event)"
              />
            </div>
          </div>

          <!-- Divider -->
          <div class="border-t border-border" />

          <!-- SEO Settings Section -->
          <div class="space-y-4">
            <div class="flex items-center gap-2">
              <Icon name="heroicons:magnifying-glass-circle" class="size-5 text-primary" />
              <h3 class="font-semibold">SEO Settings</h3>
            </div>
            <SeoFieldsSection
              :values="seoValues"
              :errors="seoErrors"
              :disabled="disabled"
              @update:field="(name, value) => emit('update:seoField', name, value)"
            />
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex-shrink-0 pt-4 border-t border-border space-y-3">
        <!-- Error Message -->
        <div
          v-if="hasErrors"
          class="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md"
        >
          <Icon name="heroicons:exclamation-circle" class="size-4 text-destructive flex-shrink-0" />
          <p class="text-sm text-destructive">Please fix the validation errors above before closing.</p>
        </div>

        <div class="flex items-center justify-end">
          <UiButton
            type="button"
            @click="handleClose"
            :disabled="hasErrors"
          >
            Save & Close
          </UiButton>
        </div>
      </div>
    </UiSheetContent>
  </UiSheet>
</template>

