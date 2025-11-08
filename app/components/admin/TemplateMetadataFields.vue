<script setup lang="ts">
/**
 * Template Metadata Fields Component
 *
 * Dynamically generates form fields based on the selected template's JSON schema.
 * Uses prop-based architecture for VeeValidate integration.
 */

import { consola } from 'consola'
import type { TemplateType } from '~/server/config/templates'

interface Props {
  template: TemplateType
  metadata?: Record<string, any> | null
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  metadata: null,
  disabled: false
})

const emit = defineEmits<{
  'update:metadata': [value: Record<string, any>]
}>()

const { templateSchema, loading, error, fetchTemplateSchema, generateFormFields, getFieldHelpText } = useTemplateSchema()

// Generate form fields based on template schema
const formFields = ref<ReturnType<typeof generateFormFields>>([])

// Watch for template changes
watch(() => props.template, async (newTemplate) => {
  if (newTemplate) {
    const schema = await fetchTemplateSchema(newTemplate)
    if (schema) {
      formFields.value = generateFormFields(schema.schema)
    }
  }
}, { immediate: true })

// Update parent when any field changes
function updateField(fieldName: string, value: any) {
  const updated = { ...(props.metadata || {}), [fieldName]: value }

  // Debug logging
  if (import.meta.client && import.meta.dev) {
    consola.info('[TemplateMetadataFields] Updating field:', {
      fieldName,
      value,
      updated,
      metadataType: typeof updated,
      isPlainObject: Object.prototype.toString.call(updated) === '[object Object]'
    })
  }

  emit('update:metadata', updated)
}

// Get field value
function getFieldValue(fieldName: string) {
  return props.metadata?.[fieldName]
}
</script>

<template>
  <div class="space-y-6">
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
      <span class="ml-3 text-sm text-gray-600 dark:text-gray-400">Loading template fields...</span>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800 dark:text-red-200">Error loading template fields</h3>
          <p class="mt-1 text-sm text-red-700 dark:text-red-300">{{ error }}</p>
        </div>
      </div>
    </div>

    <!-- Form Fields -->
    <div v-else-if="formFields.length > 0" class="space-y-4">
      <div v-for="field in formFields" :key="field.name" class="space-y-2">
        <!-- Boolean Field (Checkbox) -->
        <div v-if="field.type === 'boolean'" class="flex items-start">
          <div class="flex items-center h-5">
            <input
              :id="`metadata-${field.name}`"
              type="checkbox"
              :checked="getFieldValue(field.name)"
              :disabled="disabled"
              @change="updateField(field.name, ($event.target as HTMLInputElement).checked)"
              class="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
          <div class="ml-3 text-sm">
            <label :for="`metadata-${field.name}`" class="font-medium text-gray-700 dark:text-gray-300">
              {{ field.label }}
              <span v-if="field.required" class="text-red-500">*</span>
            </label>
            <p v-if="field.helpText || getFieldHelpText(template, field.name)" class="text-gray-500 dark:text-gray-400">
              {{ field.helpText || getFieldHelpText(template, field.name) }}
            </p>
          </div>
        </div>

        <!-- Select Field (Dropdown) -->
        <div v-else-if="field.type === 'select'" class="space-y-1">
          <label :for="`metadata-${field.name}`" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {{ field.label }}
            <span v-if="field.required" class="text-red-500">*</span>
          </label>
          <select
            :id="`metadata-${field.name}`"
            :value="getFieldValue(field.name)"
            :disabled="disabled"
            @change="updateField(field.name, ($event.target as HTMLSelectElement).value)"
            class="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">Select {{ field.label.toLowerCase() }}</option>
            <option v-for="option in field.options" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
          <p v-if="field.helpText || getFieldHelpText(template, field.name)" class="text-sm text-gray-500 dark:text-gray-400">
            {{ field.helpText || getFieldHelpText(template, field.name) }}
          </p>
        </div>

        <!-- Number Field -->
        <div v-else-if="field.type === 'number'" class="space-y-1">
          <label :for="`metadata-${field.name}`" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {{ field.label }}
            <span v-if="field.required" class="text-red-500">*</span>
          </label>
          <input
            :id="`metadata-${field.name}`"
            type="number"
            :value="getFieldValue(field.name)"
            :placeholder="field.placeholder"
            :disabled="disabled"
            @input="updateField(field.name, Number(($event.target as HTMLInputElement).value))"
            class="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <p v-if="field.helpText || getFieldHelpText(template, field.name)" class="text-sm text-gray-500 dark:text-gray-400">
            {{ field.helpText || getFieldHelpText(template, field.name) }}
          </p>
        </div>

        <!-- Text Field -->
        <div v-else-if="field.type === 'text'" class="space-y-1">
          <label :for="`metadata-${field.name}`" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {{ field.label }}
            <span v-if="field.required" class="text-red-500">*</span>
          </label>
          <input
            :id="`metadata-${field.name}`"
            type="text"
            :value="getFieldValue(field.name)"
            :placeholder="field.placeholder"
            :disabled="disabled"
            @input="updateField(field.name, ($event.target as HTMLInputElement).value)"
            class="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <p v-if="field.helpText || getFieldHelpText(template, field.name)" class="text-sm text-gray-500 dark:text-gray-400">
            {{ field.helpText || getFieldHelpText(template, field.name) }}
          </p>
        </div>

        <!-- Array/Object Fields - Show as JSON textarea for now -->
        <div v-else-if="field.type === 'array' || field.type === 'object'" class="space-y-1">
          <label :for="`metadata-${field.name}`" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {{ field.label }}
            <span v-if="field.required" class="text-red-500">*</span>
          </label>
          <textarea
            :id="`metadata-${field.name}`"
            :value="JSON.stringify(getFieldValue(field.name) || (field.type === 'array' ? [] : {}), null, 2)"
            :placeholder="`Enter ${field.label.toLowerCase()} as JSON`"
            :disabled="disabled"
            rows="4"
            @input="updateField(field.name, JSON.parse(($event.target as HTMLTextAreaElement).value || (field.type === 'array' ? '[]' : '{}')))"
            class="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 sm:text-sm font-mono disabled:opacity-50 disabled:cursor-not-allowed"
          ></textarea>
          <p v-if="field.helpText || getFieldHelpText(template, field.name)" class="text-sm text-gray-500 dark:text-gray-400">
            {{ field.helpText || getFieldHelpText(template, field.name) }}
          </p>
          <p class="text-xs text-gray-500 dark:text-gray-400">Enter valid JSON format</p>
        </div>
      </div>
    </div>

    <!-- No Fields State -->
    <div v-else class="text-center py-8">
      <p class="text-sm text-gray-500 dark:text-gray-400">No metadata fields available for this template.</p>
    </div>
  </div>
</template>

