<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { consola } from 'consola'
import { menuItemFormSchema, menuItemFormDefaultValues, type MenuItemFormData } from '~/schemas/admin/menu-item-form.schema'
import type { Database } from '~/types/supabase'

type MenuItem = Database['public']['Tables']['menu_items']['Row']
type Page = Database['public']['Tables']['pages']['Row']

interface Props {
  /**
   * Menu ID (required for creating items)
   */
  menuId: string

  /**
   * Initial form data (for edit mode)
   */
  initialData?: Partial<MenuItemFormData>

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
   * Available parent items (for parent dropdown)
   */
  parentItems?: MenuItem[]

  /**
   * Available pages (for page link dropdown)
   */
  pages?: Page[]
}

const props = withDefaults(defineProps<Props>(), {
  initialData: undefined,
  isEditMode: false,
  isSubmitting: false,
  parentItems: () => [],
  pages: () => []
})

const emit = defineEmits<{
  'submit': [data: MenuItemFormData]
  'cancel': []
}>()

// =====================================================
// FORM SETUP
// =====================================================

const { values, errors, defineField, handleSubmit, setFieldValue } = useForm({
  validationSchema: toTypedSchema(menuItemFormSchema),
  initialValues: props.initialData || menuItemFormDefaultValues
})

// Define form fields with VeeValidate
const [label, labelAttrs] = defineField('label')
const [linkType, linkTypeAttrs] = defineField('link_type')
const [pageId, pageIdAttrs] = defineField('page_id')
const [customUrl, customUrlAttrs] = defineField('custom_url')
const [description, descriptionAttrs] = defineField('description')
const [parentId, parentIdAttrs] = defineField('parent_id')
const [openInNewTab, openInNewTabAttrs] = defineField('open_in_new_tab')
const [isEnabled, isEnabledAttrs] = defineField('is_enabled')

// =====================================================
// CONDITIONAL FIELD LOGIC
// =====================================================

// Clear page_id when switching to custom URL
watch(linkType, (newType) => {
  if (newType === 'custom') {
    setFieldValue('page_id', null)
  } else {
    setFieldValue('custom_url', null)
  }
})

// Show description field only if parent is selected
const showDescription = computed(() => !!parentId.value)

// =====================================================
// FORM SUBMISSION
// =====================================================

const onSubmit = handleSubmit((formData) => {
  if (import.meta.client && import.meta.dev) {
    consola.info('[MenuItemForm] Form submitted:', formData)
  }
  emit('submit', formData)
})

const onCancel = () => {
  emit('cancel')
}
</script>

<template>
  <form
    @submit.prevent="onSubmit"
    class="space-y-6"
  >
    <!-- Label Field -->
    <div>
      <label
        for="label"
        class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2"
      >
        Label <span class="text-red-500">*</span>
      </label>
      <input
        id="label"
        v-model="label"
        v-bind="labelAttrs"
        type="text"
        placeholder="Home"
        class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-neutral-800 dark:border-neutral-600 dark:text-neutral-100"
        :class="{ 'border-red-500': errors.label }"
      />
      <p
        v-if="errors.label"
        class="mt-1 text-sm text-red-600 dark:text-red-400"
      >
        {{ errors.label }}
      </p>
    </div>

    <!-- Link Type Radio Buttons -->
    <div class="space-y-3">
      <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
        Link Type <span class="text-red-500">*</span>
      </label>

      <div class="flex items-center gap-2">
        <input
          id="link_type_page"
          v-model="linkType"
          v-bind="linkTypeAttrs"
          type="radio"
          value="page"
          class="h-4 w-4 border-neutral-300 text-blue-600 focus:ring-blue-500 dark:border-neutral-600 dark:bg-neutral-800"
        />
        <label
          for="link_type_page"
          class="text-sm text-neutral-700 dark:text-neutral-300"
        >
          Page Link
        </label>
      </div>

      <div class="flex items-center gap-2">
        <input
          id="link_type_custom"
          v-model="linkType"
          v-bind="linkTypeAttrs"
          type="radio"
          value="custom"
          class="h-4 w-4 border-neutral-300 text-blue-600 focus:ring-blue-500 dark:border-neutral-600 dark:bg-neutral-800"
        />
        <label
          for="link_type_custom"
          class="text-sm text-neutral-700 dark:text-neutral-300"
        >
          Custom URL
        </label>
      </div>

      <p
        v-if="errors.link_type"
        class="mt-1 text-sm text-red-600 dark:text-red-400"
      >
        {{ errors.link_type }}
      </p>
    </div>

    <!-- Page Link Dropdown (conditional) -->
    <div v-if="linkType === 'page'">
      <label
        for="page_id"
        class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2"
      >
        Select Page <span class="text-red-500">*</span>
      </label>
      <select
        id="page_id"
        v-model="pageId"
        v-bind="pageIdAttrs"
        class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-neutral-800 dark:border-neutral-600 dark:text-neutral-100"
        :class="{ 'border-red-500': errors.page_id }"
      >
        <option :value="null">
          Select a page...
        </option>
        <option
          v-for="page in pages"
          :key="page.id"
          :value="page.id"
        >
          {{ page.title }} ({{ page.full_path }})
        </option>
      </select>
      <p
        v-if="errors.page_id"
        class="mt-1 text-sm text-red-600 dark:text-red-400"
      >
        {{ errors.page_id }}
      </p>
    </div>

    <!-- Custom URL Field (conditional) -->
    <div v-if="linkType === 'custom'">
      <label
        for="custom_url"
        class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2"
      >
        Custom URL <span class="text-red-500">*</span>
      </label>
      <input
        id="custom_url"
        v-model="customUrl"
        v-bind="customUrlAttrs"
        type="url"
        placeholder="https://example.com"
        class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-neutral-800 dark:border-neutral-600 dark:text-neutral-100"
        :class="{ 'border-red-500': errors.custom_url }"
      />
      <p
        v-if="errors.custom_url"
        class="mt-1 text-sm text-red-600 dark:text-red-400"
      >
        {{ errors.custom_url }}
      </p>

      <!-- Open in New Tab (only for custom URLs) -->
      <div class="flex items-center gap-2 mt-3">
        <input
          id="open_in_new_tab"
          v-model="openInNewTab"
          v-bind="openInNewTabAttrs"
          type="checkbox"
          class="h-4 w-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500 dark:border-neutral-600 dark:bg-neutral-800"
        />
        <label
          for="open_in_new_tab"
          class="text-sm text-neutral-700 dark:text-neutral-300"
        >
          Open in new tab
        </label>
      </div>
    </div>

    <!-- Parent Item Dropdown -->
    <div>
      <label
        for="parent_id"
        class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2"
      >
        Parent Item (Optional)
      </label>
      <select
        id="parent_id"
        v-model="parentId"
        v-bind="parentIdAttrs"
        class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-neutral-800 dark:border-neutral-600 dark:text-neutral-100"
        :class="{ 'border-red-500': errors.parent_id }"
      >
        <option :value="null">
          None (Top-level item)
        </option>
        <option
          v-for="item in parentItems"
          :key="item.id"
          :value="item.id"
        >
          {{ item.label }}
        </option>
      </select>
      <p
        v-if="errors.parent_id"
        class="mt-1 text-sm text-red-600 dark:text-red-400"
      >
        {{ errors.parent_id }}
      </p>
      <p class="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
        Select a parent to create a nested menu item (1 level deep only)
      </p>
    </div>

    <!-- Description Field (conditional - only if parent is selected) -->
    <div v-if="showDescription">
      <label
        for="description"
        class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2"
      >
        Description
      </label>
      <textarea
        id="description"
        v-model="description"
        v-bind="descriptionAttrs"
        rows="3"
        placeholder="Optional description for this menu item"
        class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-neutral-800 dark:border-neutral-600 dark:text-neutral-100"
        :class="{ 'border-red-500': errors.description }"
      />
      <p
        v-if="errors.description"
        class="mt-1 text-sm text-red-600 dark:text-red-400"
      >
        {{ errors.description }}
      </p>
    </div>

    <!-- Enabled Checkbox -->
    <div class="flex items-center gap-2">
      <input
        id="is_enabled"
        v-model="isEnabled"
        v-bind="isEnabledAttrs"
        type="checkbox"
        class="h-4 w-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500 dark:border-neutral-600 dark:bg-neutral-800"
      />
      <label
        for="is_enabled"
        class="text-sm text-neutral-700 dark:text-neutral-300"
      >
        Enable this menu item
      </label>
    </div>

    <!-- Form Actions -->
    <div class="flex items-center justify-end gap-3 pt-6 border-t border-neutral-200 dark:border-neutral-700">
      <Button
        text="Cancel"
        variant="ghost"
        type="button"
        @click="onCancel"
        :disabled="isSubmitting"
      />
      <Button
        :text="isEditMode ? 'Update Item' : 'Create Item'"
        variant="primary"
        type="submit"
        :disabled="isSubmitting"
      />
    </div>
  </form>
</template>
