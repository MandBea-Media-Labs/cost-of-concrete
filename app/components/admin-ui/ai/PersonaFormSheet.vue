<script setup lang="ts">
/**
 * Persona Form Sheet
 *
 * Slide-out sheet for creating/editing AI personas.
 * Uses TipTap for system prompt editing.
 */
import { z } from 'zod'
import { toast } from 'vue-sonner'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'

// =====================================================
// TYPES & SCHEMA
// =====================================================

const AI_AGENT_TYPES = ['research', 'writer', 'seo', 'qa', 'project_manager'] as const
const LLM_PROVIDERS = ['anthropic', 'openai'] as const

// Note: Avoid using .default() as it causes issues with @vee-validate/zod and Zod 4
// Use initialValues in useForm instead
const personaFormSchema = z.object({
  agentType: z.enum(AI_AGENT_TYPES),
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional(),
  systemPrompt: z.string().min(10, 'System prompt must be at least 10 characters').max(50000),
  provider: z.enum(LLM_PROVIDERS),
  model: z.string().min(1).max(100),
  temperature: z.coerce.number().min(0).max(2),
  maxTokens: z.coerce.number().int().min(100).max(100000),
  isDefault: z.boolean(),
  isEnabled: z.boolean(),
})

type PersonaFormData = z.infer<typeof personaFormSchema>

interface PersonaData {
  id: string
  agentType: string
  name: string
  description: string | null
  systemPrompt: string
  provider: string
  model: string
  temperature: number
  maxTokens: number
  isDefault: boolean
  isEnabled: boolean
}

// =====================================================
// PROPS & EMITS
// =====================================================

interface Props {
  open: boolean
  persona?: PersonaData | null
}

const props = withDefaults(defineProps<Props>(), {
  persona: null,
})

const emit = defineEmits<{
  'update:open': [value: boolean]
  'saved': []
}>()

// =====================================================
// COMPUTED
// =====================================================

const isEditMode = computed(() => !!props.persona)
const sheetTitle = computed(() => isEditMode.value ? 'Edit Persona' : 'Create Persona')

// =====================================================
// FORM SETUP
// =====================================================

const defaultValues: PersonaFormData = {
  agentType: 'writer',
  name: '',
  description: '',
  systemPrompt: '',
  provider: 'anthropic',
  model: 'claude-sonnet-4-20250514',
  temperature: 0.7,
  maxTokens: 4096,
  isDefault: false,
  isEnabled: true,
}

const { handleSubmit, errors, defineField, resetForm, isSubmitting, setValues } = useForm({
  validationSchema: toTypedSchema(personaFormSchema),
  initialValues: defaultValues,
})

const [agentType] = defineField('agentType')
const [name] = defineField('name')
const [description] = defineField('description')
const [systemPrompt] = defineField('systemPrompt')
const [provider] = defineField('provider')
const [model] = defineField('model')
const [temperature] = defineField('temperature')
const [maxTokens] = defineField('maxTokens')
const [isDefault] = defineField('isDefault')
const [isEnabled] = defineField('isEnabled')

// Watch for persona changes to populate form
watch(() => props.persona, (newPersona) => {
  if (newPersona) {
    setValues({
      agentType: newPersona.agentType as typeof AI_AGENT_TYPES[number],
      name: newPersona.name,
      description: newPersona.description || '',
      systemPrompt: newPersona.systemPrompt,
      provider: newPersona.provider as typeof LLM_PROVIDERS[number],
      model: newPersona.model,
      temperature: newPersona.temperature,
      maxTokens: newPersona.maxTokens,
      isDefault: newPersona.isDefault,
      isEnabled: newPersona.isEnabled,
    })
  } else {
    resetForm()
  }
}, { immediate: true })

// Reset form when sheet closes
watch(() => props.open, (open) => {
  if (!open) {
    resetForm()
  }
})

// =====================================================
// AGENT TYPE DISPLAY
// =====================================================

const agentTypeLabels: Record<string, string> = {
  research: 'Research',
  writer: 'Writer',
  seo: 'SEO',
  qa: 'QA',
  project_manager: 'Project Manager',
}

// =====================================================
// MODEL SUGGESTIONS
// =====================================================

const modelSuggestions = computed(() => {
  if (provider.value === 'anthropic') {
    return [
      'claude-sonnet-4-20250514',
      'claude-opus-4-20250514',
      'claude-3-5-haiku-20241022',
    ]
  }
  return [
    'gpt-4o',
    'gpt-4o-mini',
    'gpt-4-turbo',
  ]
})

// =====================================================
// FORM SUBMISSION
// =====================================================

const onSubmit = handleSubmit(async (values: PersonaFormData) => {
  try {
    if (isEditMode.value && props.persona) {
      // Update existing persona
      await $fetch(`/api/ai/personas/${props.persona.id}`, {
        method: 'PATCH',
        body: values,
      })
      toast.success('Persona updated successfully')
    } else {
      // Create new persona
      await $fetch('/api/ai/personas', {
        method: 'POST',
        body: values,
      })
      toast.success('Persona created successfully')
    }
    emit('saved')
    emit('update:open', false)
  } catch (err: any) {
    toast.error('Failed to save persona', { description: err?.data?.message || err?.message })
  }
})
</script>

<template>
  <UiSheet :open="open" @update:open="emit('update:open', $event)">
    <UiSheetContent side="right" class="w-full sm:max-w-xl overflow-hidden flex flex-col p-6">
      <UiSheetHeader class="flex-shrink-0 pb-4">
        <UiSheetTitle>{{ sheetTitle }}</UiSheetTitle>
        <UiSheetDescription>
          Configure the AI agent's personality, system prompt, and model settings.
        </UiSheetDescription>
      </UiSheetHeader>

      <form class="flex flex-1 flex-col overflow-hidden" @submit="onSubmit">
        <!-- Scrollable Content -->
        <div class="flex-1 overflow-y-auto min-h-0">
          <div class="space-y-5 py-4">
            <!-- Agent Type -->
            <div>
              <label class="mb-1.5 block text-sm font-medium">Agent Type</label>
              <UiSelect v-model="agentType" :disabled="isEditMode">
                <UiSelectTrigger class="w-full">
                  <UiSelectValue placeholder="Select agent type" />
                </UiSelectTrigger>
                <UiSelectContent>
                  <UiSelectItem v-for="type in AI_AGENT_TYPES" :key="type" :value="type">
                    {{ agentTypeLabels[type] }}
                  </UiSelectItem>
                </UiSelectContent>
              </UiSelect>
              <p v-if="errors.agentType" class="mt-1 text-xs text-destructive">{{ errors.agentType }}</p>
            </div>

            <!-- Name -->
            <div>
              <label class="mb-1.5 block text-sm font-medium">Name</label>
              <UiInput v-model="name" placeholder="e.g., Creative Writer" :class="{ 'border-destructive': errors.name }" />
              <p v-if="errors.name" class="mt-1 text-xs text-destructive">{{ errors.name }}</p>
            </div>

            <!-- Description -->
            <div>
              <label class="mb-1.5 block text-sm font-medium">Description</label>
              <UiTextarea v-model="description" placeholder="Optional description..." rows="2" />
              <p v-if="errors.description" class="mt-1 text-xs text-destructive">{{ errors.description }}</p>
            </div>

            <!-- System Prompt -->
            <div>
              <label class="mb-1.5 block text-sm font-medium">System Prompt</label>
              <TipTapEditor
                v-model="systemPrompt"
                placeholder="Enter the system prompt for this persona..."
                :show-toolbar="true"
                class="min-h-[200px]"
              />
              <p v-if="errors.systemPrompt" class="mt-1 text-xs text-destructive">{{ errors.systemPrompt }}</p>
            </div>

            <!-- Provider & Model -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="mb-1.5 block text-sm font-medium">Provider</label>
                <UiSelect v-model="provider">
                  <UiSelectTrigger class="w-full">
                    <UiSelectValue />
                  </UiSelectTrigger>
                  <UiSelectContent>
                    <UiSelectItem value="anthropic">Anthropic</UiSelectItem>
                    <UiSelectItem value="openai">OpenAI</UiSelectItem>
                  </UiSelectContent>
                </UiSelect>
              </div>
              <div>
                <label class="mb-1.5 block text-sm font-medium">Model</label>
                <UiInput v-model="model" placeholder="Model name" list="model-suggestions" />
                <datalist id="model-suggestions">
                  <option v-for="m in modelSuggestions" :key="m" :value="m" />
                </datalist>
              </div>
            </div>

            <!-- Temperature & Max Tokens -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="mb-1.5 block text-sm font-medium">Temperature</label>
                <UiInput v-model="temperature" type="number" min="0" max="2" step="0.1" />
                <p class="mt-1 text-xs text-muted-foreground">0 = deterministic, 2 = creative</p>
              </div>
              <div>
                <label class="mb-1.5 block text-sm font-medium">Max Tokens</label>
                <UiInput v-model="maxTokens" type="number" min="100" max="100000" step="100" />
              </div>
            </div>

            <!-- Toggles -->
            <div class="flex items-center gap-6">
              <label class="flex cursor-pointer items-center gap-2">
                <UiSwitch v-model:checked="isDefault" />
                <span class="text-sm">Default for agent type</span>
              </label>
              <label class="flex cursor-pointer items-center gap-2">
                <UiSwitch v-model:checked="isEnabled" />
                <span class="text-sm">Enabled</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex-shrink-0 pt-4 border-t border-border">
          <div class="flex items-center justify-end gap-2">
            <UiButton type="button" variant="outline" @click="emit('update:open', false)">
              Cancel
            </UiButton>
            <UiButton type="submit" :disabled="isSubmitting">
              <Icon v-if="isSubmitting" name="i-lucide-loader-2" class="mr-1.5 size-4 animate-spin" />
              {{ isEditMode ? 'Save Changes' : 'Create Persona' }}
            </UiButton>
          </div>
        </div>
      </form>
    </UiSheetContent>
  </UiSheet>
</template>
