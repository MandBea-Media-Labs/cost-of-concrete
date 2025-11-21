# Phase 7 - Batch 7: Auto-save Drafts

**Priority:** 3 (Content Management Feature)
**Status:** 🔜 Not Started
**Effort:** 3-4 hours
**Dependencies:** None

---

## 🎯 Goal

Implement auto-save functionality to prevent data loss when editing pages, automatically saving drafts every 30 seconds.

---

## 📋 Current State

**Problem:**
- No auto-save functionality
- Risk of losing work if browser crashes
- Must manually click "Save" frequently
- No indication of unsaved changes

**Use Case:**
Admin spends 30 minutes editing a page, browser crashes, all work is lost.

---

## 🎯 Objectives

1. Auto-save form data every 30 seconds
2. Show "Saving..." indicator during save
3. Show "All changes saved" when complete
4. Debounce saves to prevent excessive API calls
5. Detect unsaved changes on page leave
6. Store backup in localStorage as fallback
7. Handle save conflicts (if page edited elsewhere)

---

## 📦 Tasks

### 1. Create Auto-save Composable
- [ ] Create `app/composables/useAutoSave.ts`
- [ ] Accept save function and interval (default 30s)
- [ ] Track dirty state (has unsaved changes)
- [ ] Debounce saves (wait for user to stop typing)
- [ ] Return save status: 'idle', 'saving', 'saved', 'error'

### 2. Add Auto-save to Edit Page
- [ ] Integrate useAutoSave in edit page
- [ ] Pass PATCH function as save callback
- [ ] Set interval to 30 seconds
- [ ] Only auto-save if form is dirty
- [ ] Don't auto-save if validation fails

### 3. Add Save Status Indicator
- [ ] Show "Saving..." when saving
- [ ] Show "All changes saved" when complete
- [ ] Show "Failed to save" on error
- [ ] Show timestamp of last save
- [ ] Position in top-right of form

### 4. Add Unsaved Changes Warning
- [ ] Detect when form has unsaved changes
- [ ] Show browser confirmation on page leave
- [ ] "You have unsaved changes. Leave anyway?"
- [ ] Disable warning after successful save

### 5. Add localStorage Backup
- [ ] Save form data to localStorage on every change
- [ ] Key: `page-draft-${pageId}`
- [ ] On page load, check for backup
- [ ] If backup exists and newer than server, offer to restore
- [ ] Clear backup after successful save

### 6. Handle Save Conflicts
- [ ] Track `updated_at` timestamp
- [ ] On save, check if server version is newer
- [ ] If conflict, show dialog: "Page was edited elsewhere"
- [ ] Options: "Overwrite", "Reload", "Compare"
- [ ] Prevent data loss

### 7. Testing
- [ ] Test auto-save triggers after 30s
- [ ] Test debouncing (stops saving while typing)
- [ ] Test save status indicator updates
- [ ] Test unsaved changes warning
- [ ] Test localStorage backup/restore
- [ ] Test conflict detection
- [ ] Test manual save still works

---

## 🛠️ Technical Implementation

### useAutoSave Composable
```typescript
// app/composables/useAutoSave.ts
export function useAutoSave(
  saveFn: () => Promise<void>,
  options: {
    interval?: number // milliseconds
    debounce?: number // milliseconds
  } = {}
) {
  const { interval = 30000, debounce = 1000 } = options
  
  const isDirty = ref(false)
  const saveStatus = ref<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const lastSaved = ref<Date | null>(null)
  
  let saveTimer: NodeJS.Timeout | null = null
  let debounceTimer: NodeJS.Timeout | null = null
  
  const save = async () => {
    if (!isDirty.value) return
    
    try {
      saveStatus.value = 'saving'
      await saveFn()
      saveStatus.value = 'saved'
      lastSaved.value = new Date()
      isDirty.value = false
      
      // Reset to idle after 3 seconds
      setTimeout(() => {
        if (saveStatus.value === 'saved') {
          saveStatus.value = 'idle'
        }
      }, 3000)
    } catch (error) {
      saveStatus.value = 'error'
      console.error('Auto-save failed:', error)
    }
  }
  
  const debouncedSave = () => {
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(save, debounce)
  }
  
  const startAutoSave = () => {
    saveTimer = setInterval(() => {
      if (isDirty.value) {
        save()
      }
    }, interval)
  }
  
  const stopAutoSave = () => {
    if (saveTimer) clearInterval(saveTimer)
    if (debounceTimer) clearTimeout(debounceTimer)
  }
  
  const markDirty = () => {
    isDirty.value = true
    debouncedSave()
  }
  
  onMounted(startAutoSave)
  onUnmounted(stopAutoSave)
  
  return {
    isDirty,
    saveStatus,
    lastSaved,
    markDirty,
    save
  }
}
```

### Save Status Indicator
```vue
<template>
  <div class="flex items-center gap-2 text-sm">
    <Icon
      v-if="saveStatus === 'saving'"
      name="lucide:loader-2"
      class="w-4 h-4 animate-spin text-blue-500"
    />
    <Icon
      v-else-if="saveStatus === 'saved'"
      name="lucide:check"
      class="w-4 h-4 text-green-500"
    />
    <Icon
      v-else-if="saveStatus === 'error'"
      name="lucide:alert-circle"
      class="w-4 h-4 text-red-500"
    />
    
    <span v-if="saveStatus === 'saving'" class="text-gray-600 dark:text-gray-400">
      Saving...
    </span>
    <span v-else-if="saveStatus === 'saved'" class="text-gray-600 dark:text-gray-400">
      All changes saved
      <span v-if="lastSaved" class="text-xs">
        ({{ formatRelativeTime(lastSaved) }})
      </span>
    </span>
    <span v-else-if="saveStatus === 'error'" class="text-red-600 dark:text-red-400">
      Failed to save
    </span>
  </div>
</template>
```

### Unsaved Changes Warning
```typescript
// In edit page
const { isDirty } = useAutoSave(savePage)

onBeforeRouteLeave((to, from, next) => {
  if (isDirty.value) {
    const confirmed = window.confirm('You have unsaved changes. Leave anyway?')
    next(confirmed)
  } else {
    next()
  }
})

// Browser navigation
onBeforeUnmount(() => {
  if (isDirty.value) {
    window.onbeforeunload = (e) => {
      e.preventDefault()
      e.returnValue = ''
    }
  }
})
```

### localStorage Backup
```typescript
// Save to localStorage on change
watch(formData, (newData) => {
  localStorage.setItem(`page-draft-${pageId.value}`, JSON.stringify({
    data: newData,
    timestamp: Date.now()
  }))
}, { deep: true })

// Check for backup on load
onMounted(() => {
  const backup = localStorage.getItem(`page-draft-${pageId.value}`)
  if (backup) {
    const { data, timestamp } = JSON.parse(backup)
    if (timestamp > page.value.updated_at) {
      // Offer to restore
      const restore = confirm('Found unsaved changes. Restore?')
      if (restore) {
        formData.value = data
      }
    }
  }
})

// Clear backup after save
const clearBackup = () => {
  localStorage.removeItem(`page-draft-${pageId.value}`)
}
```

---

## 📁 Files to Create

- `app/composables/useAutoSave.ts` (~150 lines)

## 📁 Files to Modify

- `app/pages/admin/pages/[id]/edit.vue` (integrate auto-save)
- `app/components/admin/PageForm.vue` (add save status indicator)

---

## ✅ Deliverables

1. ✅ Auto-save every 30 seconds
2. ✅ Save status indicator
3. ✅ Unsaved changes warning
4. ✅ localStorage backup
5. ✅ Conflict detection
6. ✅ Debounced saves

---

## 🧪 Testing Strategy

1. Edit page → wait 30s → verify auto-save
2. Type continuously → verify debouncing
3. Check save status → verify "Saving..." → "All changes saved"
4. Try to leave page → verify unsaved changes warning
5. Refresh page → verify localStorage restore prompt
6. Edit page in two tabs → verify conflict detection

---

## 🚀 Next Steps

After completion, proceed to Priority 4 (Batch 8 - Performance Testing)

