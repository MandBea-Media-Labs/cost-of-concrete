/**
 * Writer Agent
 *
 * Second agent in the AI article writing pipeline.
 * Uses Claude to generate high-quality SEO content based on research data.
 * Follows strict writing guidelines for readability and SEO.
 */

import { zodToJsonSchema } from 'zod-to-json-schema'
import { BaseAIAgent, type AgentContext, type AgentResult, type WriterAgentInput } from '../AIAgent'
import { AgentRegistry } from '../AgentRegistry'
import {
  writerOutputSchema,
  type WriterOutput,
  type AIAgentType,
  type ResearchOutput,
} from '../../../schemas/ai.schemas'

// =====================================================
// WRITER GUIDELINES (system prompt)
// =====================================================

const WRITER_SYSTEM_PROMPT = `You are an expert SEO content writer. Your task is to write high-quality articles that rank well in search engines while providing genuine value to readers.

## CRITICAL WRITING GUIDELINES

### Reading Level
- Write at a 7th grade Flesch-Kincaid reading level
- Use short, clear sentences
- Prefer simple words over complex vocabulary
- Break complex ideas into digestible parts

### Style Requirements
- NO emojis under any circumstances
- NO sensationalization or clickbait language
- NO emdashes (—) - use commas, periods, or "to" instead
- NO hyperbole or exaggerated claims
- Clean, cohesive writing architecture
- Natural, conversational tone

### SEO Best Practices
- Include the target keyword naturally in the title (H1)
- Use the keyword and variations in H2/H3 headings
- Aim for 1-2% keyword density without stuffing
- Answer "People Also Ask" questions when relevant
- Cover related keywords and topics naturally
- Write comprehensive content that fully answers user intent

### Content Structure
- Start with a compelling introduction that previews the content
- Use clear H2 and H3 headings to organize sections
- Include actionable, practical information
- End with a clear conclusion or summary
- Avoid filler content - every paragraph should add value

### Output Format
You MUST respond with valid JSON matching this exact structure:
{
  "title": "SEO-optimized title under 60 characters",
  "slug": "url-friendly-slug",
  "content": "Full markdown article content with ## and ### headings",
  "excerpt": "Compelling meta description under 160 characters",
  "wordCount": 1500,
  "headings": [
    {"level": 2, "text": "H2 Heading Text"},
    {"level": 3, "text": "H3 Heading Text"}
  ]
}
`

// =====================================================
// AGENT IMPLEMENTATION
// =====================================================

export class WriterAgent extends BaseAIAgent<WriterAgentInput, WriterOutput> {
  readonly agentType: AIAgentType = 'writer'
  readonly name = 'Writer Agent'
  readonly description = 'Generates SEO-optimized articles based on research data'

  // =====================================================
  // VALIDATION
  // =====================================================

  validateInput(input: unknown): input is WriterAgentInput {
    if (!input || typeof input !== 'object') return false
    const obj = input as Record<string, unknown>
    return (
      typeof obj.keyword === 'string' &&
      obj.keyword.length > 0 &&
      typeof obj.targetWordCount === 'number' &&
      obj.targetWordCount > 0 &&
      obj.researchData !== undefined
    )
  }

  getOutputSchema(): Record<string, unknown> {
    return zodToJsonSchema(writerOutputSchema)
  }

  // =====================================================
  // EXECUTION
  // =====================================================

  async execute(input: WriterAgentInput, context: AgentContext): Promise<AgentResult<WriterOutput>> {
    const { keyword, researchData, targetWordCount, qaFeedback, previousArticle, iteration } = input
    const { log, onProgress, llmProvider, persona } = context
    const startTime = Date.now()
    const isRevision = Boolean(qaFeedback && previousArticle && (iteration ?? 1) > 1)

    if (isRevision) {
      log('info', `Starting Writer Agent REVISION for keyword: "${keyword}" (iteration ${iteration})`)
      onProgress?.(`Writer Agent revising article based on QA feedback (iteration ${iteration})...`)
    } else {
      log('info', `Starting Writer Agent for keyword: "${keyword}"`)
      onProgress?.('Writer Agent starting article generation...')
    }

    try {
      // Cast research data to expected type
      const research = researchData as ResearchOutput
      const prevArticle = previousArticle as WriterOutput | undefined

      // Build the user prompt with research context
      log('debug', isRevision ? 'Building revision prompt with QA feedback...' : 'Building prompt with research context...')
      onProgress?.(isRevision ? 'Preparing revision based on QA feedback...' : 'Analyzing research data and preparing prompt...')

      const userPrompt = this.buildUserPrompt(keyword, research, targetWordCount, qaFeedback, prevArticle)

      // Get system prompt from persona or use default
      const systemPrompt = persona.system_prompt || WRITER_SYSTEM_PROMPT

      log('debug', `Requesting article ${isRevision ? 'revision' : 'generation'} from LLM (model: ${persona.model})`)
      onProgress?.(isRevision ? 'Revising article with Claude...' : 'Generating article content with Claude...')

      // Generate article using LLM
      const result = await llmProvider.generateJSON<WriterOutput>({
        prompt: userPrompt,
        systemPrompt,
        model: persona.model,
        schema: writerOutputSchema,
        temperature: persona.temperature ?? 0.7,
        maxTokens: persona.max_tokens ?? 8000,
      })

      const duration = Date.now() - startTime
      const article = result.data

      log('info', `Article generated successfully in ${duration}ms`)
      log('info', `Title: "${article.title}" | Word count: ${article.wordCount}`)
      log('debug', `Token usage: ${result.usage.totalTokens} total | Cost: $${result.estimatedCostUsd.toFixed(4)}`)

      onProgress?.(`Article generated: "${article.title}" (${article.wordCount} words)`)

      // Validate output
      const parseResult = writerOutputSchema.safeParse(article)
      if (!parseResult.success) {
        log('error', 'Output validation failed', parseResult.error)
        return this.failure(
          `Output validation failed: ${parseResult.error.message}`,
          result.usage
        )
      }

      onProgress?.('Writer Agent complete. Passing to SEO Agent...')

      return this.success(parseResult.data, result.usage, true)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      log('error', `Writer Agent failed: ${message}`, error)
      return this.failure(message, { inputTokens: 0, outputTokens: 0, totalTokens: 0 })
    }
  }

  // =====================================================
  // HELPERS
  // =====================================================

  /**
   * Build the user prompt with research data context
   * Supports revision mode with QA feedback
   */
  private buildUserPrompt(
    keyword: string,
    research: ResearchOutput,
    targetWordCount: number,
    qaFeedback?: string,
    previousArticle?: WriterOutput
  ): string {
    const sections: string[] = []
    const isRevision = Boolean(qaFeedback && previousArticle)

    // Main instruction - different for revision vs initial
    if (isRevision) {
      sections.push(`## REVISION REQUEST`)
      sections.push(``)
      sections.push(`Your previous article did not pass quality assurance. Please revise the article based on the feedback below.`)
      sections.push(``)
      sections.push(`### QA Feedback`)
      sections.push(qaFeedback!)
      sections.push(``)
      sections.push(`### Previous Article to Revise`)
      sections.push(`Title: ${previousArticle!.title}`)
      sections.push(`Word Count: ${previousArticle!.wordCount}`)
      sections.push(``)
      sections.push(`Content:`)
      sections.push(previousArticle!.content)
      sections.push(``)
      sections.push(`---`)
      sections.push(``)
      sections.push(`Please revise the article above, addressing ALL feedback points while maintaining the overall structure and keyword focus.`)
    } else {
      sections.push(`Write a comprehensive, SEO-optimized article about: "${keyword}"`)
    }

    sections.push(`Target word count: ${targetWordCount} words (minimum ${Math.floor(targetWordCount * 0.9)}, maximum ${Math.ceil(targetWordCount * 1.1)})`)
    sections.push('')

    // Keyword data (always include for reference)
    if (research.keywordData) {
      sections.push('## Keyword Research Data')
      if (research.keywordData.searchVolume) {
        sections.push(`- Monthly search volume: ${research.keywordData.searchVolume}`)
      }
      if (research.keywordData.difficulty !== undefined) {
        sections.push(`- Keyword difficulty: ${research.keywordData.difficulty}/100`)
      }
      if (research.keywordData.intent) {
        sections.push(`- Search intent: ${research.keywordData.intent}`)
      }
      sections.push('')
    }

    // Related keywords to include
    if (research.relatedKeywords.length > 0) {
      sections.push('## Related Keywords to Include Naturally')
      sections.push(research.relatedKeywords.slice(0, 10).join(', '))
      sections.push('')
    }

    // People Also Ask questions
    if (research.paaQuestions.length > 0) {
      sections.push('## Questions to Answer (People Also Ask)')
      for (const question of research.paaQuestions.slice(0, 8)) {
        sections.push(`- ${question}`)
      }
      sections.push('')
    }

    // Content gaps to address
    if (research.contentGaps && research.contentGaps.length > 0) {
      sections.push('## Content Gaps to Address')
      for (const gap of research.contentGaps.slice(0, 5)) {
        sections.push(`- ${gap}`)
      }
      sections.push('')
    }

    // Competitor analysis for context (only for initial generation)
    if (!isRevision && research.competitors.length > 0) {
      sections.push('## Top Competitor Titles (for reference, do not copy)')
      for (const comp of research.competitors.slice(0, 5)) {
        sections.push(`- ${comp.title}`)
      }
      sections.push('')
    }

    // Final reminders
    sections.push('## IMPORTANT REMINDERS')
    sections.push('- Write at 7th grade reading level')
    sections.push('- NO emojis, NO emdashes, NO sensationalization')
    sections.push('- Include natural keyword variations')
    sections.push('- Every section should provide genuine value')
    sections.push('- Respond ONLY with valid JSON matching the required schema')

    return sections.join('\n')
  }
}

// =====================================================
// REGISTER AGENT
// =====================================================

// Register agent on module load
const writerAgent = new WriterAgent()
AgentRegistry.register(writerAgent)

export { writerAgent }

