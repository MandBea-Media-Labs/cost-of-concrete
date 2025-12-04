---
type: "manual"
---

# UI Component Creation Guidelines - Cost of Concrete

## File Structure & Naming
- **Reusable components**: `app/components/ui/ComponentName.vue` (PascalCase)
- **Page-specific components**: `app/components/ui/page/home/ComponentName.vue`
- **Form components**: `app/components/ui/form/ComponentName.vue`
- All components auto-import (no manual imports needed, no 'Ui' prefix required)

## Script Setup Pattern
```vue
<script setup lang="ts">
// [Component purpose description]
// [Key features listed]
// [Implementation notes if needed]

interface ComponentName {
  property: string
  // ... other properties
}

// Mock data with descriptive comment
const items: ComponentName[] = [
  // ... data
]
</script>
```

### Script Requirements
- Always use `<script setup lang="ts">`
- Include 2-4 line comment block explaining component purpose
- Define TypeScript interfaces for all data structures
- Use descriptive variable names matching domain context
- Include mock data arrays when component displays lists

## Template Structure Order
```vue
<template>
  <section class="[padding] [background] [dark-mode]">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <!-- Eyebrow -->
      <!-- Heading + Controls/Buttons -->
      <!-- Main Content Grid -->
    </div>
  </section>
</template>
```

### Template Requirements
- Section wrapper: `py-20 md:py-26 lg:py-28` for padding
- Container: `mx-auto max-w-7xl px-4 sm:px-6 lg:px-8`
- Background: `bg-white dark:bg-neutral-800` (alternating sections)
- Use semantic HTML comments for major sections

## Styling Conventions

### Color Palette
- **Primary backgrounds**: `#FFFFFF`, `#F7F7F7`, `#EEEEEF`
- **Accent colors**: `#65B4FF`, `#0041D9`, `#D03C0B`
- **Text colors**: `#000000`, `#111116`, `#535364`, `#2A2A33`, `#666666`
- **Neutral scale**: `neutral-50` through `neutral-900`
- **Blue scale**: `blue-500`, `blue-600` for accents

### Typography
- **Headings**: `font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-900 dark:text-neutral-50`
- **Body text**: `text-base text-neutral-600 dark:text-neutral-300`
- **Eyebrows**: `text-xs font-semibold uppercase tracking-wide`

### Responsive Design
- Mobile-first approach (base styles = mobile)
- Breakpoints: `md:` (tablet), `lg:` (desktop)
- Tailwind class order: base → `md:` → `lg:`
- Grid patterns: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`

### Spacing
- Gap between items: `gap-6 lg:gap-8`
- Section margins: `mb-6` (eyebrow), `mb-12` (heading section)
- Padding: `p-4 md:p-6` for cards

## Component Registration
- After creating new UI component, update `app/composables/useComponentDocs.ts`
- Add component name as key with props, slots, events, examples
- Follow existing pattern in the file

## Component Props Pattern
- Use `withDefaults(defineProps<Props>(), { ... })` for props with defaults
- Document all props with JSDoc comments including `@default` tags
- Use union types for variants: `'primary' | 'secondary' | 'outline'`
- Make optional props nullable: `string | null`

## Dark Mode
- Always include dark mode variants: `dark:bg-neutral-800 dark:text-neutral-50`
- Test both light and dark modes
- Use `dark:` prefix for all color-related classes

## Common Patterns
- **v-for loops**: Use `:key="item.uniqueProperty"`
- **Conditional rendering**: `v-if` for major sections, `:class` for styling variants
- **Links**: Wrap `<Button>` in `<NuxtLink>` for navigation
- **Icons**: Use `<Icon name="heroicons:icon-name" />`
