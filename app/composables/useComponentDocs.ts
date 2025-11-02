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
    Eyebrow: {
      props: [
        {
          name: 'text',
          type: 'string',
          required: true,
          description: 'The text to display in the eyebrow'
        },
        {
          name: 'variant',
          type: "'white-blue' | 'blue-blue'",
          default: "'white-blue'",
          description: 'The visual variant of the eyebrow'
        },
        {
          name: 'size',
          type: "'sm' | 'md' | 'lg'",
          default: "'md'",
          description: 'The size of the eyebrow'
        }
      ],
      examples: [
        {
          title: 'White-Blue Variant',
          code: `<Eyebrow text="Homeowners Guide to Concrete" variant="white-blue" size="md" />`
        },
        {
          title: 'Blue-Blue Variant',
          code: `<Eyebrow text="How It Works" variant="blue-blue" size="lg" />`
        }
      ]
    },

    Badge: {
      props: [
        {
          name: 'text',
          type: 'string',
          required: true,
          description: 'The text to display in the badge'
        },
        {
          name: 'variant',
          type: "'primary-outline' | 'secondary-outline'",
          default: "'primary-outline'",
          description: 'The visual variant of the badge (outline only)'
        },
        {
          name: 'size',
          type: "'sm' | 'md' | 'lg'",
          default: "'md'",
          description: 'The size of the badge'
        }
      ],
      examples: [
        {
          title: 'Primary Outline Variant',
          code: `<Badge text="Featured" variant="primary-outline" size="md" />`
        },
        {
          title: 'Secondary Outline Variant',
          code: `<Badge text="New" variant="secondary-outline" size="sm" />`
        },
        {
          title: 'Large Badge',
          code: `<Badge text="Premium" variant="primary-outline" size="lg" />`
        }
      ]
    },

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

    Card: {
      props: [
        {
          name: 'variant',
          type: "'primary' | 'secondary' | 'primary-outline' | 'secondary-outline' | 'secondary-light-outline'",
          default: "'primary'",
          description: 'The visual variant of the card'
        },
        {
          name: 'borderWidth',
          type: "'thin' | 'thick'",
          default: "'thin'",
          description: 'The border width of the card (thin = 1px, thick = 2px)'
        },
        {
          name: 'padding',
          type: 'string',
          default: "'p-6'",
          description: 'The padding class for the card (Tailwind class override)'
        },
        {
          name: 'shadow',
          type: 'boolean',
          default: 'false',
          description: 'Whether to apply shadow and transition effects'
        },
        {
          name: 'icon',
          type: 'string',
          required: false,
          description: 'Optional icon name (uses Nuxt Icon). Example: "heroicons:shield-check"'
        },
        {
          name: 'heading',
          type: 'string',
          required: false,
          description: 'Optional heading text (displays as H2 below the icon)'
        },
        {
          name: 'step',
          type: 'number | null',
          default: 'null',
          description: 'Optional step number. When provided, displays in 2-column layout with step number in blue circle. Icon is hidden on mobile (container < 768px) for better readability.'
        },
      ],
      slots: [
        { name: 'default', description: 'Card content (description/body text)' },
      ],
      examples: [
        {
          title: 'Basic Usage',
          code: `<Card variant="primary">
  <h3>Card Title</h3>
  <p>Card content goes here</p>
</Card>`
        },
        {
          title: 'With Icon and Heading',
          code: `<Card
  variant="primary"
  icon="heroicons:shield-check"
  heading="Sealing Protects from Weather and Wear"
>
  Applying a good-quality concrete sealer every few years shields the driveway from moisture, freeze-thaw damage, and staining, preserving appearance and strength.
</Card>`
        },
        {
          title: 'Icon Only (No Heading)',
          code: `<Card variant="primary" icon="heroicons:check-circle">
  <p>Card with just an icon and description text.</p>
</Card>`
        },
        {
          title: 'Different Variants',
          code: `<Card variant="secondary" border-width="thick">
  <p>Secondary card with thick border</p>
</Card>`
        },
        {
          title: 'With Shadow',
          code: `<Card variant="primary-outline" :shadow="true">
  <p>Card with shadow effect</p>
</Card>`
        },
        {
          title: 'Step-based Layout',
          code: `<Card
  variant="secondary-light-outline"
  icon="heroicons:map"
  heading="Search by ZIP"
  :step="1"
>
  Find local concrete contractors by entering your ZIP code, giving you fast access to nearby service options that match your specific project needs.
</Card>`
        }
      ]
    },

    DevPageHeader: {
      props: [
        {
          name: 'title',
          type: 'string',
          required: true,
          description: 'The main heading text for the page header (responsive: text-2xl on mobile, text-4xl on tablet+)'
        },
        {
          name: 'description',
          type: 'string',
          required: true,
          description: 'The descriptive text displayed below the title (responsive: text-base on mobile, text-lg on tablet+)'
        },
      ],
      examples: [
        {
          title: 'Basic Usage',
          code: `<DevPageHeader
  title="UI Components Display"
  description="Interactive showcase of all UI components"
/>`
        }
      ]
    },

    DevButtonVariantCard: {
      props: [
        {
          name: 'variantTitle',
          type: 'string',
          required: true,
          description: 'The display name for the button variant (e.g., "Primary Variant")'
        },
        {
          name: 'variant',
          type: "'primary' | 'primary-outline' | 'secondary' | 'secondary-outline'",
          required: true,
          description: 'The button variant type to demonstrate'
        },
        {
          name: 'sampleText',
          type: 'string',
          required: true,
          description: 'The text to display on the sample buttons'
        },
      ],
      examples: [
        {
          title: 'Basic Usage',
          code: `<DevButtonVariantCard
  variant-title="Primary Variant"
  variant="primary"
  sample-text="For Contractors"
/>`
        }
      ]
    },

    DevEyebrowVariantCard: {
      props: [
        {
          name: 'variantTitle',
          type: 'string',
          required: true,
          description: 'The display name for the eyebrow variant (e.g., "White-Blue Variant")'
        },
        {
          name: 'variant',
          type: "'white-blue' | 'blue-blue'",
          required: true,
          description: 'The eyebrow variant type to demonstrate'
        },
        {
          name: 'sampleText',
          type: 'string',
          required: true,
          description: 'The text to display on the sample eyebrows'
        },
        {
          name: 'background',
          type: "'white' | 'light-blue'",
          default: "'white'",
          description: 'The background color of the card to showcase the eyebrow contrast'
        }
      ],
      examples: [
        {
          title: 'Basic Usage',
          code: `<DevEyebrowVariantCard
  variant-title="White-Blue Variant"
  variant="white-blue"
  sample-text="Homeowners Guide to Concrete"
  background="light-blue"
/>`
        }
      ]
    },

    DevEyebrowShowcase: {
      props: [],
      examples: [
        {
          title: 'Basic Usage',
          code: `<DevEyebrowShowcase />`
        }
      ]
    },

    DevBadgeVariantCard: {
      props: [
        {
          name: 'variantTitle',
          type: 'string',
          required: true,
          description: 'The display name for the badge variant (e.g., "Primary Outline Variant")'
        },
        {
          name: 'variant',
          type: "'primary-outline' | 'secondary-outline'",
          required: true,
          description: 'The badge variant type to demonstrate'
        },
        {
          name: 'sampleText',
          type: 'string',
          required: true,
          description: 'The text to display on the sample badges'
        }
      ],
      examples: [
        {
          title: 'Basic Usage',
          code: `<DevBadgeVariantCard
  variant-title="Primary Outline Variant"
  variant="primary-outline"
  sample-text="Featured"
/>`
        }
      ]
    },

    DevBadgeShowcase: {
      props: [],
      examples: [
        {
          title: 'Basic Usage',
          code: `<DevBadgeShowcase />`
        }
      ]
    },

    DevButtonShowcase: {
      props: [],
      examples: [
        {
          title: 'Basic Usage',
          code: `<DevButtonShowcase />`
        }
      ]
    },

    DevPopoverShowcase: {
      props: [],
      examples: [
        {
          title: 'Basic Usage',
          code: `<DevPopoverShowcase />`
        }
      ]
    },

    DevDialogShowcase: {
      props: [],
      examples: [
        {
          title: 'Basic Usage',
          code: `<DevDialogShowcase />`
        }
      ]
    },

    DevCardShowcase: {
      props: [],
      examples: [
        {
          title: 'Basic Usage',
          code: `<DevCardShowcase />`
        }
      ]
    },

    SearchInput: {
      props: [
        {
          name: 'placeholder',
          type: 'string',
          default: "'Search Contractors by ZIP Code'",
          description: 'Placeholder text for the input'
        },
        {
          name: 'size',
          type: "'sm' | 'md' | 'lg'",
          default: "'md'",
          description: 'The size of the input'
        },
        {
          name: 'variant',
          type: "'primary-outline' | 'secondary-outline' | 'secondary-light-outline'",
          default: "'primary-outline'",
          description: 'The visual variant (border-based)'
        },
        {
          name: 'maxResults',
          type: 'number',
          default: '5',
          description: 'Maximum autocomplete results to show (autocomplete mode only)'
        },
        {
          name: 'minCharacters',
          type: 'number',
          default: '2',
          description: 'Minimum characters before autocomplete triggers (autocomplete mode only)'
        },
        {
          name: 'loading',
          type: 'boolean',
          default: 'false',
          description: 'Loading state for future API integration'
        },
        {
          name: 'button',
          type: 'string | null',
          default: 'null',
          description: 'Button text. If provided, component shows button instead of autocomplete. On mobile, button shows icon only; on desktop, shows text.'
        }
      ],
      events: [
        {
          name: 'submit',
          payload: 'ZipCodeData | string',
          description: 'Emitted when user selects autocomplete result (ZipCodeData) or clicks button (string)'
        },
        {
          name: 'input',
          payload: 'string',
          description: 'Emitted on input change with current search query'
        }
      ],
      examples: [
        {
          title: 'Autocomplete Mode',
          code: `<SearchInput
  placeholder="Search Contractors by ZIP Code"
  variant="primary-outline"
  size="md"
  @submit="handleZipSelect"
/>`
        },
        {
          title: 'Button Mode',
          code: `<SearchInput
  placeholder="ZIP Code"
  variant="primary-outline"
  size="lg"
  button="Find Contractors"
  @submit="handleSearch"
/>`
        },
        {
          title: 'With Loading State',
          code: `<SearchInput
  :loading="true"
  placeholder="Searching..."
/>`
        }
      ]
    },

    DevSearchInputVariantCard: {
      props: [
        {
          name: 'variantTitle',
          type: 'string',
          required: true,
          description: 'The display name for the variant'
        },
        {
          name: 'variant',
          type: "'primary-outline' | 'secondary-outline' | 'secondary-light-outline'",
          required: true,
          description: 'The variant type to demonstrate'
        },
        {
          name: 'buttonMode',
          type: 'boolean',
          default: 'false',
          description: 'Whether to show button mode'
        },
        {
          name: 'buttonText',
          type: 'string',
          default: "'Find Contractors'",
          description: 'Button text for button mode'
        }
      ],
      examples: [
        {
          title: 'Autocomplete Mode',
          code: `<DevSearchInputVariantCard
  variant-title="Primary Outline Variant"
  variant="primary-outline"
/>`
        },
        {
          title: 'Button Mode',
          code: `<DevSearchInputVariantCard
  variant-title="Primary Outline Variant"
  variant="primary-outline"
  :button-mode="true"
  button-text="Find Contractors"
/>`
        }
      ]
    },

    DevSearchInputShowcase: {
      props: [],
      examples: [
        {
          title: 'Basic Usage',
          code: `<DevSearchInputShowcase />`
        }
      ]
    },

    Header: {
      props: [],
      examples: [
        {
          title: 'Basic Usage',
          code: `<Header />`
        }
      ]
    },

    Divider: {
      props: [
        {
          name: 'orientation',
          type: "'horizontal' | 'vertical'",
          default: "'horizontal'",
          description: 'The orientation of the divider'
        },
        {
          name: 'spacing',
          type: "'none' | 'sm' | 'md' | 'lg'",
          default: "'none'",
          description: 'The spacing around the divider'
        },
        {
          name: 'variant',
          type: "'solid' | 'dashed' | 'dotted'",
          default: "'solid'",
          description: 'The style of the divider line'
        }
      ],
      examples: [
        {
          title: 'Horizontal Divider',
          code: `<Divider />`
        },
        {
          title: 'Horizontal with Spacing',
          code: `<Divider spacing="md" />`
        },
        {
          title: 'Dashed Divider',
          code: `<Divider variant="dashed" spacing="md" />`
        },
        {
          title: 'Vertical Divider',
          code: `<Divider orientation="vertical" spacing="md" />`
        }
      ]
    },

    Hero: {
      props: [],
      examples: [
        {
          title: 'Basic Usage',
          code: `<Hero />`
        }
      ]
    },
  }

  return { docs }
}

