/**
 * Menu Service
 *
 * Business logic layer for menu management.
 * Handles slug validation, depth enforcement, and display order management.
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '~/types/supabase'
import { MenuRepository } from '../repositories/MenuRepository'
import { MenuItemRepository } from '../repositories/MenuItemRepository'

type MenuInsert = Database['public']['Tables']['menus']['Insert']
type MenuUpdate = Database['public']['Tables']['menus']['Update']
type MenuItemInsert = Database['public']['Tables']['menu_items']['Insert']
type MenuItemUpdate = Database['public']['Tables']['menu_items']['Update']

export class MenuService {
  private menuRepo: MenuRepository
  private menuItemRepo: MenuItemRepository

  constructor(private client: SupabaseClient<Database>) {
    this.menuRepo = new MenuRepository(client)
    this.menuItemRepo = new MenuItemRepository(client)
  }

  /**
   * Create a new menu
   */
  async createMenu(data: MenuInsert, userId: string) {
    // Validate slug is unique
    const isUnique = await this.menuRepo.isSlugUnique(data.slug)
    if (!isUnique) {
      throw createError({
        statusCode: 400,
        message: `Menu with slug "${data.slug}" already exists`
      })
    }

    return await this.menuRepo.create(data, userId)
  }

  /**
   * Update an existing menu
   */
  async updateMenu(id: string, data: MenuUpdate, userId: string, force: boolean = false) {
    // If slug is being updated, validate uniqueness
    if (data.slug) {
      const isUnique = await this.menuRepo.isSlugUnique(data.slug, id)
      if (!isUnique) {
        throw createError({
          statusCode: 400,
          message: `Menu with slug "${data.slug}" already exists`
        })
      }
    }

    // Check if location is being changed
    const isChangingToHeader = data.show_in_header === true
    const isChangingToFooter = data.show_in_footer === true

    // Validate: Footer menus cannot have dropdown items
    if (isChangingToFooter) {
      const items = await this.menuItemRepo.listByMenu(id)
      const hasDropdowns = items.some(item => item.link_type === 'dropdown')

      if (hasDropdowns) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Bad Request',
          message: 'Cannot assign menu to footer because it contains dropdown items. Footer menus can only contain page links and custom links. Please remove dropdown items first.'
        })
      }
    }

    // Check for location conflicts
    if (isChangingToHeader || isChangingToFooter) {
      const location = isChangingToHeader ? 'header' : 'footer'
      const existingMenu = await this.menuRepo.findByLocation(location)

      // If another menu is already in this location
      if (existingMenu && existingMenu.id !== id) {
        if (!force) {
          // Return conflict error with existing menu info
          throw createError({
            statusCode: 409,
            statusMessage: 'Location Conflict',
            message: `Menu "${existingMenu.name}" is currently assigned to ${location}`,
            data: {
              conflictingMenu: {
                id: existingMenu.id,
                name: existingMenu.name
              }
            }
          })
        }

        // Force flag is true - unset the existing menu
        await this.menuRepo.unsetLocation(existingMenu.id, location, userId)
      }
    }

    return await this.menuRepo.update(id, data, userId)
  }

  /**
   * Delete a menu (soft delete)
   */
  async deleteMenu(id: string) {
    return await this.menuRepo.softDelete(id)
  }

  /**
   * Create a new menu item
   */
  async createMenuItem(data: MenuItemInsert, userId: string) {
    // Enforce 1-level depth rule
    if (data.parent_id) {
      const parent = await this.menuItemRepo.getById(data.parent_id)

      // Check if parent already has a parent (would create 2-level depth)
      if (parent.parent_id !== null) {
        throw createError({
          statusCode: 400,
          message: 'Cannot create nested menu items more than 1 level deep. Child items cannot have children.'
        })
      }
    }

    // Auto-assign display_order if not provided
    if (data.display_order === undefined || data.display_order === null) {
      data.display_order = await this.menuItemRepo.getNextDisplayOrder(
        data.menu_id,
        data.parent_id || null
      )
    }

    return await this.menuItemRepo.create(data, userId)
  }

  /**
   * Update an existing menu item
   */
  async updateMenuItem(id: string, data: MenuItemUpdate, userId: string) {
    // If parent_id is being updated, enforce 1-level depth rule
    if (data.parent_id !== undefined) {
      const item = await this.menuItemRepo.getById(id)

      // Check if this item has children
      const children = await this.menuItemRepo.getChildren(id)
      if (children.length > 0 && data.parent_id !== null) {
        throw createError({
          statusCode: 400,
          message: 'Cannot make this item a child because it has children of its own. Remove children first.'
        })
      }

      // If setting a parent, check parent doesn't have a parent
      if (data.parent_id) {
        const parent = await this.menuItemRepo.getById(data.parent_id)
        if (parent.parent_id !== null) {
          throw createError({
            statusCode: 400,
            message: 'Cannot create nested menu items more than 1 level deep.'
          })
        }
      }
    }

    return await this.menuItemRepo.update(id, data, userId)
  }

  /**
   * Delete a menu item (soft delete)
   */
  async deleteMenuItem(id: string) {
    return await this.menuItemRepo.softDelete(id)
  }

  /**
   * Reorder menu items
   */
  async reorderMenuItems(items: Array<{ id: string; display_order: number }>) {
    if (import.meta.dev) {
      console.log('[MenuService] reorderMenuItems called with:', items)
    }

    // Validate all items belong to same menu and parent
    const itemDetails = await Promise.all(
      items.map(item => this.menuItemRepo.getById(item.id))
    )

    if (import.meta.dev) {
      console.log('[MenuService] Item details fetched:', itemDetails.map(i => ({ id: i.id, label: i.label, parent_id: i.parent_id, menu_id: i.menu_id })))
    }

    const menuIds = new Set(itemDetails.map(item => item.menu_id))
    const parentIds = new Set(itemDetails.map(item => item.parent_id))

    if (menuIds.size > 1) {
      throw createError({
        statusCode: 400,
        message: 'All items must belong to the same menu'
      })
    }

    if (parentIds.size > 1) {
      throw createError({
        statusCode: 400,
        message: 'All items must have the same parent (or all be top-level)'
      })
    }

    if (import.meta.dev) {
      console.log('[MenuService] Validation passed, calling repository.reorder')
    }

    const result = await this.menuItemRepo.reorder(items)

    if (import.meta.dev) {
      console.log('[MenuService] Repository.reorder returned:', result)
    }

    return result
  }
}

