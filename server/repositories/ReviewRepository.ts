/**
 * Review Repository
 *
 * Data access layer for reviews table.
 * Handles bulk upsert operations for importing Google reviews from Apify JSON.
 */

import { consola } from 'consola'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../../app/types/supabase'
import type { ApifyReview, Review, ReviewInsert } from '../schemas/review.schemas'
import { transformApifyReview } from '../schemas/review.schemas'

export class ReviewRepository {
  private client: SupabaseClient<Database>

  constructor(client: SupabaseClient<Database>) {
    this.client = client
  }

  /**
   * Bulk upsert reviews for a contractor
   * Uses ON CONFLICT DO NOTHING to skip existing reviews
   * Returns count of newly inserted reviews
   */
  async bulkUpsert(contractorId: string, reviews: ApifyReview[]): Promise<number> {
    if (!reviews.length) return 0

    // Transform Apify reviews to database format
    const reviewInserts: ReviewInsert[] = reviews.map((review) =>
      transformApifyReview(review, contractorId)
    )

    // Get existing review IDs to calculate new inserts
    const existingIds = await this.getExistingReviewIds(contractorId)
    const newReviews = reviewInserts.filter(
      (r) => !existingIds.has(r.google_review_id)
    )

    if (!newReviews.length) {
      consola.debug(`[ReviewRepository] No new reviews for contractor ${contractorId}`)
      return 0
    }

    // Insert new reviews (skip conflicts)
    const { data, error } = await this.client
      .from('reviews')
      .insert(newReviews)
      .select('id')

    if (error) {
      // Handle unique constraint violations gracefully
      if (error.code === '23505') {
        consola.debug(`[ReviewRepository] Some reviews already exist, skipping duplicates`)
        return 0
      }
      consola.error(`[ReviewRepository] Error inserting reviews:`, error)
      throw error
    }

    const insertedCount = data?.length ?? 0
    consola.debug(
      `[ReviewRepository] Inserted ${insertedCount} reviews for contractor ${contractorId}`
    )

    return insertedCount
  }

  /**
   * Get set of existing Google review IDs for a contractor
   */
  private async getExistingReviewIds(contractorId: string): Promise<Set<string>> {
    const { data, error } = await this.client
      .from('reviews')
      .select('google_review_id')
      .eq('contractor_id', contractorId)

    if (error) {
      consola.error(`[ReviewRepository] Error fetching existing reviews:`, error)
      return new Set()
    }

    return new Set(data?.map((r) => r.google_review_id) ?? [])
  }

  /**
   * Find all reviews for a contractor
   */
  async findByContractorId(
    contractorId: string,
    options?: { limit?: number; offset?: number; orderBy?: 'published_at' | 'stars' }
  ): Promise<Review[]> {
    let query = this.client
      .from('reviews')
      .select('*')
      .eq('contractor_id', contractorId)

    // Default ordering: newest first
    const orderBy = options?.orderBy ?? 'published_at'
    query = query.order(orderBy, { ascending: false, nullsFirst: false })

    if (options?.limit) query = query.limit(options.limit)
    if (options?.offset) query = query.range(options.offset, options.offset + (options.limit ?? 10) - 1)

    const { data, error } = await query

    if (error) {
      consola.error(`[ReviewRepository] Error fetching reviews:`, error)
      throw error
    }

    return data ?? []
  }

  /**
   * Count reviews for a contractor
   */
  async countByContractorId(contractorId: string): Promise<number> {
    const { count, error } = await this.client
      .from('reviews')
      .select('*', { count: 'exact', head: true })
      .eq('contractor_id', contractorId)

    if (error) {
      consola.error(`[ReviewRepository] Error counting reviews:`, error)
      throw error
    }

    return count ?? 0
  }

  /**
   * Find a single review by ID
   */
  async findById(id: string): Promise<Review | null> {
    const { data, error } = await this.client
      .from('reviews')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      consola.error(`[ReviewRepository] Error fetching review:`, error)
      throw error
    }

    return data
  }
}

