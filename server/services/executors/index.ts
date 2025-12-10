/**
 * Job Executor Registration
 *
 * This module registers all job executors with the JobExecutorRegistry.
 * Import this module in server startup to ensure executors are registered.
 */

import { JobExecutorRegistry } from '../JobExecutorRegistry'
import { ImageEnrichmentJobExecutor } from './ImageEnrichmentJobExecutor'

/**
 * Register all job executors
 * Call this function to ensure executors are registered
 */
export function registerExecutors(): void {
  if (!JobExecutorRegistry.has('image_enrichment')) {
    JobExecutorRegistry.register('image_enrichment', new ImageEnrichmentJobExecutor())
  }
}

// Auto-register on module load
registerExecutors()

export { ImageEnrichmentJobExecutor }

