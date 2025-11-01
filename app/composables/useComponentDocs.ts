export interface PropDefinition {
  name: string
  type: string
  required?: boolean
  default?: string
  description: string
}

export interface SlotDefinition {
  name: string
  description: string
}

export interface EventDefinition {
  name: string
  payload: string
  description: string
}

export interface UsageExample {
  title: string
  code: string
}

export interface ComponentDoc {
  props?: PropDefinition[]
  slots?: SlotDefinition[]
  events?: EventDefinition[]
  examples?: UsageExample[]
}

export const useComponentDocs = () => {
  const docs: Record<string, ComponentDoc> = {
    Button: {
      props: [
        { 
          name: 'text', 
          type: 'string', 
          required: true, 
          description: 'The text to display on the button' 
        },
        { 
          name: 'variant', 
          type: "'primary' | 'secondary' | 'primary-outline' | 'secondary-outline'", 
          default: "'primary'", 
          description: 'The visual variant of the button' 
        },
        { 
          name: 'size', 
          type: "'sm' | 'md' | 'lg' | 'xl'", 
          default: "'md'", 
          description: 'The size of the button' 
        },
        { 
          name: 'location', 
          type: 'string | null', 
          default: 'null', 
          description: 'The route to navigate to when clicked. If null, button does nothing on click.' 
        },
        { 
          name: 'disabled', 
          type: 'boolean', 
          default: 'false', 
          description: 'Whether the button is disabled' 
        },
      ],
      examples: [
        {
          title: 'Basic Usage',
          code: `<Button text="Click Me" variant="primary" size="md" />`
        },
        {
          title: 'With Navigation',
          code: `<Button text="Go Home" location="/" variant="secondary" />`
        },
        {
          title: 'Disabled State',
          code: `<Button text="Disabled" :disabled="true" />`
        }
      ]
    },

    Dialog: {
      props: [
        { 
          name: 'triggerText', 
          type: 'string', 
          description: 'The trigger text for the default button' 
        },
        { 
          name: 'title', 
          type: 'string', 
          description: 'The dialog title (can also use #title slot)' 
        },
        { 
          name: 'description', 
          type: 'string', 
          description: 'The dialog description (can also use #description slot)' 
        },
        { 
          name: 'showOverlay', 
          type: 'boolean', 
          default: 'true', 
          description: 'Whether to show the overlay backdrop' 
        },
        { 
          name: 'closeOnOverlayClick', 
          type: 'boolean', 
          default: 'true', 
          description: 'Whether clicking the overlay closes the dialog' 
        },
        { 
          name: 'showCloseButton', 
          type: 'boolean', 
          default: 'true', 
          description: 'Whether to show the close button (X)' 
        },
        { 
          name: 'size', 
          type: "'sm' | 'md' | 'lg' | 'xl' | 'full'", 
          default: "'md'", 
          description: 'The size of the dialog' 
        },
      ],
      slots: [
        { name: 'trigger', description: 'Custom trigger element (uses as-child pattern)' },
        { name: 'title', description: 'Custom title content' },
        { name: 'description', description: 'Custom description content' },
        { name: 'default', description: 'Main dialog content' },
        { name: 'footer', description: 'Footer actions (buttons, etc.)' },
        { name: 'close', description: 'Custom close button' },
      ],
      events: [
        { 
          name: 'update:open', 
          payload: 'boolean', 
          description: 'Emitted when dialog open state changes' 
        },
      ],
      examples: [
        {
          title: 'Basic Usage',
          code: `<Dialog 
  trigger-text="Open Dialog" 
  title="Welcome" 
  description="This is a dialog"
>
  <p>Dialog content here</p>
</Dialog>`
        },
        {
          title: 'With Custom Trigger',
          code: `<Dialog title="Settings">
  <template #trigger>
    <Button text="Open Settings" variant="secondary" />
  </template>
  <p>Settings content</p>
</Dialog>`
        },
        {
          title: 'With Footer Actions',
          code: `<Dialog title="Confirm">
  <template #default>
    <p>Are you sure?</p>
  </template>
  <template #footer>
    <Button text="Cancel" variant="secondary" />
    <Button text="Confirm" variant="primary" />
  </template>
</Dialog>`
        }
      ]
    },

    Popover: {
      props: [
        { 
          name: 'triggerText', 
          type: 'string', 
          default: "'Open'",
          description: 'The trigger text or content' 
        },
        { 
          name: 'side', 
          type: "'top' | 'right' | 'bottom' | 'left'", 
          default: "'bottom'", 
          description: 'The side where the popover should appear' 
        },
        { 
          name: 'align', 
          type: "'start' | 'center' | 'end'", 
          default: "'center'", 
          description: 'The alignment of the popover relative to the trigger' 
        },
        { 
          name: 'sideOffset', 
          type: 'number', 
          default: '5', 
          description: 'The distance in pixels from the trigger' 
        },
        { 
          name: 'showArrow', 
          type: 'boolean', 
          default: 'true', 
          description: 'Whether to show the arrow' 
        },
        { 
          name: 'width', 
          type: 'string', 
          default: "'260px'", 
          description: 'Custom width for the popover content' 
        },
      ],
      slots: [
        { name: 'trigger', description: 'Custom trigger element (uses as-child pattern)' },
        { name: 'default', description: 'Popover content' },
      ],
      events: [
        { 
          name: 'update:open', 
          payload: 'boolean', 
          description: 'Emitted when popover open state changes' 
        },
      ],
      examples: [
        {
          title: 'Basic Usage',
          code: `<Popover trigger-text="Click Me">
  <p>Popover content here</p>
</Popover>`
        },
        {
          title: 'Custom Position',
          code: `<Popover 
  trigger-text="Hover Me" 
  side="right" 
  align="start"
>
  <p>Positioned to the right</p>
</Popover>`
        },
        {
          title: 'With Custom Trigger',
          code: `<Popover>
  <template #trigger>
    <Button text="Info" variant="secondary" />
  </template>
  <p>Additional information</p>
</Popover>`
        }
      ]
    },
  }

  return { docs }
}

