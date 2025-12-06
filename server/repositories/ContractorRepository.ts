/**
 * Contractor Repository
 *
 * Data access layer for contractors table.
 * Handles CRUD operations, upsert by Google Place ID, and image processing queue.
 */

import { consola } from 'consola'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../../app/types/supabase'

// Type aliases
type Contractor = Database['public']['Tables']['contractors']['Row']
type ContractorInsert = Database['public']['Tables']['contractors']['Insert']
type ContractorUpdate = Database['public']['Tables']['contractors']['Update']

export type ContractorStatus = 'pending' | 'active' | 'suspended'

export interface ContractorListOptions {
  cityId?: string
  status?: ContractorStatus
  includeDeleted?: boolean
  limit?: number
  offset?: number
  orderBy?: 'company_name' | 'rating' | 'review_count' | 'created_at'
  orderDirection?: 'asc' | 'desc'
}

export interface PublicContractorSearchOptions {
  citySlug: string
  stateCode?: string
  category?: string
  radiusMiles?: number
  limit?: number
  offset?: number
  orderBy?: 'rating' | 'review_count' | 'distance'
  orderDirection?: 'asc' | 'desc'
}

export interface ContractorWithDistance extends Contractor {
  distance_miles?: number
  city_name?: string
  city_slug?: string
  state_code?: string
}

export interface ContractorMetadata {
  images?: string[]
  pending_images?: string[]
  categories?: string[]
  social_links?: Record<string, string>
  opening_hours?: Record<string, string>
  geocoding_failed?: boolean
}

export class ContractorRepository {
  private client: SupabaseClient<Database>

  constructor(client: SupabaseClient<Database>) {
    this.client = client
  }

  /**
   * Find contractor by ID
   */
  async findById(id: string, includeDeleted = false): Promise<Contractor | null> {
    let query = this.client.from('contractors').select('*').eq('id', id)
    if (!includeDeleted) query = query.is('deleted_at', null)

    const { data, error } = await query.single()
    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }
    return data
  }

  /**
   * Find contractor by slug within a city
   */
  async findBySlug(cityId: string, slug: string, includeDeleted = false): Promise<Contractor | null> {
    let query = this.client
      .from('contractors')
      .select('*')
      .eq('city_id', cityId)
      .eq('slug', slug)

    if (!includeDeleted) query = query.is('deleted_at', null)

    const { data, error } = await query.maybeSingle()
    if (error) throw error
    return data
  }

  /**
   * Find contractor by Google Place ID (for deduplication during import)
   */
  async findByGooglePlaceId(googlePlaceId: string): Promise<Contractor | null> {
    const { data, error } = await this.client
      .from('contractors')
      .select('*')
      .eq('google_place_id', googlePlaceId)
      .is('deleted_at', null)
      .maybeSingle()

    if (error) throw error
    return data
  }

  /**
   * List contractors with filters and pagination
   */
  async findAll(options: ContractorListOptions = {}): Promise<{ contractors: Contractor[], total: number }> {
    const {
      cityId,
      status,
      includeDeleted = false,
      limit = 50,
      offset = 0,
      orderBy = 'company_name',
      orderDirection = 'asc'
    } = options

    let query = this.client.from('contractors').select('*', { count: 'exact' })

    if (cityId) query = query.eq('city_id', cityId)
    if (status) query = query.eq('status', status)
    if (!includeDeleted) query = query.is('deleted_at', null)

    query = query
      .order(orderBy, { ascending: orderDirection === 'asc' })
      .range(offset, offset + limit - 1)

    const { data, error, count } = await query
    if (error) throw error

    return { contractors: data || [], total: count || 0 }
  }

  /**
   * Find contractors pending image processing
   */
  async findPendingImageProcessing(limit = 10): Promise<Contractor[]> {
    const { data, error } = await this.client
      .from('contractors')
      .select('*')
      .eq('images_processed', false)
      .is('deleted_at', null)
      .limit(limit)

    if (error) throw error
    return data || []
  }

  /**
   * Create a new contractor
   */
  async create(data: ContractorInsert): Promise<Contractor> {
    consola.debug(`Creating contractor: ${data.company_name} (slug: ${data.slug})`)

    const { data: contractor, error } = await this.client
      .from('contractors')
      .insert(data)
      .select()
      .single()

    if (error) {
      consola.error(`Failed to create contractor "${data.company_name}":`, {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      })
      throw new Error(`Database error: ${error.message}${error.hint ? ` (${error.hint})` : ''}`)
    }

    consola.debug(`Created contractor ${contractor.id}`)
    return contractor
  }

  /**
   * Update a contractor
   */
  async update(id: string, data: ContractorUpdate): Promise<Contractor> {
    consola.debug(`Updating contractor ${id}`)

    const { data: contractor, error } = await this.client
      .from('contractors')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      consola.error(`Failed to update contractor ${id}:`, {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      })
      throw new Error(`Database error: ${error.message}${error.hint ? ` (${error.hint})` : ''}`)
    }

    consola.debug(`Updated contractor ${contractor.id}`)
    return contractor
  }

  /**
   * Upsert contractor by Google Place ID
   * If exists: update, if not: create with unique slug
   */
  async upsertByGooglePlaceId(data: ContractorInsert): Promise<Contractor> {
    if (!data.google_place_id) {
      throw new Error('google_place_id is required for upsert')
    }

    // Check if contractor exists
    const existing = await this.findByGooglePlaceId(data.google_place_id)

    if (existing) {
      // Update existing contractor
      return this.update(existing.id, data)
    }

    // Generate unique slug for new contractor
    const uniqueSlug = await this.generateUniqueSlug(data.slug, data.city_id || null)
    return this.create({ ...data, slug: uniqueSlug })
  }

  /**
   * Generate a unique slug within a city
   * Appends -n suffix if slug already exists
   */
  async generateUniqueSlug(baseSlug: string, cityId: string | null): Promise<string> {
    let slug = baseSlug
    let counter = 1

    while (true) {
      let query = this.client
        .from('contractors')
        .select('id')
        .eq('slug', slug)
        .is('deleted_at', null)

      // Handle null city_id correctly - use .is() for null, .eq() for values
      if (cityId === null) {
        query = query.is('city_id', null)
      } else {
        query = query.eq('city_id', cityId)
      }

      const { data, error } = await query.maybeSingle()

      if (error) throw error
      if (!data) return slug // Slug is available

      counter++
      slug = `${baseSlug}-${counter}`
    }
  }

  /**
   * Soft delete a contractor
   */
  async softDelete(id: string): Promise<void> {
    const { error } = await this.client
      .from('contractors')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)

    if (error) throw error
  }

  /**
   * Mark contractor images as processed
   */
  async markImagesProcessed(id: string, processedImages: string[]): Promise<Contractor> {
    // Get current metadata
    const contractor = await this.findById(id)
    if (!contractor) throw new Error('Contractor not found')

    const metadata = (contractor.metadata || {}) as ContractorMetadata
    const existingImages = metadata.images || []

    // Merge processed images and clear pending
    const updatedMetadata: ContractorMetadata = {
      ...metadata,
      images: [...existingImages, ...processedImages],
      pending_images: [],
    }

    return this.update(id, {
      images_processed: true,
      metadata: updatedMetadata as unknown as Database['public']['Tables']['contractors']['Update']['metadata'],
    })
  }

  /**
   * Find contractor by city slug and contractor slug (for public profile page)
   */
  async findBySlugPublic(citySlug: string, contractorSlug: string): Promise<ContractorWithDistance | null> {
    const { data, error } = await this.client
      .from('contractors')
      .select(`
        *,
        cities!inner (
          id,
          name,
          slug,
          state_code
        )
      `)
      .eq('slug', contractorSlug)
      .eq('cities.slug', citySlug)
      .eq('status', 'active')
      .is('deleted_at', null)
      .maybeSingle()

    if (error) throw error
    if (!data) return null

    // Flatten city data
    const city = data.cities as unknown as { id: string; name: string; slug: string; state_code: string }
    return {
      ...data,
      city_name: city.name,
      city_slug: city.slug,
      state_code: city.state_code,
    } as ContractorWithDistance
  }

  /**
   * Search contractors within radius of a city (for public listing pages)
   * Uses PostGIS for efficient spatial queries
   */
  async searchPublic(options: PublicContractorSearchOptions): Promise<{ contractors: ContractorWithDistance[], total: number }> {
    const {
      citySlug,
      stateCode,
      category,
      radiusMiles = 25,
      limit = 20,
      offset = 0,
      orderBy = 'rating',
      orderDirection = 'desc'
    } = options

    // Use raw SQL for PostGIS radius search
    const radiusMeters = radiusMiles * 1609.34

    // Build the query parts
    let categoryFilter = ''
    if (category) {
      categoryFilter = `AND c.metadata->'categories' ? '${category}'`
    }

    let stateFilter = ''
    if (stateCode) {
      stateFilter = `AND city.state_code = '${stateCode}'`
    }

    // Determine order clause
    let orderClause = 'c.rating DESC NULLS LAST'
    if (orderBy === 'review_count') {
      orderClause = `c.review_count ${orderDirection.toUpperCase()} NULLS LAST`
    } else if (orderBy === 'distance') {
      orderClause = `distance_miles ${orderDirection.toUpperCase()}`
    } else if (orderBy === 'rating') {
      orderClause = `c.rating ${orderDirection.toUpperCase()} NULLS LAST`
    }

    // Query for data with PostGIS radius search
    const { data, error } = await this.client.rpc('search_contractors_by_radius', {
      p_city_slug: citySlug,
      p_radius_meters: radiusMeters,
      p_category: category || null,
      p_state_code: stateCode || null,
      p_limit: limit,
      p_offset: offset,
      p_order_by: orderBy,
      p_order_direction: orderDirection
    })

    if (error) {
      // If RPC doesn't exist, fall back to simple city-based query
      consola.warn('PostGIS RPC not available, falling back to city-based query:', error.message)
      return this.searchPublicFallback(options)
    }

    // Count total results
    const { data: countData, error: countError } = await this.client.rpc('count_contractors_by_radius', {
      p_city_slug: citySlug,
      p_radius_meters: radiusMeters,
      p_category: category || null,
      p_state_code: stateCode || null
    })

    const total = countError ? (data?.length || 0) : (countData || 0)

    return {
      contractors: (data || []) as ContractorWithDistance[],
      total
    }
  }

  /**
   * Fallback search when PostGIS RPC is not available
   * Uses simple city matching without radius
   */
  private async searchPublicFallback(options: PublicContractorSearchOptions): Promise<{ contractors: ContractorWithDistance[], total: number }> {
    const {
      citySlug,
      category,
      limit = 20,
      offset = 0,
      orderBy = 'rating',
      orderDirection = 'desc'
    } = options

    // First get the city ID
    const { data: city, error: cityError } = await this.client
      .from('cities')
      .select('id, name, slug, state_code')
      .eq('slug', citySlug)
      .maybeSingle()

    if (cityError || !city) {
      return { contractors: [], total: 0 }
    }

    // Build query
    let query = this.client
      .from('contractors')
      .select('*', { count: 'exact' })
      .eq('city_id', city.id)
      .eq('status', 'active')
      .is('deleted_at', null)

    // Filter by category using JSONB containment
    if (category) {
      query = query.contains('metadata', { categories: [category] })
    }

    // Apply ordering
    const order = orderBy === 'distance' ? 'rating' : orderBy
    query = query.order(order, { ascending: orderDirection === 'asc', nullsFirst: false })
    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) throw error

    // Add city info to results
    const contractors = (data || []).map(c => ({
      ...c,
      city_name: city.name,
      city_slug: city.slug,
      state_code: city.state_code,
      distance_miles: 0
    })) as ContractorWithDistance[]

    return { contractors, total: count || 0 }
  }
}

