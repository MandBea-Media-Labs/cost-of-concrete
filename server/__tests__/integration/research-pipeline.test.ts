/**
 * Research Pipeline Integration Tests
 *
 * Integration tests that exercise the full research pipeline.
 * These tests can optionally use real DataForSEO API when RUN_INTEGRATION=true.
 *
 * To run with real API:
 *   RUN_INTEGRATION=true pnpm test:unit -- --grep "Research Pipeline"
 *
 * Note: .env.local is loaded in setup.ts when RUN_INTEGRATION=true,
 * before any test files are executed.
 *
 * @see BAM-311 Batch 2.3: Testing
 */

import { describe, it, expect, vi, beforeEach, afterEach, beforeAll } from 'vitest'
import { DataForSeoLabsService } from '../../services/DataForSeoLabsService'
import { ResearchAgent } from '../../services/ai/agents/ResearchAgent'
import { researchOutputSchema } from '../../schemas/ai.schemas'
import type { AgentContext } from '../../services/ai/AIAgent'

// =====================================================
// TEST CONFIGURATION
// =====================================================

const RUN_INTEGRATION = process.env.RUN_INTEGRATION === 'true'
const TEST_KEYWORD = 'concrete contractors los angeles'

// Skip integration tests unless explicitly enabled
const itIntegration = RUN_INTEGRATION ? it : it.skip

// Unmock consola for integration tests so we can see debug output
if (RUN_INTEGRATION) {
  vi.unmock('consola')
}

// =====================================================
// MOCK CONTEXT
// =====================================================

function createMockContext(): AgentContext {
  return {
    jobId: 'integration-test-job',
    supabase: {} as AgentContext['supabase'],
    llmProvider: {} as AgentContext['llmProvider'],
    persona: {
      id: 'persona-1',
      agent_type: 'research',
      name: 'Research Agent',
      system_prompt: 'You are a research agent.',
      model_id: 'test-model',
      temperature: 0.7,
      max_tokens: 4000,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_active: true,
    },
    log: (level, message, data) => {
      if (RUN_INTEGRATION) {
        console.log(`[${level.toUpperCase()}] ${message}`, data || '')
      }
    },
    onProgress: (message) => {
      if (RUN_INTEGRATION) {
        console.log(`[PROGRESS] ${message}`)
      }
    },
  }
}

// =====================================================
// INTEGRATION TEST SUITE
// =====================================================

describe('Research Pipeline Integration', () => {
  beforeAll(() => {
    if (RUN_INTEGRATION) {
      console.log('\n🔴 INTEGRATION TESTS ENABLED - Using real DataForSEO API')
      console.log(`   Test keyword: "${TEST_KEYWORD}"`)
      console.log('   API costs will be incurred!\n')
    }
  })

  // =====================================================
  // DATAFORSEO LABS SERVICE INTEGRATION
  // =====================================================

  describe('DataForSeoLabsService (Live API)', () => {
    itIntegration('should fetch real keyword overview data', async () => {
      const service = new DataForSeoLabsService()

      const { results, cost } = await service.getKeywordOverview([TEST_KEYWORD])

      expect(results).toHaveLength(1)
      expect(results[0].keyword).toBe(TEST_KEYWORD)
      expect(typeof results[0].search_volume).toBe('number')
      expect(cost).toBeGreaterThan(0)

      console.log(`   Keyword: ${results[0].keyword}`)
      console.log(`   Search Volume: ${results[0].search_volume}`)
      console.log(`   Difficulty: ${results[0].keyword_difficulty}`)
      console.log(`   Cost: $${cost.toFixed(4)}`)
    }, 30000)

    itIntegration('should fetch real SERP results', async () => {
      const service = new DataForSeoLabsService()

      const { organicResults, paaQuestions, cost } = await service.getSerpResults(TEST_KEYWORD, 2840, 'en', 10)

      expect(organicResults.length).toBeGreaterThan(0)
      expect(organicResults[0]).toHaveProperty('url')
      expect(organicResults[0]).toHaveProperty('title')
      expect(cost).toBeGreaterThan(0)

      console.log(`   Organic Results: ${organicResults.length}`)
      console.log(`   PAA Questions: ${paaQuestions.length}`)
      console.log(`   Top Result: ${organicResults[0].title}`)
      console.log(`   Cost: $${cost.toFixed(4)}`)
    }, 30000)

    itIntegration('should perform full research', async () => {
      const service = new DataForSeoLabsService()

      const result = await service.performResearch(TEST_KEYWORD, {
        serpDepth: 10,
        relatedLimit: 10,
        suggestionsLimit: 10,
      })

      expect(result.keyword).toBe(TEST_KEYWORD)
      expect(result.keywordData.searchVolume).toBeDefined()
      expect(result.serpResults.length).toBeGreaterThan(0)
      expect(result.relatedKeywords.length).toBeGreaterThan(0)
      expect(result.totalCost).toBeGreaterThan(0)

      console.log(`   Total Cost: $${result.totalCost.toFixed(4)}`)
      console.log(`   SERP Results: ${result.serpResults.length}`)
      console.log(`   Related Keywords: ${result.relatedKeywords.length}`)
      console.log(`   Suggestions: ${result.keywordSuggestions.length}`)
    }, 60000)
  })

  // =====================================================
  // RESEARCH AGENT INTEGRATION
  // =====================================================

  describe('ResearchAgent (Live API)', () => {
    itIntegration('should execute full research pipeline with real data', async () => {
      const agent = new ResearchAgent()
      const context = createMockContext()

      const result = await agent.execute({ keyword: TEST_KEYWORD }, context)

      expect(result.success).toBe(true)
      expect(result.output).toBeDefined()

      const output = result.output!
      expect(output.keyword).toBe(TEST_KEYWORD)
      expect(output.keywordData.searchVolume).toBeGreaterThan(0)
      expect(output.competitors.length).toBeGreaterThan(0)
      expect(output.relatedKeywords.length).toBeGreaterThan(0)
      expect(output.recommendedWordCount).toBeGreaterThan(0)

      console.log('\n   Research Agent Output:')
      console.log(`   Keyword: ${output.keyword}`)
      console.log(`   Search Volume: ${output.keywordData.searchVolume}`)
      console.log(`   Difficulty: ${output.keywordData.difficulty}`)
      console.log(`   Intent: ${output.keywordData.intent}`)
      console.log(`   Competitors: ${output.competitors.length}`)
      console.log(`   Related Keywords: ${output.relatedKeywords.length}`)
      console.log(`   PAA Questions: ${output.paaQuestions.length}`)
      console.log(`   Recommended Word Count: ${output.recommendedWordCount}`)
      console.log(`   Content Gaps: ${output.contentGaps.length}`)
    }, 90000)

    itIntegration('should produce schema-compliant output', async () => {
      const agent = new ResearchAgent()
      const context = createMockContext()

      const result = await agent.execute({ keyword: TEST_KEYWORD }, context)

      expect(result.success).toBe(true)

      // Validate output against Zod schema
      const parseResult = researchOutputSchema.safeParse(result.output)
      expect(parseResult.success).toBe(true)

      if (!parseResult.success) {
        console.error('Schema validation errors:', parseResult.error.errors)
      }
    }, 90000)
  })

  // =====================================================
  // MOCK TESTS (Always Run)
  // =====================================================

  describe('Research Pipeline (Mocked)', () => {
    beforeEach(() => {
      // Mock DataForSEO API for non-integration tests
      vi.spyOn(DataForSeoLabsService.prototype, 'performResearch').mockResolvedValue({
        keyword: 'test keyword',
        keywordData: {
          searchVolume: 5000,
          difficulty: 35,
          cpc: 5.0,
          intent: 'commercial',
          competition: 0.5,
        },
        serpResults: [
          {
            rank: 1,
            url: 'https://example.com',
            title: 'Example Title',
            description: 'Example description for testing purposes.',
            domain: 'example.com',
          },
        ],
        paaQuestions: ['What is the best option?', 'How much does it cost?'],
        relatedKeywords: ['related keyword 1', 'related keyword 2'],
        keywordSuggestions: ['suggestion 1', 'suggestion 2'],
        totalCost: 0.01,
      })
    })

    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('should complete full research pipeline with mocked data', async () => {
      const agent = new ResearchAgent()
      const context = createMockContext()

      const result = await agent.execute({ keyword: 'test keyword' }, context)

      expect(result.success).toBe(true)
      expect(result.output?.keyword).toBe('test keyword')
      expect(result.output?.keywordData.searchVolume).toBe(5000)
    })

    it('should validate output against schema', async () => {
      const agent = new ResearchAgent()
      const context = createMockContext()

      const result = await agent.execute({ keyword: 'test keyword' }, context)

      expect(result.success).toBe(true)

      const parseResult = researchOutputSchema.safeParse(result.output)
      expect(parseResult.success).toBe(true)
    })

    it('should handle API failures gracefully', async () => {
      vi.spyOn(DataForSeoLabsService.prototype, 'performResearch')
        .mockRejectedValue(new Error('API Error'))

      const agent = new ResearchAgent()
      const context = createMockContext()

      const result = await agent.execute({ keyword: 'test' }, context)

      expect(result.success).toBe(false)
      expect(result.error).toContain('API Error')
    })
  })
})

