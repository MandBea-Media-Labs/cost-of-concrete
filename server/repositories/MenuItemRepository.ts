/**
 * Menu Item Repository
 *
 * Data access layer for menu_items table.
 * Handles all database operations using Supabase client.
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '~/types/supabase'

type MenuItem = Database['public']['Tables']['menu_items']['Row']
type MenuItemInsert = Database['public']['Tables']['menu_items']['Insert']
type MenuItemUpdate = Database['public']['Tables']['menu_items']['Update']

export class MenuItemRepository {
  constructor(private client: SupabaseClient<Database>) {}

  /**
   * List all items for a menu
   */
  async listByMenu(menuId: string, includeDeleted = false) {
    let query = this.client
      .from('menu_items')
      .select('*')
      .eq('menu_id', menuId)
      .order('parent_id', { ascending: true, nullsFirst: true })
      .order('display_order', { ascending: true })

    if (!includeDeleted) {
      query = query.is('deleted_at', null)
    }

    const { data, error } = await query

    if (error) throw error
    return data as MenuItem[]
  }

  /**
   * Get menu item by ID
   */
  async getById(id: string) {
    const { data, error } = await this.client
      .from('menu_items')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single()

    if (error) throw error
    return data as MenuItem
  }

  /**
   * Get children of a parent item
   */
  async getChildren(parentId: string) {
    const { data, error } = await this.client
      .from('menu_items')
      .select('*')
      .eq('parent_id', parentId)
      .eq('is_enabled', true)
      .is('deleted_at', null)
      .order('display_order', { ascending: true })

    if (error) throw error
    return data as MenuItem[]
  }

  /**
   * Create new menu item
   */
  async create(data: MenuItemInsert, userId: string) {
    const { data: item, error } = await this.client
      .from('menu_items')
      .insert({
        ...data,
        created_by: userId,
        updated_by: userId
      })
      .select()
      .single()

    if (error) throw error
    return item as MenuItem
  }

  /**
   * Update existing menu item
   */
  async update(id: string, data: MenuItemUpdate, userId: string) {
    const { data: item, error } = await this.client
      .from('menu_items')
      .update({
        ...data,
        updated_by: userId
      })
      .eq('id', id)
      .is('deleted_at', null)
      .select()
      .single()

    if (error) throw error
    return item as MenuItem
  }

  /**
   * Soft delete menu item
   */
  async softDelete(id: string) {
    const { data, error } = await this.client
      .from('menu_items')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as MenuItem
  }

  /**
   * Reorder menu items (for drag-and-drop)
   */
  async reorder(items: Array<{ id: string; display_order: number }>) {
    const updates = items.map(item =>
      this.client
        .from('menu_items')
        .update({ display_order: item.display_order })
        .eq('id', item.id)
    )

    const results = await Promise.all(updates)

    const errors = results.filter(r => r.error)
    if (errors.length > 0) {
      throw errors[0].error
    }

    return true
  }




  /**
   * Get next display order for a parent
   */
  async getNextDisplayOrder(menuId: string, parentId: string | null) {
    const { data, error } = await this.client
      .from('menu_items')
      .select('display_order')
      .eq('menu_id', menuId)
      .is('deleted_at', null)

    if (parentId) {
      const { data: parentData, error: parentError } = await this.client
        .from('menu_items')
        .select('display_order')
        .eq('menu_id', menuId)
        .eq('parent_id', parentId)
        .is('deleted_at', null)

      if (parentError) throw parentError

      if (!parentData || parentData.length === 0) return 0

      const maxOrder = Math.max(...parentData.map(item => item.display_order))
      return maxOrder + 1
    }

    if (error) throw error

    if (!data || data.length === 0) return 0

    const maxOrder = Math.max(...data.map(item => item.display_order))
    return maxOrder + 1
  }
}
