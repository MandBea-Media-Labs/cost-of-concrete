import type { Database } from '~/types/supabase'

type Menu = Database['public']['Tables']['menus']['Row']
type MenuInsert = Database['public']['Tables']['menus']['Insert']
type MenuUpdate = Database['public']['Tables']['menus']['Update']

export interface MenuWithItems extends Menu {
  items: Array<{
    id: string
    label: string
    page_id: string | null
    custom_url: string | null
    open_in_new_tab: boolean
    display_order: number
    children: Array<{
      id: string
      label: string
      page_id: string | null
      custom_url: string | null
      open_in_new_tab: boolean
      display_order: number
    }>
  }>
}

/**
 * Composable for menu management
 *
 * Provides methods for:
 * - Fetching menus by slug (public)
 * - Listing all menus (admin)
 * - Creating menus (admin)
 * - Updating menus (admin)
 * - Deleting menus (admin)
 *
 * @example
 * ```ts
 * const { fetchMenuBySlug, listMenus, createMenu, updateMenu, deleteMenu } = useMenus()
 *
 * // Fetch menu for header
 * const headerMenu = await fetchMenuBySlug('main-nav')
 *
 * // List all menus (admin)
 * const allMenus = await listMenus()
 * ```
 */
export function useMenus() {
  /**
   * Fetch a menu by slug with nested items (public endpoint)
   */
  const fetchMenuBySlug = async (slug: string): Promise<MenuWithItems | null> => {
    try {
      const response = await $fetch<{ success: boolean; data: MenuWithItems }>(`/api/menus/${slug}`)
      
      if (response.success) {
        return response.data
      }
      
      return null
    } catch (err) {
      console.error(`Error fetching menu '${slug}':`, err)
      return null
    }
  }

  /**
   * List all menus (admin endpoint)
   */
  const listMenus = async (): Promise<Menu[]> => {
    try {
      const response = await $fetch<{ success: boolean; data: Menu[] }>('/api/menus')
      
      if (response.success) {
        return response.data
      }
      
      return []
    } catch (err) {
      console.error('Error listing menus:', err)
      return []
    }
  }

  /**
   * Create a new menu (admin endpoint)
   */
  const createMenu = async (menuData: MenuInsert): Promise<Menu | null> => {
    try {
      const response = await $fetch<{ success: boolean; data: Menu }>('/api/menus', {
        method: 'POST',
        body: menuData
      })
      
      if (response.success) {
        return response.data
      }
      
      return null
    } catch (err) {
      console.error('Error creating menu:', err)
      throw err
    }
  }

  /**
   * Update an existing menu (admin endpoint)
   */
  const updateMenu = async (id: string, menuData: MenuUpdate): Promise<Menu | null> => {
    try {
      const response = await $fetch<{ success: boolean; data: Menu }>(`/api/menus/${id}`, {
        method: 'PATCH',
        body: menuData
      })
      
      if (response.success) {
        return response.data
      }
      
      return null
    } catch (err) {
      console.error(`Error updating menu '${id}':`, err)
      throw err
    }
  }

  /**
   * Delete a menu (admin endpoint)
   */
  const deleteMenu = async (id: string): Promise<boolean> => {
    try {
      const response = await $fetch<{ success: boolean }>(`/api/menus/${id}`, {
        method: 'DELETE'
      })
      
      return response.success
    } catch (err) {
      console.error(`Error deleting menu '${id}':`, err)
      return false
    }
  }

  return {
    fetchMenuBySlug,
    listMenus,
    createMenu,
    updateMenu,
    deleteMenu
  }
}

