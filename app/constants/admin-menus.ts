import type { AdminNavMenu, AdminNavMenuItems } from '~/types/admin-nav'

export const adminNavMenu: AdminNavMenu[] = [
  {
    heading: 'Dashboard',
    items: [
      {
        title: 'Overview',
        icon: 'i-lucide-home',
        link: '/admin',
      },
    ],
  },
  {
    heading: 'Content',
    items: [
      {
        title: 'Pages',
        icon: 'i-lucide-file-text',
        link: '/admin/pages',
      },
      {
        title: 'Menus',
        icon: 'i-lucide-menu',
        link: '/admin/menus',
      },
    ],
  },
  {
    heading: 'Directory',
    items: [
      {
        title: 'Contractors',
        icon: 'i-lucide-building-2',
        link: '/admin/contractors',
      },
      {
        title: 'Claims',
        icon: 'i-lucide-shield-check',
        link: '/admin/claims',
      },
      {
        title: 'Maintenance',
        icon: 'i-lucide-wrench',
        children: [
          { title: 'Contractor Import', link: '/admin/maintenance/import' },
          { title: 'Contractor Enrichment', link: '/admin/maintenance/contractor-enrichment' },
          { title: 'Image Enrichment', link: '/admin/maintenance/image-enrichment' },
          { title: 'Review Enrichment', link: '/admin/maintenance/review-enrichment' },
        ],
      },
    ],
  },
]

export const adminNavMenuBottom: AdminNavMenuItems = [
  {
    title: 'Settings',
    icon: 'i-lucide-settings',
    link: '/admin/settings',
  },
]

