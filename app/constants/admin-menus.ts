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

