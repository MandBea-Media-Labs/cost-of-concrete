/**
 * Anthropic LLM Provider
 *
 * Implementation of ILLMProvider for Claude models via Anthropic API.
 * Uses @anthropic-ai/sdk for API communication.
 */

import { consola } from 'consola'
import Anthropic from '@anthropic-ai/sdk'
import type {
  ILLMProvider,
  LLMCompletionRequest,
  LLMCompletionResponse,
  LLMStreamChunk,
  LLMMessage,
  TokenUsage,
} from './LLMProvider'
import { TOKEN_COSTS } from '../../schemas/ai.schemas'

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

    const response = await this.client.messages.create({
      model: request.model,
      max_tokens: request.maxTokens ?? 4096,
      temperature: request.temperature ?? 0.7,
      system,
      messages,
      stop_sequences: request.stopSequences,
    })

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

    const stream = await this.client.messages.stream({
      model: request.model,
      max_tokens: request.maxTokens ?? 4096,
      temperature: request.temperature ?? 0.7,
      system,
      messages,
      stop_sequences: request.stopSequences,
    })

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

    onChunk({ delta: '', isComplete: true, usage })

    return {
      content: fullContent,
      usage,
      model: finalMessage.model,
      stopReason,
      estimatedCostUsd: this.calculateCost(request.model, usage),
    }
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

