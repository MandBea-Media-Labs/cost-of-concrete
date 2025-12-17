/**
 * AI Services Index
 *
 * Central export point for AI article writing system services.
 */

// LLM Provider interface and implementations
export type {
  MessageRole,
  LLMMessage,
  LLMCompletionRequest,
  TokenUsage,
  LLMCompletionResponse,
  LLMStreamChunk,
  ILLMProvider,
} from './LLMProvider'
export {
  registerLLMProvider,
  getLLMProvider,
  getRegisteredProviders,
} from './LLMProvider'

// Anthropic provider implementation
export { AnthropicProvider } from './AnthropicProvider'

// AI Agent interface and types
export type {
  AgentContext,
  AgentResult,
  IAIAgent,
  ResearchAgentInput,
  WriterAgentInput,
  SEOAgentInput,
  QAAgentInput,
  ProjectManagerAgentInput,
} from './AIAgent'
export { BaseAIAgent } from './AIAgent'

// Agent Registry
export { AgentRegistry, loadAgents } from './AgentRegistry'

// Agent Implementations
export { ResearchAgent, researchAgent } from './agents/ResearchAgent'

