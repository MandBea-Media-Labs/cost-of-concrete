/**
 * Anthropic LLM Provider
 *
 * Implementation of ILLMProvider for Claude models via Anthropic API.
 * Uses @anthropic-ai/sdk for API communication.
 */

import { consola } from 'consola'
import Anthropic from '@anthropic-ai/sdk'
import type { z } from 'zod'
import type {
  ILLMProvider,
  LLMCompletionRequest,
  LLMCompletionResponse,
  LLMStreamChunk,
  LLMMessage,
  TokenUsage,
} from './LLMProvider'
import { TOKEN_COSTS } from '../../schemas/ai.schemas'
import { repairJSON } from '../../utils/json-repair'
import { withRetry } from '../../utils/retry'

/** Convert our message format to Anthropic format */
function toAnthropicMessages(messages: LLMMessage[]): Anthropic.MessageParam[] {
  return messages
    .filter(m => m.role !== 'system') // System handled separately
    .map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }))
}

/** Extract system prompt from messages or use provided one */
function extractSystemPrompt(messages: LLMMessage[], systemPrompt?: string): string | undefined {
  if (systemPrompt) return systemPrompt
  const systemMessage = messages.find(m => m.role === 'system')
  return systemMessage?.content
}

export class AnthropicProvider implements ILLMProvider {
  readonly providerType = 'anthropic' as const
  private client: Anthropic

  constructor(apiKey?: string) {
    this.client = new Anthropic({
      apiKey: apiKey || process.env.ANTHROPIC_API_KEY,
    })
  }

  async complete(request: LLMCompletionRequest): Promise<LLMCompletionResponse> {
    const system = extractSystemPrompt(request.messages, request.systemPrompt)
    const messages = toAnthropicMessages(request.messages)

    consola.debug(`Anthropic completion: model=${request.model}, messages=${messages.length}`)

    // Wrap API call with retry logic for rate limits
    const response = await withRetry(
      () =>
        this.client.messages.create({
          model: request.model,
          max_tokens: request.maxTokens ?? 4096,
          temperature: request.temperature ?? 0.7,
          system,
          messages,
          stop_sequences: request.stopSequences,
        }),
      {
        maxRetries: 3,
        baseDelayMs: 1000,
      }
    )

    const content = response.content
      .filter(block => block.type === 'text')
      .map(block => (block as Anthropic.TextBlock).text)
      .join('')

    const usage: TokenUsage = {
      promptTokens: response.usage.input_tokens,
      completionTokens: response.usage.output_tokens,
      totalTokens: response.usage.input_tokens + response.usage.output_tokens,
    }

    return {
      content,
      usage,
      model: response.model,
      stopReason: response.stop_reason,
      estimatedCostUsd: this.calculateCost(request.model, usage),
    }
  }

  async stream(
    request: LLMCompletionRequest,
    onChunk: (chunk: LLMStreamChunk) => void
  ): Promise<LLMCompletionResponse> {
    const system = extractSystemPrompt(request.messages, request.systemPrompt)
    const messages = toAnthropicMessages(request.messages)

    consola.debug(`Anthropic streaming: model=${request.model}, messages=${messages.length}`)

    let fullContent = ''
    let usage: TokenUsage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 }
    let stopReason: string | null = null

    // Wrap stream creation with retry logic for rate limits
    const stream = await withRetry(
      () =>
        this.client.messages.stream({
          model: request.model,
          max_tokens: request.maxTokens ?? 4096,
          temperature: request.temperature ?? 0.7,
          system,
          messages,
          stop_sequences: request.stopSequences,
        }),
      {
        maxRetries: 3,
        baseDelayMs: 1000,
      }
    )

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        const delta = event.delta.text
        fullContent += delta
        onChunk({ delta, isComplete: false })
      }
    }

    const finalMessage = await stream.finalMessage()
    usage = {
      promptTokens: finalMessage.usage.input_tokens,
      completionTokens: finalMessage.usage.output_tokens,
      totalTokens: finalMessage.usage.input_tokens + finalMessage.usage.output_tokens,
    }
    stopReason = finalMessage.stop_reason

    // Log completion details for debugging
    consola.info(`[AnthropicProvider] Stream completed`, {
      stopReason,
      contentLength: fullContent.length,
      outputTokens: usage.completionTokens,
      maxTokensRequested: request.maxTokens,
    })

    // Warn if stopped due to max_tokens (truncated response)
    if (stopReason === 'max_tokens') {
      consola.warn(`[AnthropicProvider] Response truncated - hit max_tokens limit`, {
        outputTokens: usage.completionTokens,
        maxTokensRequested: request.maxTokens,
      })
    }

    onChunk({ delta: '', isComplete: true, usage })

    return {
      content: fullContent,
      usage,
      model: finalMessage.model,
      stopReason,
      estimatedCostUsd: this.calculateCost(request.model, usage),
    }
  }

  async generateText(options: {
    prompt: string
    systemPrompt?: string
    model: string
    temperature?: number
    maxTokens?: number
    onStream?: (chunk: LLMStreamChunk) => void
  }): Promise<LLMCompletionResponse> {
    const request: LLMCompletionRequest = {
      messages: [{ role: 'user', content: options.prompt }],
      model: options.model,
      systemPrompt: options.systemPrompt,
      temperature: options.temperature,
      maxTokens: options.maxTokens,
    }

    // Always use streaming for large token requests (Anthropic requires it for >10min operations)
    // Also use streaming if callback provided
    const useStreaming = (options.maxTokens && options.maxTokens > 8000) || options.onStream

    if (useStreaming) {
      return this.stream(request, options.onStream || (() => {}))
    } else {
      return this.complete(request)
    }
  }

  async generateJSON<T>(options: {
    prompt: string
    systemPrompt?: string
    model: string
    schema: z.ZodSchema<T>
    temperature?: number
    maxTokens?: number
    maxRetries?: number
  }): Promise<{ data: T; usage: TokenUsage; estimatedCostUsd: number }> {
    const maxRetries = options.maxRetries ?? 2
    let lastError: Error | undefined

    // Enhanced system prompt for JSON output
    const jsonSystemPrompt = [
      options.systemPrompt || '',
      '',
      'CRITICAL: You must respond with valid JSON only. Do not wrap the JSON in markdown code blocks.',
      'Do not include any explanatory text before or after the JSON.',
      'Ensure all strings are properly escaped and the JSON is well-formed.',
    ]
      .filter(Boolean)
      .join('\n')

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Request completion
        const response = await this.generateText({
          prompt: options.prompt,
          systemPrompt: jsonSystemPrompt,
          model: options.model,
          temperature: options.temperature ?? 0.3, // Lower temp for more consistent JSON
          maxTokens: options.maxTokens,
        })

        // Attempt to repair and validate JSON
        const repairResult = repairJSON(response.content, options.schema)

        if (repairResult.success && repairResult.data) {
          consola.debug(`JSON generation succeeded on attempt ${attempt + 1}`)
          return {
            data: repairResult.data,
            usage: response.usage,
            estimatedCostUsd: response.estimatedCostUsd,
          }
        }

        // Repair failed, prepare for retry
        lastError = new Error(
          `JSON validation failed: ${repairResult.error || 'Unknown error'}`
        )

        if (attempt < maxRetries) {
          consola.warn(
            `JSON generation attempt ${attempt + 1} failed, retrying...`,
            { error: repairResult.error }
          )
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))

        if (attempt < maxRetries) {
          consola.warn(`JSON generation attempt ${attempt + 1} threw error, retrying...`, {
            error: lastError.message,
          })
        }
      }
    }

    // All retries exhausted
    consola.error('JSON generation failed after all retries', { error: lastError?.message })
    throw lastError || new Error('JSON generation failed after all retries')
  }

  estimateTokens(text: string): number {
    // Rough estimation: ~4 characters per token for English text
    return Math.ceil(text.length / 4)
  }

  calculateCost(model: string, usage: TokenUsage): number {
    const costs = TOKEN_COSTS.anthropic[model as keyof typeof TOKEN_COSTS.anthropic]
    if (!costs) {
      consola.warn(`Unknown model for cost calculation: ${model}`)
      return 0
    }

    const inputCost = (usage.promptTokens / 1_000_000) * costs.input
    const outputCost = (usage.completionTokens / 1_000_000) * costs.output
    return inputCost + outputCost
  }
}

