import type { AdminNavMenu, AdminNavMenuItems } from '~/types/admin-nav'

export const adminNavMenu: AdminNavMenu[] = [
  {
    heading: 'Main',
    items: [
      {
        title: 'Overview',
        icon: 'i-lucide-home',
        link: '/admin',
      },
      {
        title: 'View Site',
        icon: 'i-lucide-external-link',
        link: '/',
        external: true,
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
        title: 'Contractor Profiles',
        icon: 'i-lucide-building-2',
        link: '/admin/contractors',
      },
      {
        title: 'Profile Claims',
        icon: 'i-lucide-shield-check',
        link: '/admin/claims',
      },
    ],
  },
  {
    heading: 'Accounts',
    items: [
      {
        title: 'System Accounts',
        icon: 'i-lucide-users',
        link: '/admin/accounts/system',
      },
      {
        title: 'Contractor Accounts',
        icon: 'i-lucide-building',
        link: '/admin/accounts/contractors',
      },
    ],
  },
  {
    heading: 'Maintenance',
    items: [
      {
        title: 'Contractor Import',
        icon: 'i-lucide-upload',
        link: '/admin/maintenance/import',
      },
      {
        title: 'Contractor Enrichment',
        icon: 'i-lucide-sparkles',
        link: '/admin/maintenance/contractor-enrichment',
      },
      {
        title: 'Image Enrichment',
        icon: 'i-lucide-image',
        link: '/admin/maintenance/image-enrichment',
      },
      {
        title: 'Review Enrichment',
        icon: 'i-lucide-message-square',
        link: '/admin/maintenance/review-enrichment',
      },
    ],
  },
  {
    heading: 'System',
    items: [
      {
        title: 'Background Jobs',
        icon: 'i-lucide-clock',
        link: '/admin/maintenance/jobs',
      },
      {
        title: 'System Logs',
        icon: 'i-lucide-scroll-text',
        link: '/admin/system/logs',
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

