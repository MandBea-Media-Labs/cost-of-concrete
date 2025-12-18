/**
 * Article Pipeline Orchestrator Integration Tests
 *
 * Tests the full pipeline execution with QA feedback loop.
 * Verifies: Research → Writer → SEO → QA → (revision if fail) → complete
 *
 * @see BAM-313 Batch 4.5: Testing
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ArticlePipelineOrchestrator, type PipelineCallbacks } from '../../../services/ai/ArticlePipelineOrchestrator'
import { AgentRegistry } from '../../../services/ai/AgentRegistry'
import type { IAIAgent, AgentContext, AgentResult } from '../../../services/ai/AIAgent'
import type { ILLMProvider, TokenUsage } from '../../../services/ai/LLMProvider'
import type {
  AIArticleJobRow,
  AIPersonaRow,
  ResearchOutput,
  WriterOutput,
  SEOOutput,
  QAOutput,
} from '../../../schemas/ai.schemas'

// =====================================================
// MOCK DATA
// =====================================================

const mockTokenUsage: TokenUsage = { inputTokens: 1000, outputTokens: 500, totalTokens: 1500 }

const mockResearchOutput: ResearchOutput = {
  keyword: 'concrete driveway cost',
  keywordData: { searchVolume: 8500, difficulty: 42, intent: 'commercial', cpc: 6.50 },
  competitors: [],
  relatedKeywords: ['driveway cost'],
  paaQuestions: ['How much does concrete cost?'],
  recommendedWordCount: 1500,
  contentGaps: [],
}

const mockWriterOutput: WriterOutput = {
  title: 'Concrete Driveway Cost Guide',
  slug: 'concrete-driveway-cost',
  content: '# Concrete Driveway Cost\n\nContent here...',
  excerpt: 'Learn about costs.',
  wordCount: 1500,
  headings: [{ level: 2, text: 'Cost Breakdown' }],
}

const mockSEOOutput: SEOOutput = {
  metaTitle: 'Concrete Driveway Cost 2024',
  metaDescription: 'Learn concrete driveway costs.',
  headingAnalysis: { isValid: true, issues: [], suggestions: [] },
  keywordDensity: { percentage: 2.0, analysis: 'Optimal' },
  schemaMarkup: { '@type': 'Article' },
  internalLinks: [],
  optimizationScore: 85,
}

const mockQAPassOutput: QAOutput = {
  passed: true,
  overallScore: 85,
  dimensionScores: { readability: 90, seo: 85, accuracy: 80, engagement: 85, brandVoice: 90 },
  issues: [],
  feedback: 'Content meets quality standards.',
}

const mockQAFailOutput: QAOutput = {
  passed: false,
  overallScore: 55,
  dimensionScores: { readability: 50, seo: 50, accuracy: 50, engagement: 50, brandVoice: 50 },
  issues: [{ category: 'readability', severity: 'high', description: 'Too complex', suggestion: 'Simplify' }],
  feedback: 'Content needs improvement.',
}

const mockJob: AIArticleJobRow = {
  id: 'job-123',
  keyword: 'concrete driveway cost',
  status: 'pending',
  progress_percent: 0,
  current_agent: null,
  current_iteration: 1,
  max_iterations: 3,
  total_tokens_used: 0,
  estimated_cost_usd: null,
  final_output: null,
  page_id: null,
  last_error: null,
  priority: 0,
  settings: null,
  created_by: null,
  started_at: null,
  completed_at: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

const mockPersona: AIPersonaRow = {
  id: 'persona-1',
  agent_type: 'research',
  name: 'Test Persona',
  system_prompt: 'You are a helpful assistant.',
  provider: 'anthropic',
  model: 'claude-sonnet-4-20250514',
  temperature: 0.5,
  max_tokens: 4000,
  is_default: true,
  is_enabled: true,
  description: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  deleted_at: null,
}

// =====================================================
// MOCK FACTORIES
// =====================================================

function createMockLLMProvider(): ILLMProvider {
  return {
    providerType: 'anthropic',
    complete: vi.fn(),
    stream: vi.fn(),
    generateText: vi.fn(),
    generateJSON: vi.fn().mockResolvedValue({
      data: {},
      usage: mockTokenUsage,
      estimatedCostUsd: 0.01,
    }),
    estimateTokens: vi.fn().mockReturnValue(1000),
    calculateCost: vi.fn().mockReturnValue(0.01),
  }
}

function createMockAgent(agentType: string, output: unknown, passed = true): IAIAgent {
  return {
    agentType: agentType as IAIAgent['agentType'],
    name: `Mock ${agentType} Agent`,
    description: `Mock ${agentType} agent for testing`,
    validateInput: vi.fn().mockReturnValue(true),
    getOutputSchema: vi.fn().mockReturnValue({}),
    execute: vi.fn().mockResolvedValue({
      success: true,
      output,
      usage: mockTokenUsage,
      continueToNext: passed,
      feedback: passed ? undefined : 'Revision needed',
    } as AgentResult),
  }
}
// =====================================================
// MOCK SUPABASE CLIENT
// =====================================================

function createMockSupabaseClient() {
  // Create a deeply chainable mock that handles all Supabase query patterns
  const createChainable = (finalData: unknown = mockJob) => {
    const chain: Record<string, unknown> = {}
    const methods = ['select', 'insert', 'update', 'eq', 'is', 'in', 'order', 'limit', 'range', 'single', 'maybeSingle']

    methods.forEach(method => {
      if (method === 'single' || method === 'maybeSingle') {
        chain[method] = vi.fn().mockResolvedValue({ data: finalData, error: null })
      } else {
        chain[method] = vi.fn().mockReturnValue(chain)
      }
    })

    return chain
  }

  return {
    from: vi.fn().mockImplementation(() => createChainable()),
  } as unknown as ReturnType<typeof import('@supabase/supabase-js').createClient<import('../../../app/types/supabase').Database>>
}

// =====================================================
// TEST SUITE
// =====================================================

describe('ArticlePipelineOrchestrator', () => {
  let mockClient: ReturnType<typeof createMockSupabaseClient>
  let mockLLMProvider: ILLMProvider
  let callbacks: PipelineCallbacks

  beforeEach(() => {
    mockClient = createMockSupabaseClient()
    mockLLMProvider = createMockLLMProvider()
    callbacks = {
      onProgress: vi.fn(),
      onAgentStart: vi.fn(),
      onAgentComplete: vi.fn(),
    }

    // Clear AgentRegistry and register mock agents
    vi.spyOn(AgentRegistry, 'get').mockImplementation((agentType) => {
      switch (agentType) {
        case 'research':
          return createMockAgent('research', mockResearchOutput)
        case 'writer':
          return createMockAgent('writer', mockWriterOutput)
        case 'seo':
          return createMockAgent('seo', mockSEOOutput)
        case 'qa':
          return createMockAgent('qa', mockQAPassOutput)
        default:
          return undefined
      }
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // =====================================================
  // CONSTRUCTOR TESTS
  // =====================================================

  describe('constructor', () => {
    it('should create orchestrator with required dependencies', () => {
      const orchestrator = new ArticlePipelineOrchestrator(mockClient, mockLLMProvider)
      expect(orchestrator).toBeDefined()
    })

    it('should accept optional callbacks', () => {
      const orchestrator = new ArticlePipelineOrchestrator(mockClient, mockLLMProvider, callbacks)
      expect(orchestrator).toBeDefined()
    })
  })

  // =====================================================
  // PIPELINE EXECUTION TESTS
  // =====================================================

  describe('execute', () => {
    it('should execute full pipeline when QA passes on first iteration', async () => {
      // Mock persona repository
      vi.spyOn(ArticlePipelineOrchestrator.prototype as unknown as { getPersonaForAgent: () => Promise<AIPersonaRow | null> }, 'getPersonaForAgent' as keyof ArticlePipelineOrchestrator)
        .mockResolvedValue(mockPersona)

      const orchestrator = new ArticlePipelineOrchestrator(mockClient, mockLLMProvider, callbacks)
      const result = await orchestrator.execute(mockJob)

      expect(result.success).toBe(true)
      expect(result.iterations).toBe(1)
      expect(AgentRegistry.get).toHaveBeenCalledWith('research')
      expect(AgentRegistry.get).toHaveBeenCalledWith('writer')
      expect(AgentRegistry.get).toHaveBeenCalledWith('seo')
      expect(AgentRegistry.get).toHaveBeenCalledWith('qa')
    })
  })

  // =====================================================
  // FEEDBACK LOOP TESTS
  // =====================================================

  describe('feedback loop', () => {
    it('should retry writer when QA fails', async () => {
      let qaCallCount = 0
      vi.spyOn(AgentRegistry, 'get').mockImplementation((agentType) => {
        switch (agentType) {
          case 'research':
            return createMockAgent('research', mockResearchOutput)
          case 'writer':
            return createMockAgent('writer', mockWriterOutput)
          case 'seo':
            return createMockAgent('seo', mockSEOOutput)
          case 'qa':
            qaCallCount++
            // First call fails, second call passes
            if (qaCallCount === 1) {
              return createMockAgent('qa', mockQAFailOutput, false)
            }
            return createMockAgent('qa', mockQAPassOutput, true)
          default:
            return undefined
        }
      })

      vi.spyOn(ArticlePipelineOrchestrator.prototype as unknown as { getPersonaForAgent: () => Promise<AIPersonaRow | null> }, 'getPersonaForAgent' as keyof ArticlePipelineOrchestrator)
        .mockResolvedValue(mockPersona)

      const orchestrator = new ArticlePipelineOrchestrator(mockClient, mockLLMProvider, callbacks)
      const result = await orchestrator.execute(mockJob)

      expect(result.success).toBe(true)
      expect(result.iterations).toBe(2)
    })

    it('should stop after max iterations even if QA fails', async () => {
      const maxIterationsJob = { ...mockJob, max_iterations: 2 }

      vi.spyOn(AgentRegistry, 'get').mockImplementation((agentType) => {
        switch (agentType) {
          case 'research':
            return createMockAgent('research', mockResearchOutput)
          case 'writer':
            return createMockAgent('writer', mockWriterOutput)
          case 'seo':
            return createMockAgent('seo', mockSEOOutput)
          case 'qa':
            // Always fail
            return createMockAgent('qa', mockQAFailOutput, false)
          default:
            return undefined
        }
      })

      vi.spyOn(ArticlePipelineOrchestrator.prototype as unknown as { getPersonaForAgent: () => Promise<AIPersonaRow | null> }, 'getPersonaForAgent' as keyof ArticlePipelineOrchestrator)
        .mockResolvedValue(mockPersona)

      const orchestrator = new ArticlePipelineOrchestrator(mockClient, mockLLMProvider, callbacks)
      const result = await orchestrator.execute(maxIterationsJob)

      // Should complete (with best effort) after max iterations
      expect(result.success).toBe(true)
      expect(result.iterations).toBe(2)
    })
  })

  // =====================================================
  // ERROR HANDLING TESTS
  // =====================================================

  describe('error handling', () => {
    it('should return failure when agent not found', async () => {
      vi.spyOn(AgentRegistry, 'get').mockReturnValue(undefined)

      vi.spyOn(ArticlePipelineOrchestrator.prototype as unknown as { getPersonaForAgent: () => Promise<AIPersonaRow | null> }, 'getPersonaForAgent' as keyof ArticlePipelineOrchestrator)
        .mockResolvedValue(mockPersona)

      const orchestrator = new ArticlePipelineOrchestrator(mockClient, mockLLMProvider, callbacks)
      const result = await orchestrator.execute(mockJob)

      expect(result.success).toBe(false)
      expect(result.error).toContain('not found')
    })

    it('should return failure when persona not found', async () => {
      vi.spyOn(ArticlePipelineOrchestrator.prototype as unknown as { getPersonaForAgent: () => Promise<AIPersonaRow | null> }, 'getPersonaForAgent' as keyof ArticlePipelineOrchestrator)
        .mockResolvedValue(null)

      const orchestrator = new ArticlePipelineOrchestrator(mockClient, mockLLMProvider, callbacks)
      const result = await orchestrator.execute(mockJob)

      expect(result.success).toBe(false)
      expect(result.error).toContain('persona')
    })
  })
})

