<script setup lang="ts">
import { Switch } from '~/components/admin-ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/admin-ui/select'
import { Button } from '~/components/admin-ui/button'
import {
  DAYS_OF_WEEK,
  DAY_LABELS,
  TIME_OPTIONS,
  type BusinessHours,
  type DayOfWeek,
  type DayHours,
} from '~/schemas/owner/contractor-form.schema'

interface Props {
  modelValue: BusinessHours | null | undefined
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [hours: BusinessHours]
}>()

// Internal state for each day
const dayStates = reactive<Record<DayOfWeek, { isOpen: boolean; open: string; close: string }>>({
  monday: { isOpen: false, open: '9:00 AM', close: '5:00 PM' },
  tuesday: { isOpen: false, open: '9:00 AM', close: '5:00 PM' },
  wednesday: { isOpen: false, open: '9:00 AM', close: '5:00 PM' },
  thursday: { isOpen: false, open: '9:00 AM', close: '5:00 PM' },
  friday: { isOpen: false, open: '9:00 AM', close: '5:00 PM' },
  saturday: { isOpen: false, open: '9:00 AM', close: '5:00 PM' },
  sunday: { isOpen: false, open: '9:00 AM', close: '5:00 PM' },
})

// Initialize from modelValue
watch(
  () => props.modelValue,
  (newVal) => {
    if (!newVal) return
    for (const day of DAYS_OF_WEEK) {
      const hours = newVal[day]
      if (hours && hours.open && hours.close) {
        dayStates[day].isOpen = true
        dayStates[day].open = hours.open
        dayStates[day].close = hours.close
      } else {
        dayStates[day].isOpen = false
      }
    }
  },
  { immediate: true }
)

// Emit changes
function emitUpdate() {
  const result: BusinessHours = {}
  for (const day of DAYS_OF_WEEK) {
    if (dayStates[day].isOpen) {
      result[day] = {
        open: dayStates[day].open,
        close: dayStates[day].close,
      }
    } else {
      result[day] = null
    }
  }
  emit('update:modelValue', result)
}

// Toggle day open/closed
function toggleDay(day: DayOfWeek, isOpen: boolean) {
  dayStates[day].isOpen = isOpen
  emitUpdate()
}

// Update time
function updateTime(day: DayOfWeek, field: 'open' | 'close', value: string) {
  dayStates[day][field] = value
  emitUpdate()
}

// Copy Monday to weekdays
function copyMondayToWeekdays() {
  const monday = dayStates.monday
  const weekdays: DayOfWeek[] = ['tuesday', 'wednesday', 'thursday', 'friday']
  for (const day of weekdays) {
    dayStates[day].isOpen = monday.isOpen
    dayStates[day].open = monday.open
    dayStates[day].close = monday.close
  }
  emitUpdate()
}
</script>

<template>
  <div class="space-y-2">
    <!-- Header row -->
    <div class="grid grid-cols-[100px_1fr_80px] gap-2 text-xs font-medium text-muted-foreground px-1">
      <span>Day</span>
      <span>Hours</span>
      <span class="text-right">Status</span>
    </div>

    <!-- Day rows -->
    <div class="space-y-1.5">
      <div
        v-for="day in DAYS_OF_WEEK"
        :key="day"
        class="grid grid-cols-[100px_1fr_80px] gap-2 items-center py-1.5 px-1 rounded-md hover:bg-muted/50"
      >
        <!-- Day label -->
        <span class="text-sm font-medium">{{ DAY_LABELS[day] }}</span>

        <!-- Time selectors (only show when open) -->
        <div v-if="dayStates[day].isOpen" class="flex items-center gap-1.5">
          <Select
            :model-value="dayStates[day].open"
            @update:model-value="(v: string) => updateTime(day, 'open', v)"
          >
            <SelectTrigger class="h-8 w-[100px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="time in TIME_OPTIONS" :key="time" :value="time">
                {{ time }}
              </SelectItem>
            </SelectContent>
          </Select>
          <span class="text-muted-foreground text-xs">to</span>
          <Select
            :model-value="dayStates[day].close"
            @update:model-value="(v: string) => updateTime(day, 'close', v)"
          >
            <SelectTrigger class="h-8 w-[100px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="time in TIME_OPTIONS" :key="time" :value="time">
                {{ time }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div v-else class="text-sm text-muted-foreground italic">
          Closed
        </div>

        <!-- Open/Closed toggle -->
        <div class="flex justify-end">
          <Switch
            :checked="dayStates[day].isOpen"
            @update:checked="(v: boolean) => toggleDay(day, v)"
          />
        </div>
      </div>
    </div>

    <!-- Copy to weekdays button -->
    <div class="pt-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        class="text-xs"
        @click="copyMondayToWeekdays"
      >
        Copy Monday to weekdays
      </Button>
    </div>
  </div>
</template>

