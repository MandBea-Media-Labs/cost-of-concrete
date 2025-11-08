<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import { watch } from 'vue'

interface Props {
  /**
   * The content of the editor (HTML or Markdown)
   */
  modelValue: string

  /**
   * Placeholder text when editor is empty
   * @default 'Start writing...'
   */
  placeholder?: string

  /**
   * Whether the editor is disabled
   * @default false
   */
  disabled?: boolean

  /**
   * Whether to show the toolbar
   * @default true
   */
  showToolbar?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Start writing...',
  disabled: false,
  showToolbar: true
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

// =====================================================
// EDITOR SETUP
// =====================================================

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit.configure({
      heading: {
        levels: [1, 2, 3, 4, 5, 6]
      }
    })
  ],
  editable: !props.disabled,
  onUpdate: ({ editor }) => {
    emit('update:modelValue', editor.getHTML())
  }
})

// =====================================================
// WATCH FOR EXTERNAL CHANGES
// =====================================================

watch(() => props.modelValue, (newValue) => {
  if (!editor.value) return

  const isSame = editor.value.getHTML() === newValue
  if (isSame) return

  editor.value.commands.setContent(newValue, false)
})

watch(() => props.disabled, (newDisabled) => {
  if (!editor.value) return
  editor.value.setEditable(!newDisabled)
})

// =====================================================
// TOOLBAR ACTIONS
// =====================================================

function toggleBold() {
  editor.value?.chain().focus().toggleBold().run()
}

function toggleItalic() {
  editor.value?.chain().focus().toggleItalic().run()
}

function toggleStrike() {
  editor.value?.chain().focus().toggleStrike().run()
}

function toggleCode() {
  editor.value?.chain().focus().toggleCode().run()
}

function toggleHeading(level: 1 | 2 | 3 | 4 | 5 | 6) {
  editor.value?.chain().focus().toggleHeading({ level }).run()
}

function setParagraph() {
  editor.value?.chain().focus().setParagraph().run()
}

function toggleBulletList() {
  editor.value?.chain().focus().toggleBulletList().run()
}

function toggleOrderedList() {
  editor.value?.chain().focus().toggleOrderedList().run()
}

function toggleCodeBlock() {
  editor.value?.chain().focus().toggleCodeBlock().run()
}

function toggleBlockquote() {
  editor.value?.chain().focus().toggleBlockquote().run()
}

function setHorizontalRule() {
  editor.value?.chain().focus().setHorizontalRule().run()
}

function undo() {
  editor.value?.chain().focus().undo().run()
}

function redo() {
  editor.value?.chain().focus().redo().run()
}
</script>

<template>
  <div v-if="editor" class="tiptap-editor border border-neutral-300 dark:border-neutral-600 rounded-lg overflow-hidden bg-white dark:bg-neutral-800">
    <!-- Toolbar -->
    <div v-if="showToolbar" class="toolbar flex flex-wrap items-center gap-1 p-2 border-b border-neutral-300 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-900">
      <!-- Undo/Redo -->
      <button
        type="button"
        @click="undo"
        :disabled="!editor.can().undo()"
        class="toolbar-btn"
        title="Undo"
      >
        <Icon name="heroicons:arrow-uturn-left" class="h-4 w-4" />
      </button>
      <button
        type="button"
        @click="redo"
        :disabled="!editor.can().redo()"
        class="toolbar-btn"
        title="Redo"
      >
        <Icon name="heroicons:arrow-uturn-right" class="h-4 w-4" />
      </button>

      <div class="w-px h-6 bg-neutral-300 dark:bg-neutral-600 mx-1" />

      <!-- Text Formatting -->
      <button
        type="button"
        @click="toggleBold"
        :class="{ 'is-active': editor.isActive('bold') }"
        class="toolbar-btn"
        title="Bold"
      >
        <Icon name="heroicons:bold" class="h-4 w-4" />
      </button>
      <button
        type="button"
        @click="toggleItalic"
        :class="{ 'is-active': editor.isActive('italic') }"
        class="toolbar-btn"
        title="Italic"
      >
        <Icon name="heroicons:italic" class="h-4 w-4" />
      </button>
      <button
        type="button"
        @click="toggleStrike"
        :class="{ 'is-active': editor.isActive('strike') }"
        class="toolbar-btn"
        title="Strikethrough"
      >
        <Icon name="heroicons:strikethrough" class="h-4 w-4" />
      </button>
      <button
        type="button"
        @click="toggleCode"
        :class="{ 'is-active': editor.isActive('code') }"
        class="toolbar-btn"
        title="Inline Code"
      >
        <Icon name="heroicons:code-bracket" class="h-4 w-4" />
      </button>

      <div class="w-px h-6 bg-neutral-300 dark:bg-neutral-600 mx-1" />

      <!-- Headings -->
      <button
        type="button"
        @click="setParagraph"
        :class="{ 'is-active': editor.isActive('paragraph') }"
        class="toolbar-btn"
        title="Paragraph"
      >
        <span class="text-xs font-medium">P</span>
      </button>
      <button
        type="button"
        @click="toggleHeading(1)"
        :class="{ 'is-active': editor.isActive('heading', { level: 1 }) }"
        class="toolbar-btn"
        title="Heading 1"
      >
        <span class="text-xs font-bold">H1</span>
      </button>
      <button
        type="button"
        @click="toggleHeading(2)"
        :class="{ 'is-active': editor.isActive('heading', { level: 2 }) }"
        class="toolbar-btn"
        title="Heading 2"
      >
        <span class="text-xs font-bold">H2</span>
      </button>
      <button
        type="button"
        @click="toggleHeading(3)"
        :class="{ 'is-active': editor.isActive('heading', { level: 3 }) }"
        class="toolbar-btn"
        title="Heading 3"
      >
        <span class="text-xs font-bold">H3</span>
      </button>

      <div class="w-px h-6 bg-neutral-300 dark:bg-neutral-600 mx-1" />

      <!-- Lists -->
      <button
        type="button"
        @click="toggleBulletList"
        :class="{ 'is-active': editor.isActive('bulletList') }"
        class="toolbar-btn"
        title="Bullet List"
      >
        <Icon name="heroicons:list-bullet" class="h-4 w-4" />
      </button>
      <button
        type="button"
        @click="toggleOrderedList"
        :class="{ 'is-active': editor.isActive('orderedList') }"
        class="toolbar-btn"
        title="Numbered List"
      >
        <Icon name="heroicons:numbered-list" class="h-4 w-4" />
      </button>

      <div class="w-px h-6 bg-neutral-300 dark:bg-neutral-600 mx-1" />

      <!-- Blocks -->
      <button
        type="button"
        @click="toggleCodeBlock"
        :class="{ 'is-active': editor.isActive('codeBlock') }"
        class="toolbar-btn"
        title="Code Block"
      >
        <Icon name="heroicons:code-bracket-square" class="h-4 w-4" />
      </button>
      <button
        type="button"
        @click="toggleBlockquote"
        :class="{ 'is-active': editor.isActive('blockquote') }"
        class="toolbar-btn"
        title="Blockquote"
      >
        <Icon name="heroicons:chat-bubble-left-right" class="h-4 w-4" />
      </button>
      <button
        type="button"
        @click="setHorizontalRule"
        class="toolbar-btn"
        title="Horizontal Rule"
      >
        <Icon name="heroicons:minus" class="h-4 w-4" />
      </button>
    </div>

    <!-- Editor Content -->
    <EditorContent :editor="editor" class="prose prose-sm dark:prose-invert max-w-none p-4 min-h-[300px] focus:outline-none" />
  </div>
</template>

<style scoped>
.toolbar-btn {
  @apply p-2 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors;
}

.toolbar-btn.is-active {
  @apply bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300;
}

/* TipTap Editor Styles */
:deep(.tiptap) {
  @apply focus:outline-none;
}

:deep(.tiptap p.is-editor-empty:first-child::before) {
  content: attr(data-placeholder);
  @apply text-neutral-400 dark:text-neutral-500 float-left h-0 pointer-events-none;
}

:deep(.tiptap h1) {
  @apply text-3xl font-bold mt-6 mb-4;
}

:deep(.tiptap h2) {
  @apply text-2xl font-bold mt-5 mb-3;
}

:deep(.tiptap h3) {
  @apply text-xl font-bold mt-4 mb-2;
}

:deep(.tiptap h4) {
  @apply text-lg font-semibold mt-3 mb-2;
}

:deep(.tiptap h5) {
  @apply text-base font-semibold mt-2 mb-1;
}

:deep(.tiptap h6) {
  @apply text-sm font-semibold mt-2 mb-1;
}

:deep(.tiptap ul) {
  @apply list-disc list-inside my-4;
}

:deep(.tiptap ol) {
  @apply list-decimal list-inside my-4;
}

:deep(.tiptap code) {
  @apply bg-neutral-100 dark:bg-neutral-700 text-red-600 dark:text-red-400 px-1 py-0.5 rounded text-sm;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}

:deep(.tiptap pre) {
  @apply bg-neutral-900 dark:bg-neutral-950 text-neutral-100 p-4 rounded-lg my-4 overflow-x-auto;
}

:deep(.tiptap pre code) {
  @apply bg-transparent text-neutral-100 p-0;
}

:deep(.tiptap blockquote) {
  @apply border-l-4 border-neutral-300 dark:border-neutral-600 pl-4 italic my-4 text-neutral-600 dark:text-neutral-400;
}

:deep(.tiptap hr) {
  @apply border-t border-neutral-300 dark:border-neutral-600 my-6;
}

:deep(.tiptap a) {
  @apply text-blue-600 dark:text-blue-400 underline hover:text-blue-700 dark:hover:text-blue-300;
}

:deep(.tiptap strong) {
  @apply font-bold;
}

:deep(.tiptap em) {
  @apply italic;
}

:deep(.tiptap s) {
  @apply line-through;
}
</style>
