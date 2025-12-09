<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { consola } from 'consola'
import { pageFormSchema, pageFormDefaultValues, type PageFormData } from '~/schemas/admin/page-form.schema'
import type { PageTemplate, TemplateSlug } from '~/types/templates'

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

  /**
   * Current page ID (for edit mode) - used to exclude current page from parent options
   */
  currentPageId?: string
}

const props = withDefaults(defineProps<Props>(), {
  initialData: undefined,
  isEditMode: false,
  isSubmitting: false,
  currentPageId: undefined
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
// Exclude current page in edit mode to prevent circular parent reference
const parentPageOptions = computed(() => {
  // Filter out current page if in edit mode
  const filteredPages = props.isEditMode && props.currentPageId
    ? availablePages.value.filter(page => page.id !== props.currentPageId)
    : availablePages.value

  const pageOptions = filteredPages.map((page) => ({
    value: page.id,
    label: `${'  '.repeat(page.depth)}${page.title}` // Indent based on depth
  }))

  return [
    { value: null, label: 'None (Top-level page)' },
    ...pageOptions
  ]
})

// =====================================================
// TEMPLATE OPTIONS (Database-Driven)
// =====================================================

const templates = ref<PageTemplate[]>([])
const isLoadingTemplates = ref(false)
const templateLoadError = ref<string | null>(null)

// Transform templates into dropdown options
const templateOptions = computed(() => {
  return templates.value.map((template) => ({
    value: template.slug,
    label: `${template.name} - ${template.description || 'No description'}`
  }))
})

// Fetch templates from API
async function fetchTemplates() {
  isLoadingTemplates.value = true
  templateLoadError.value = null

  try {
    if (import.meta.dev) {
      consola.info('[PageForm] Fetching templates from API')
    }

    const response = await $fetch<{ success: boolean; data: PageTemplate[]; total: number }>('/api/templates')

    if (response.success && response.data) {
      templates.value = response.data

      if (import.meta.dev) {
        consola.success(`[PageForm] Loaded ${response.data.length} templates`)
      }
    } else {
      throw new Error('Invalid response from API')
    }
  } catch (err: any) {
    templateLoadError.value = err.message || 'Failed to load templates'

    if (import.meta.dev) {
      consola.error('[PageForm] Failed to fetch templates:', err)
    }
  } finally {
    isLoadingTemplates.value = false
  }
}

// Fetch parent pages and templates on component mount
onMounted(async () => {
  await Promise.all([
    fetchPages({
      limit: 100,
      orderBy: 'full_path',
      orderDirection: 'asc'
    }),
    fetchTemplates()
  ])
})

// =====================================================
// TEMPLATE/DEPTH WARNINGS
// =====================================================

// Calculate the depth of the page being created/edited
const calculatedDepth = computed(() => {
  if (!parentId.value) return 0

  const parent = availablePages.value.find(p => p.id === parentId.value)
  return parent ? parent.depth + 1 : 0
})

// Check for unusual template/depth combinations
const templateWarning = computed(() => {
  if (!template.value) return null

  const depth = calculatedDepth.value
  const templateSlug = template.value as string

  // Hub template with parent (depth > 0)
  if (templateSlug === 'hub' && depth > 0) {
    return {
      type: 'warning',
      message: 'Hub templates are typically used at the top level (depth 0). Using a Hub template with a parent page may not display as expected.'
    }
  }

  // Spoke template at depth 0
  if (templateSlug === 'spoke' && depth === 0) {
    return {
      type: 'warning',
      message: 'Spoke templates are typically used at depth 1 (one level below Hub). Using a Spoke template at the top level may not display as expected.'
    }
  }

  // Sub-Spoke template at depth 0 or 1
  if (templateSlug === 'sub-spoke' && (depth === 0 || depth === 1)) {
    return {
      type: 'warning',
      message: 'Sub-Spoke templates are typically used at depth 2 or deeper. Using a Sub-Spoke template at this level may not display as expected.'
    }
  }

  return null
})

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

const onSubmit = handleSubmit(
  (formData) => {
    // Success callback - validation passed
    if (import.meta.dev) {
      consola.success('Form validation passed, submitting...')
    }
    emit('submit', formData)
  },
  ({ errors: validationErrors }) => {
    // Error callback - validation failed
    if (import.meta.dev) {
      consola.error('Form validation failed:', validationErrors)
    }
  }
)

function onCancel() {
  emit('cancel')
}
</script>

<template>
  <form @submit.prevent="onSubmit">
    <!-- Two-Column Grid Layout -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left Column (2/3 width) -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Title Field -->
        <div class="space-y-2">
          <UiLabel for="title">
            Title <span class="text-destructive">*</span>
          </UiLabel>
          <UiInput
            id="title"
            v-model="title"
            v-bind="titleAttrs"
            placeholder="Enter page title"
            :disabled="isSubmitting"
          />
          <p v-if="errors.title" class="text-sm text-destructive">
            {{ errors.title }}
          </p>
          <p class="text-xs text-muted-foreground">
            The main heading for this page (max 200 characters)
          </p>
        </div>

        <!-- Slug Field -->
        <div class="space-y-2">
          <UiLabel for="slug">
            Slug <span class="text-destructive">*</span>
          </UiLabel>
          <UiInput
            id="slug"
            v-model="slug"
            v-bind="slugAttrs"
            placeholder="page-url-slug"
            :disabled="isSubmitting"
            @input="onSlugInput"
          />
          <p v-if="errors.slug" class="text-sm text-destructive">
            {{ errors.slug }}
          </p>
          <!-- Warning for slug change in edit mode -->
          <div
            v-if="isEditMode && hasSlugChanged"
            class="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md"
          >
            <div class="flex items-start gap-2">
              <Icon name="heroicons:exclamation-triangle" class="size-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
              <div class="flex-1">
                <p class="text-sm font-medium text-yellow-800 dark:text-yellow-200">SEO Impact Warning</p>
                <p class="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                  Changing the slug will update the URL for this page and all its child pages. This may affect SEO rankings and break existing links.
                </p>
              </div>
            </div>
          </div>
          <p v-else class="text-xs text-muted-foreground">
            URL-friendly identifier (auto-generated from title, or customize manually)
          </p>
        </div>

        <!-- Parent Page & Template (Side-by-Side) -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Parent Page Field -->
          <div class="space-y-2">
            <UiLabel for="parentId">Parent Page</UiLabel>
            <UiSelect v-model="parentId" v-bind="parentIdAttrs" :disabled="isSubmitting">
              <UiSelectTrigger class="w-full">
                <UiSelectValue placeholder="Select parent page" />
              </UiSelectTrigger>
              <UiSelectContent>
                <UiSelectItem
                  v-for="option in parentPageOptions"
                  :key="option.value ?? 'null'"
                  :value="option.value"
                >
                  {{ option.label }}
                </UiSelectItem>
              </UiSelectContent>
            </UiSelect>
            <p v-if="errors.parentId" class="text-sm text-destructive">
              {{ errors.parentId }}
            </p>
            <!-- Warning for parent change in edit mode -->
            <div
              v-if="isEditMode && hasParentChanged"
              class="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md"
            >
              <div class="flex items-start gap-2">
                <Icon name="heroicons:exclamation-triangle" class="size-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                <div class="flex-1">
                  <p class="text-sm font-medium text-yellow-800 dark:text-yellow-200">Hierarchy Change Warning</p>
                  <p class="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                    Changing the parent will update the URL path, depth, and potentially the template for this page and all its children.
                  </p>
                </div>
              </div>
            </div>
            <p v-else class="text-xs text-muted-foreground">
              Optional: Select a parent page to create a hierarchical structure
            </p>
          </div>

          <!-- Template Field -->
          <div class="space-y-2">
            <UiLabel for="template">
              Template <span class="text-destructive">*</span>
            </UiLabel>
            <UiSelect v-model="template" v-bind="templateAttrs" :disabled="isSubmitting || isLoadingTemplates">
              <UiSelectTrigger class="w-full">
                <UiSelectValue placeholder="Select template" />
              </UiSelectTrigger>
              <UiSelectContent>
                <UiSelectItem
                  v-for="option in templateOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </UiSelectItem>
              </UiSelectContent>
            </UiSelect>
            <!-- Loading state -->
            <p v-if="isLoadingTemplates" class="text-sm text-primary">
              Loading templates...
            </p>

            <!-- Error state -->
            <p v-else-if="templateLoadError" class="text-sm text-destructive">
              {{ templateLoadError }}
            </p>

            <!-- Validation error -->
            <p v-else-if="errors.template" class="text-sm text-destructive">
              {{ errors.template }}
            </p>

            <!-- Template/Depth Warning -->
            <div
              v-if="templateWarning"
              class="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md"
            >
              <div class="flex items-start gap-2">
                <Icon name="heroicons:exclamation-triangle" class="size-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                <div class="flex-1">
                  <p class="text-sm font-medium text-yellow-800 dark:text-yellow-200">Unusual Template Selection</p>
                  <p class="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                    {{ templateWarning.message }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Warning for template change in edit mode -->
            <div
              v-else-if="isEditMode && hasTemplateChanged"
              class="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md"
            >
              <div class="flex items-start gap-2">
                <Icon name="heroicons:exclamation-triangle" class="size-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                <div class="flex-1">
                  <p class="text-sm font-medium text-yellow-800 dark:text-yellow-200">Template Change Warning</p>
                  <p class="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                    Changing the template may clear incompatible metadata fields. Make sure the new template is compatible with your content.
                  </p>
                </div>
              </div>
            </div>

            <!-- Help text -->
            <p v-else class="text-xs text-muted-foreground">
              Choose the template that best fits your content type
            </p>
          </div>
        </div>

        <!-- Status Field -->
        <div class="space-y-2">
          <UiLabel for="status">
            Status <span class="text-destructive">*</span>
          </UiLabel>
          <UiSelect v-model="status" v-bind="statusAttrs" :disabled="isSubmitting">
            <UiSelectTrigger class="w-full">
              <UiSelectValue placeholder="Select status" />
            </UiSelectTrigger>
            <UiSelectContent>
              <UiSelectItem
                v-for="option in statusOptions"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </UiSelectItem>
            </UiSelectContent>
          </UiSelect>
          <p v-if="errors.status" class="text-sm text-destructive">
            {{ errors.status }}
          </p>
          <p class="text-xs text-muted-foreground">
            Control the visibility of this page
          </p>
        </div>

        <!-- Description Field -->
        <div class="space-y-2">
          <UiLabel for="description">Description</UiLabel>
          <UiTextarea
            id="description"
            v-model="description"
            v-bind="descriptionAttrs"
            placeholder="Enter a brief description of this page"
            :disabled="isSubmitting"
            rows="4"
          />
          <p v-if="errors.description" class="text-sm text-destructive">
            {{ errors.description }}
          </p>
          <p class="text-xs text-muted-foreground">
            Optional: A short summary of the page content (max 500 characters)
          </p>
        </div>

        <!-- Content Field (TipTap Editor) -->
        <div class="space-y-2">
          <UiLabel for="content">
            Content <span class="text-destructive">*</span>
          </UiLabel>
          <TipTapEditor
            v-model="content"
            v-bind="contentAttrs"
            placeholder="Start writing your page content..."
            :disabled="isSubmitting"
          />
          <p v-if="errors.content" class="text-sm text-destructive">
            {{ errors.content }}
          </p>
          <p class="text-xs text-muted-foreground">
            The main content of your page (supports rich text formatting)
          </p>
        </div>
      </div>

      <!-- Right Column (1/3 width) - Sticky on desktop -->
      <div class="lg:col-span-1 lg:sticky lg:top-6 lg:self-start space-y-6">

        <!-- Template Metadata Section -->
        <UiCard v-if="template">
          <UiCardHeader>
            <UiCardTitle>Template Settings</UiCardTitle>
            <UiCardDescription>
              Configure template-specific options for the {{ template }} template
            </UiCardDescription>
          </UiCardHeader>
          <UiCardContent>
            <TemplateMetadataFields
              :template="template"
              :metadata="values.metadata"
              @update:metadata="handleMetadataUpdate"
              :disabled="isSubmitting"
            />
          </UiCardContent>
        </UiCard>

        <!-- SEO Settings Section -->
        <UiCard>
          <UiCardContent class="pt-6">
            <SeoFieldsSection
              :values="values"
              :errors="errors"
              @update:field="setFieldValue"
              :disabled="isSubmitting"
            />
          </UiCardContent>
        </UiCard>
      </div>
    </div>


    <!-- Form Actions -->
    <div class="flex items-center justify-end gap-3 pt-6 mt-6 border-t border-border">
      <UiButton
        type="button"
        variant="outline"
        @click="onCancel"
        :disabled="isSubmitting"
      >
        Cancel
      </UiButton>
      <UiButton
        type="submit"
        :disabled="isSubmitting"
      >
        <Icon v-if="isSubmitting" name="heroicons:arrow-path" class="size-4 animate-spin mr-2" />
        {{ isEditMode ? 'Update Page' : 'Create Page' }}
      </UiButton>
    </div>
  </form>
</template>

