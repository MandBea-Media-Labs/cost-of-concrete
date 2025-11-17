<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { consola } from 'consola'
import { pageFormSchema, pageFormDefaultValues, type PageFormData } from '~/schemas/admin/page-form.schema'

interface Props {
  /**
   * Initial form data (for edit mode)
   */
  initialData?: Partial<PageFormData>

  /**
   * Whether the form is in edit mode
   * @default false
   */
  isEditMode?: boolean

  /**
   * Whether the form is submitting
   * @default false
   */
  isSubmitting?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  initialData: undefined,
  isEditMode: false,
  isSubmitting: false
})

const emit = defineEmits<{
  'submit': [data: PageFormData]
  'cancel': []
}>()

// =====================================================
// FORM SETUP
// =====================================================

const { values, errors, defineField, handleSubmit, setFieldValue } = useForm({
  validationSchema: toTypedSchema(pageFormSchema),
  initialValues: props.initialData || pageFormDefaultValues
})

// Define form fields with VeeValidate
const [title, titleAttrs] = defineField('title')
const [slug, slugAttrs] = defineField('slug')
const [parentId, parentIdAttrs] = defineField('parentId')
const [template, templateAttrs] = defineField('template')
const [status, statusAttrs] = defineField('status')
const [description, descriptionAttrs] = defineField('description')
const [content, contentAttrs] = defineField('content')
const [metadata, metadataAttrs] = defineField('metadata')

// =====================================================
// METADATA UPDATE HANDLER
// =====================================================

function handleMetadataUpdate(val: Record<string, any>) {
  if (import.meta.client && import.meta.dev) {
    consola.info('[PageForm] Received metadata update:', {
      val,
      valType: typeof val,
      isPlainObject: Object.prototype.toString.call(val) === '[object Object]',
      currentMetadata: values.metadata
    })
  }
  setFieldValue('metadata', val)
}

// =====================================================
// AUTO-GENERATE SLUG FROM TITLE
// =====================================================

const isSlugManuallyEdited = ref(false)

/**
 * Generate URL-friendly slug from title
 */
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}

/**
 * Auto-generate slug when title changes (only if slug hasn't been manually edited and NOT in edit mode)
 */
watch(title, (newTitle) => {
  if (!props.isEditMode && !isSlugManuallyEdited.value && newTitle) {
    setFieldValue('slug', generateSlug(newTitle))
  }
})

/**
 * Mark slug as manually edited when user types in slug field
 */
function onSlugInput() {
  isSlugManuallyEdited.value = true
}

// =====================================================
// CHANGE DETECTION FOR EDIT MODE
// =====================================================

// Store initial values for change detection
const initialValues = ref<Partial<PageFormData> | null>(null)

// Initialize on mount
onMounted(() => {
  if (props.isEditMode && props.initialData) {
    initialValues.value = { ...props.initialData }
  }
})

/**
 * Check if a field has changed from its initial value
 */
function hasFieldChanged(fieldName: keyof PageFormData): boolean {
  if (!props.isEditMode || !initialValues.value) return false
  return values[fieldName] !== initialValues.value[fieldName]
}

/**
 * Check if slug has changed
 */
const hasSlugChanged = computed(() => hasFieldChanged('slug'))

/**
 * Check if parent has changed
 */
const hasParentChanged = computed(() => hasFieldChanged('parentId'))

/**
 * Check if template has changed
 */
const hasTemplateChanged = computed(() => hasFieldChanged('template'))

// =====================================================
// PARENT PAGE OPTIONS
// =====================================================

// Use existing composable for data fetching (DRY principle)
const { pages: availablePages, pending: isLoadingParentPages, fetchPages } = useAdminPages()

// Transform pages into dropdown options with hierarchical indentation
const parentPageOptions = computed(() => {
  const pageOptions = availablePages.value.map((page) => ({
    value: page.id,
    label: `${'  '.repeat(page.depth)}${page.title}` // Indent based on depth
  }))

  return [
    { value: null, label: 'None (Top-level page)' },
    ...pageOptions
  ]
})

// Fetch parent pages on component mount
onMounted(async () => {
  await fetchPages({
    limit: 100,
    orderBy: 'full_path',
    orderDirection: 'asc'
  })
})

// =====================================================
// TEMPLATE OPTIONS
// =====================================================

const templateOptions = [
  { value: 'hub', label: 'Hub Template - Top-level category with child grid (Depth 0)' },
  { value: 'spoke', label: 'Spoke Template - Mid-level content with sidebar (Depth 1)' },
  { value: 'sub-spoke', label: 'Sub-Spoke Template - Detailed content with TOC (Depth 2)' },
  { value: 'article', label: 'Article Template - Deep-level article (Depth 3+)' },
  { value: 'custom', label: 'Custom Template - Fully customizable' },
  { value: 'default', label: 'Default Template - Basic fallback' }
]

// =====================================================
// STATUS OPTIONS
// =====================================================

const statusOptions = [
  { value: 'draft', label: 'Draft - Not visible to public' },
  { value: 'published', label: 'Published - Visible to public' },
  { value: 'archived', label: 'Archived - Hidden from public and admin lists' }
]

// =====================================================
// FORM SUBMISSION
// =====================================================

const onSubmit = handleSubmit((formData) => {
  emit('submit', formData)
})

function onCancel() {
  emit('cancel')
}
</script>

<template>
  <form @submit.prevent="onSubmit" class="space-y-6">
    <!-- Title Field -->
    <div>
      <label for="title" class="block text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-2">
        Title <span class="text-red-500">*</span>
      </label>
      <TextInput
        id="title"
        v-model="title"
        v-bind="titleAttrs"
        placeholder="Enter page title"
        :disabled="isSubmitting"
        size="lg"
      />
      <p v-if="errors.title" class="mt-1 text-sm text-red-600 dark:text-red-400">
        {{ errors.title }}
      </p>
      <p class="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
        The main heading for this page (max 200 characters)
      </p>
    </div>

    <!-- Slug Field -->
    <div>
      <label for="slug" class="block text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-2">
        Slug <span class="text-red-500">*</span>
      </label>
      <TextInput
        id="slug"
        v-model="slug"
        v-bind="slugAttrs"
        placeholder="page-url-slug"
        :disabled="isSubmitting"
        size="lg"
        @input="onSlugInput"
      />
      <p v-if="errors.slug" class="mt-1 text-sm text-red-600 dark:text-red-400">
        {{ errors.slug }}
      </p>
      <!-- Warning for slug change in edit mode -->
      <div
        v-if="isEditMode && hasSlugChanged"
        class="mt-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md"
      >
        <div class="flex items-start gap-2">
          <svg class="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
          <div class="flex-1">
            <p class="text-sm font-medium text-yellow-800 dark:text-yellow-200">SEO Impact Warning</p>
            <p class="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
              Changing the slug will update the URL for this page and all its child pages. This may affect SEO rankings and break existing links.
            </p>
          </div>
        </div>
      </div>
      <p v-else class="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
        URL-friendly identifier (auto-generated from title, or customize manually)
      </p>
    </div>

    <!-- Parent Page Field -->
    <div>
      <label for="parentId" class="block text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-2">
        Parent Page
      </label>
      <FilterSelect
        id="parentId"
        v-model="parentId"
        v-bind="parentIdAttrs"
        :options="parentPageOptions"
        placeholder="Select parent page"
        :disabled="isSubmitting"
      />
      <p v-if="errors.parentId" class="mt-1 text-sm text-red-600 dark:text-red-400">
        {{ errors.parentId }}
      </p>
      <!-- Warning for parent change in edit mode -->
      <div
        v-if="isEditMode && hasParentChanged"
        class="mt-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md"
      >
        <div class="flex items-start gap-2">
          <svg class="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
          <div class="flex-1">
            <p class="text-sm font-medium text-yellow-800 dark:text-yellow-200">Hierarchy Change Warning</p>
            <p class="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
              Changing the parent will update the URL path, depth, and potentially the template for this page and all its children.
            </p>
          </div>
        </div>
      </div>
      <p v-else class="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
        Optional: Select a parent page to create a hierarchical structure
      </p>
    </div>

    <!-- Template Field -->
    <div>
      <label for="template" class="block text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-2">
        Template <span class="text-red-500">*</span>
      </label>
      <FilterSelect
        id="template"
        v-model="template"
        v-bind="templateAttrs"
        :options="templateOptions"
        placeholder="Select template"
        :disabled="isSubmitting"
      />
      <p v-if="errors.template" class="mt-1 text-sm text-red-600 dark:text-red-400">
        {{ errors.template }}
      </p>
      <!-- Warning for template change in edit mode -->
      <div
        v-if="isEditMode && hasTemplateChanged"
        class="mt-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md"
      >
        <div class="flex items-start gap-2">
          <svg class="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
          <div class="flex-1">
            <p class="text-sm font-medium text-yellow-800 dark:text-yellow-200">Template Change Warning</p>
            <p class="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
              Changing the template may clear incompatible metadata fields. Make sure the new template is compatible with your content.
            </p>
          </div>
        </div>
      </div>
      <p v-else class="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
        Choose the template that best fits your content type
      </p>
    </div>

    <!-- Status Field -->
    <div>
      <label for="status" class="block text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-2">
        Status <span class="text-red-500">*</span>
      </label>
      <FilterSelect
        id="status"
        v-model="status"
        v-bind="statusAttrs"
        :options="statusOptions"
        placeholder="Select status"
        :disabled="isSubmitting"
      />
      <p v-if="errors.status" class="mt-1 text-sm text-red-600 dark:text-red-400">
        {{ errors.status }}
      </p>
      <p class="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
        Control the visibility of this page
      </p>
    </div>

    <!-- Description Field -->
    <div>
      <label for="description" class="block text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-2">
        Description
      </label>
      <textarea
        id="description"
        v-model="description"
        v-bind="descriptionAttrs"
        placeholder="Enter a brief description of this page"
        :disabled="isSubmitting"
        rows="4"
        class="w-full px-4 py-3 text-sm rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed resize-y"
      />
      <p v-if="errors.description" class="mt-1 text-sm text-red-600 dark:text-red-400">
        {{ errors.description }}
      </p>
      <p class="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
        Optional: A short summary of the page content (max 500 characters)
      </p>
    </div>

    <!-- Content Field (TipTap Editor) -->
    <div>
      <label for="content" class="block text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-2">
        Content <span class="text-red-500">*</span>
      </label>
      <TipTapEditor
        v-model="content"
        v-bind="contentAttrs"
        placeholder="Start writing your page content..."
        :disabled="isSubmitting"
      />
      <p v-if="errors.content" class="mt-1 text-sm text-red-600 dark:text-red-400">
        {{ errors.content }}
      </p>
      <p class="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
        The main content of your page (supports rich text formatting)
      </p>
    </div>

    <!-- Template Metadata Section -->
    <div v-if="template" class="border-t border-neutral-200 dark:border-neutral-700 pt-6">
      <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
        Template Settings
      </h3>
      <p class="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
        Configure template-specific options for the {{ template }} template
      </p>
      <TemplateMetadataFields
        :template="template"
        :metadata="values.metadata"
        @update:metadata="handleMetadataUpdate"
        :disabled="isSubmitting"
      />
    </div>

    <!-- SEO Settings Section -->
    <div class="border-t border-neutral-200 dark:border-neutral-700 pt-6">
      <SeoFieldsSection
        :values="values"
        :errors="errors"
        @update:field="setFieldValue"
        :disabled="isSubmitting"
      />
    </div>

    <!-- Form Actions -->
    <div class="flex items-center justify-end gap-3 pt-6 border-t border-neutral-200 dark:border-neutral-700">
      <button
        type="button"
        @click="onCancel"
        :disabled="isSubmitting"
        class="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Cancel
      </button>
      <button
        type="submit"
        :disabled="isSubmitting"
        class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <Icon v-if="isSubmitting" name="heroicons:arrow-path" class="h-4 w-4 animate-spin mr-2" />
        {{ isEditMode ? 'Update Page' : 'Create Page' }}
      </button>
    </div>
  </form>
</template>

