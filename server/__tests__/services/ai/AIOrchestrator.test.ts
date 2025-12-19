/**
 * AI Orchestrator Integration Tests
 *
 * Tests the full pipeline execution with QA feedback loop,
 * cancellation support, retry logic, and skipAgents configuration.
 *
 * @see BAM-314 Phase 5: Orchestrator & Page Creation
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { AIOrchestrator, type PipelineCallbacks } from '../../../services/ai/AIOrchestrator'
import { AgentRegistry } from '../../../services/ai/AgentRegistry'
import { AIArticleJobRepository } from '../../../repositories/AIArticleJobRepository'
import type { IAIAgent, AgentResult } from '../../../services/ai/AIAgent'
import type { ILLMProvider, TokenUsage } from '../../../services/ai/LLMProvider'
import type {
  AIArticleJobRow,
  AIPersonaRow,
  ResearchOutput,
  WriterOutput,
  SEOOutput,
  QAOutput,
  ProjectManagerOutput,
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

const mockPMOutput: ProjectManagerOutput = {
  readyForPublish: true,
  validationErrors: [],
  finalArticle: {
    title: 'Concrete Driveway Cost Guide',
    slug: 'concrete-driveway-cost',
    content: '# Concrete Driveway Cost\n\nContent here...',
    excerpt: 'Learn about costs.',
    metaTitle: 'Concrete Driveway Cost 2024',
    metaDescription: 'Learn concrete driveway costs.',
    schemaMarkup: { '@type': 'Article' },
    template: 'article',
    status: 'draft',
    focusKeyword: 'concrete driveway cost',
    wordCount: 1500,
  },
  summary: 'Article assembled successfully.',
  recommendations: [],
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

function createMockSupabaseClient() {
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

describe('AIOrchestrator', () => {
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
      onCancelled: vi.fn(),
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
        case 'project_manager':
          return createMockAgent('project_manager', mockPMOutput)
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
      const orchestrator = new AIOrchestrator(mockClient, mockLLMProvider)
      expect(orchestrator).toBeDefined()
    })

    it('should accept optional callbacks', () => {
      const orchestrator = new AIOrchestrator(mockClient, mockLLMProvider, callbacks)
      expect(orchestrator).toBeDefined()
    })
  })

  // =====================================================
  // PIPELINE EXECUTION TESTS
  // =====================================================

  describe('execute', () => {
    it('should execute full pipeline when QA passes on first iteration', async () => {
      vi.spyOn(AIOrchestrator.prototype as unknown as { getPersonaForAgent: () => Promise<AIPersonaRow | null> }, 'getPersonaForAgent' as keyof AIOrchestrator)
        .mockResolvedValue(mockPersona)

      const orchestrator = new AIOrchestrator(mockClient, mockLLMProvider, callbacks)
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
            if (qaCallCount === 1) {
              return createMockAgent('qa', mockQAFailOutput, false)
            }
            return createMockAgent('qa', mockQAPassOutput, true)
          case 'project_manager':
            return createMockAgent('project_manager', mockPMOutput)
          default:
            return undefined
        }
      })

      vi.spyOn(AIOrchestrator.prototype as unknown as { getPersonaForAgent: () => Promise<AIPersonaRow | null> }, 'getPersonaForAgent' as keyof AIOrchestrator)
        .mockResolvedValue(mockPersona)

      const orchestrator = new AIOrchestrator(mockClient, mockLLMProvider, callbacks)
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
            return createMockAgent('qa', mockQAFailOutput, false)
          case 'project_manager':
            return createMockAgent('project_manager', mockPMOutput)
          default:
            return undefined
        }
      })

      vi.spyOn(AIOrchestrator.prototype as unknown as { getPersonaForAgent: () => Promise<AIPersonaRow | null> }, 'getPersonaForAgent' as keyof AIOrchestrator)
        .mockResolvedValue(mockPersona)

      const orchestrator = new AIOrchestrator(mockClient, mockLLMProvider, callbacks)
      const result = await orchestrator.execute(maxIterationsJob)

      expect(result.success).toBe(true)
      expect(result.iterations).toBe(2)
    })
  })

  // =====================================================
  // CANCELLATION TESTS
  // =====================================================

  describe('cancellation', () => {
    it('should return cancelled result when job is cancelled before start', async () => {
      vi.spyOn(AIArticleJobRepository.prototype, 'isCancelled').mockResolvedValue(true)

      const orchestrator = new AIOrchestrator(mockClient, mockLLMProvider, callbacks)
      const result = await orchestrator.execute(mockJob)

      expect(result.success).toBe(false)
      expect(result.cancelled).toBe(true)
      expect(callbacks.onCancelled).toHaveBeenCalled()
    })

    it('should return cancelled result when job is cancelled mid-pipeline', async () => {
      let checkCount = 0
      vi.spyOn(AIArticleJobRepository.prototype, 'isCancelled').mockImplementation(async () => {
        checkCount++
        // Cancel after research completes (3rd check: before writer)
        return checkCount >= 3
      })

      vi.spyOn(AIOrchestrator.prototype as unknown as { getPersonaForAgent: () => Promise<AIPersonaRow | null> }, 'getPersonaForAgent' as keyof AIOrchestrator)
        .mockResolvedValue(mockPersona)

      const orchestrator = new AIOrchestrator(mockClient, mockLLMProvider, callbacks)
      const result = await orchestrator.execute(mockJob)

      expect(result.success).toBe(false)
      expect(result.cancelled).toBe(true)
      // Research should have run, but not writer
      expect(AgentRegistry.get).toHaveBeenCalledWith('research')
    })
  })

  // =====================================================
  // SKIP AGENTS TESTS
  // =====================================================

  describe('skipAgents', () => {
    it('should skip research agent when configured', async () => {
      const jobWithSkip: AIArticleJobRow = {
        ...mockJob,
        settings: { skipAgents: ['research'] },
      }

      vi.spyOn(AIArticleJobRepository.prototype, 'isCancelled').mockResolvedValue(false)
      vi.spyOn(AIOrchestrator.prototype as unknown as { getPersonaForAgent: () => Promise<AIPersonaRow | null> }, 'getPersonaForAgent' as keyof AIOrchestrator)
        .mockResolvedValue(mockPersona)

      const orchestrator = new AIOrchestrator(mockClient, mockLLMProvider, callbacks)
      const result = await orchestrator.execute(jobWithSkip)

      expect(result.success).toBe(true)
      // Research should NOT have been called
      expect(AgentRegistry.get).not.toHaveBeenCalledWith('research')
      // But writer should have been called
      expect(AgentRegistry.get).toHaveBeenCalledWith('writer')
    })

    it('should skip QA agent when configured', async () => {
      const jobWithSkip: AIArticleJobRow = {
        ...mockJob,
        settings: { skipAgents: ['qa'] },
      }

      vi.spyOn(AIArticleJobRepository.prototype, 'isCancelled').mockResolvedValue(false)
      vi.spyOn(AIOrchestrator.prototype as unknown as { getPersonaForAgent: () => Promise<AIPersonaRow | null> }, 'getPersonaForAgent' as keyof AIOrchestrator)
        .mockResolvedValue(mockPersona)

      const orchestrator = new AIOrchestrator(mockClient, mockLLMProvider, callbacks)
      const result = await orchestrator.execute(jobWithSkip)

      expect(result.success).toBe(true)
      expect(result.iterations).toBe(1)
      // QA should NOT have been called
      expect(AgentRegistry.get).not.toHaveBeenCalledWith('qa')
    })
  })

  // =====================================================
  // ERROR HANDLING TESTS
  // =====================================================

  describe('error handling', () => {
    it('should return failure when agent not found', async () => {
      vi.spyOn(AgentRegistry, 'get').mockReturnValue(undefined)
      vi.spyOn(AIArticleJobRepository.prototype, 'isCancelled').mockResolvedValue(false)

      vi.spyOn(AIOrchestrator.prototype as unknown as { getPersonaForAgent: () => Promise<AIPersonaRow | null> }, 'getPersonaForAgent' as keyof AIOrchestrator)
        .mockResolvedValue(mockPersona)

      const orchestrator = new AIOrchestrator(mockClient, mockLLMProvider, callbacks)
      const result = await orchestrator.execute(mockJob)

      expect(result.success).toBe(false)
      expect(result.error).toContain('not found')
    })

    it('should return failure when persona not found', async () => {
      vi.spyOn(AIArticleJobRepository.prototype, 'isCancelled').mockResolvedValue(false)
      vi.spyOn(AIOrchestrator.prototype as unknown as { getPersonaForAgent: () => Promise<AIPersonaRow | null> }, 'getPersonaForAgent' as keyof AIOrchestrator)
        .mockResolvedValue(null)

      const orchestrator = new AIOrchestrator(mockClient, mockLLMProvider, callbacks)
      const result = await orchestrator.execute(mockJob)

      expect(result.success).toBe(false)
      expect(result.error).toContain('persona')
    })
  })
})
