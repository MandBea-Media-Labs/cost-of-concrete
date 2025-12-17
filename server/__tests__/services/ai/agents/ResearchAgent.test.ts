/**
 * Research Agent Unit Tests
 *
 * Tests the ResearchAgent with mocked DataForSEO service.
 * Validates input validation, output schema compliance, and error handling.
 *
 * @see BAM-311 Batch 2.3: Testing
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ResearchAgent } from '../../../../services/ai/agents/ResearchAgent'
import { DataForSeoLabsService } from '../../../../services/DataForSeoLabsService'
import type { AgentContext } from '../../../../services/ai/AIAgent'
import type { LabsResearchData } from '../../../../schemas/dataforseo-labs.schemas'

// =====================================================
// MOCK DATA
// =====================================================

const mockResearchData: LabsResearchData = {
  keyword: 'concrete contractors',
  keywordData: {
    searchVolume: 12000,
    difficulty: 45,
    cpc: 8.50,
    intent: 'commercial',
    competition: 0.65,
  },
  serpResults: [
    {
      rank: 1,
      url: 'https://example.com/contractors',
      title: 'Top Concrete Contractors',
      description: 'Find the best concrete contractors in your area with verified reviews.',
      domain: 'example.com',
    },
    {
      rank: 2,
      url: 'https://example2.com/services',
      title: 'Concrete Services',
      description: 'Professional concrete services for residential and commercial projects.',
      domain: 'example2.com',
    },
  ],
  paaQuestions: [
    'How much does concrete work cost?',
    'What is the best concrete contractor?',
    'How do I find a good concrete contractor?',
  ],
  relatedKeywords: [
    'concrete contractors near me',
    'cement contractors',
    'concrete driveway contractors',
  ],
  keywordSuggestions: [
    'affordable concrete contractors',
    'licensed concrete contractors',
  ],
  totalCost: 0.005,
}

// =====================================================
// MOCK CONTEXT
// =====================================================

function createMockContext(): AgentContext {
  return {
    jobId: 'test-job-123',
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
    log: vi.fn(),
    onProgress: vi.fn(),
  }
}

// =====================================================
// TEST SUITE
// =====================================================

describe('ResearchAgent', () => {
  let agent: ResearchAgent
  let mockContext: AgentContext

  beforeEach(() => {
    agent = new ResearchAgent()
    mockContext = createMockContext()

    // Mock DataForSeoLabsService.performResearch
    vi.spyOn(DataForSeoLabsService.prototype, 'performResearch')
      .mockResolvedValue(mockResearchData)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // =====================================================
  // METADATA TESTS
  // =====================================================

  describe('metadata', () => {
    it('should have correct agent type', () => {
      expect(agent.agentType).toBe('research')
    })

    it('should have correct name', () => {
      expect(agent.name).toBe('Research Agent')
    })

    it('should have a description', () => {
      expect(agent.description).toBeTruthy()
    })
  })

  // =====================================================
  // INPUT VALIDATION TESTS
  // =====================================================

  describe('validateInput', () => {
    it('should accept valid input with keyword', () => {
      expect(agent.validateInput({ keyword: 'concrete contractors' })).toBe(true)
    })

    it('should accept input with optional targetWordCount', () => {
      expect(agent.validateInput({ keyword: 'test', targetWordCount: 2000 })).toBe(true)
    })

    it('should reject null input', () => {
      expect(agent.validateInput(null)).toBe(false)
    })

    it('should reject undefined input', () => {
      expect(agent.validateInput(undefined)).toBe(false)
    })

    it('should reject non-object input', () => {
      expect(agent.validateInput('string')).toBe(false)
      expect(agent.validateInput(123)).toBe(false)
    })

    it('should reject empty keyword', () => {
      expect(agent.validateInput({ keyword: '' })).toBe(false)
    })

    it('should reject missing keyword', () => {
      expect(agent.validateInput({ targetWordCount: 2000 })).toBe(false)
    })
  })

  // =====================================================
  // OUTPUT SCHEMA TESTS
  // =====================================================

  describe('getOutputSchema', () => {
    it('should return a valid JSON schema', () => {
      const schema = agent.getOutputSchema()

      expect(schema).toBeDefined()
      expect(typeof schema).toBe('object')
      // JSON Schema may have $schema property at top level, not type directly
      expect(schema).toHaveProperty('$schema')
    })
  })

  // =====================================================
  // EXECUTION TESTS
  // =====================================================

  describe('execute', () => {
    it('should successfully execute research and return valid output', async () => {
      const input = { keyword: 'concrete contractors' }

      const result = await agent.execute(input, mockContext)

      expect(result.success).toBe(true)
      expect(result.output).toBeDefined()
      expect(result.output?.keyword).toBe('concrete contractors')
      expect(result.output?.keywordData.searchVolume).toBe(12000)
      expect(result.output?.keywordData.difficulty).toBe(45)
      expect(result.output?.competitors).toHaveLength(2)
      expect(result.output?.relatedKeywords.length).toBeGreaterThan(0)
      expect(result.output?.paaQuestions.length).toBeGreaterThan(0)
      expect(result.output?.recommendedWordCount).toBeGreaterThan(0)
    })

    it('should use targetWordCount when provided', async () => {
      const input = { keyword: 'test keyword', targetWordCount: 3000 }

      const result = await agent.execute(input, mockContext)

      expect(result.success).toBe(true)
      expect(result.output?.recommendedWordCount).toBe(3000)
    })

    it('should calculate recommended word count from competitors when not provided', async () => {
      const input = { keyword: 'test keyword' }

      const result = await agent.execute(input, mockContext)

      expect(result.success).toBe(true)
      // Should calculate based on competitor analysis
      expect(result.output?.recommendedWordCount).toBeGreaterThan(0)
      expect(result.output?.recommendedWordCount).toBeLessThanOrEqual(5000)
    })

    it('should call progress callback during execution', async () => {
      const input = { keyword: 'test keyword' }

      await agent.execute(input, mockContext)

      expect(mockContext.onProgress).toHaveBeenCalled()
    })

    it('should log execution progress', async () => {
      const input = { keyword: 'test keyword' }

      await agent.execute(input, mockContext)

      expect(mockContext.log).toHaveBeenCalledWith('info', expect.stringContaining('Starting research'))
      expect(mockContext.log).toHaveBeenCalledWith('info', expect.stringContaining('Research complete'))
    })

    it('should handle DataForSEO API errors gracefully', async () => {
      vi.spyOn(DataForSeoLabsService.prototype, 'performResearch')
        .mockRejectedValue(new Error('API rate limit exceeded'))

      const input = { keyword: 'test keyword' }

      const result = await agent.execute(input, mockContext)

      expect(result.success).toBe(false)
      expect(result.error).toContain('API rate limit exceeded')
    })

    it('should return failure result when research fails', async () => {
      vi.spyOn(DataForSeoLabsService.prototype, 'performResearch')
        .mockRejectedValue(new Error('Network error'))

      const input = { keyword: 'test' }

      const result = await agent.execute(input, mockContext)

      expect(result.success).toBe(false)
      // Output is null on failure, not undefined
      expect(result.output).toBeNull()
    })

    it('should include content gaps in output', async () => {
      const input = { keyword: 'concrete contractors' }

      const result = await agent.execute(input, mockContext)

      expect(result.success).toBe(true)
      expect(result.output?.contentGaps).toBeDefined()
      expect(Array.isArray(result.output?.contentGaps)).toBe(true)
    })
  })

  // =====================================================
  // SCHEMA COMPLIANCE TESTS
  // =====================================================

  describe('output schema compliance', () => {
    it('should produce output that matches researchOutputSchema', async () => {
      const input = { keyword: 'concrete contractors' }

      const result = await agent.execute(input, mockContext)

      expect(result.success).toBe(true)

      const output = result.output!
      // Verify required fields exist
      expect(output).toHaveProperty('keyword')
      expect(output).toHaveProperty('keywordData')
      expect(output).toHaveProperty('competitors')
      expect(output).toHaveProperty('relatedKeywords')
      expect(output).toHaveProperty('paaQuestions')
      expect(output).toHaveProperty('recommendedWordCount')
      expect(output).toHaveProperty('contentGaps')

      // Verify field types
      expect(typeof output.keyword).toBe('string')
      expect(typeof output.recommendedWordCount).toBe('number')
      expect(Array.isArray(output.competitors)).toBe(true)
      expect(Array.isArray(output.relatedKeywords)).toBe(true)
      expect(Array.isArray(output.paaQuestions)).toBe(true)
      expect(Array.isArray(output.contentGaps)).toBe(true)
    })

    it('should validate keywordData structure', async () => {
      const input = { keyword: 'concrete contractors' }

      const result = await agent.execute(input, mockContext)

      expect(result.success).toBe(true)

      const keywordData = result.output!.keywordData
      expect(keywordData).toHaveProperty('searchVolume')
      expect(keywordData).toHaveProperty('difficulty')
    })

    it('should validate competitor structure', async () => {
      const input = { keyword: 'concrete contractors' }

      const result = await agent.execute(input, mockContext)

      expect(result.success).toBe(true)

      const competitors = result.output!.competitors
      expect(competitors.length).toBeGreaterThan(0)

      const firstCompetitor = competitors[0]
      expect(firstCompetitor).toHaveProperty('url')
      expect(firstCompetitor).toHaveProperty('title')
    })
  })
})

