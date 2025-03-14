export type QueryStatus = "NEW" | "PENDING_HUMAN" | "ANSWERED_BY_HUMAN" | "COMPLETED"
export type ApiType = "CUSTOMER" | "BACKEND"
export type LLMProvider = "ollama" | "openai" | "anthropic" | "huggingface" | "custom"

export interface Query {
  id: string
  customerApiId: string
  question: string
  customerResponse: string
  internalNote: string
  status: QueryStatus
  customerName: string
  createdAt: Date
  updatedAt: Date
}

export interface ApiInstance {
  id: string
  name: string
  type: ApiType
  llmType: string // e.g., "ollama/smollm2:1.7b", "openai/gpt-4", etc.
  isRunning: boolean
  endpoint: string
  createdAt: Date
  updatedAt: Date
}

export interface Message {
  role: "user" | "assistant" | "system"
  content: string
  timestamp: Date
}

export interface LLMConfig {
  provider: LLMProvider
  model: "smollm2:1.7b"
  endpoint?: string
  apiKey?: string
  temperature?: number
  maxTokens?: number
  systemPrompt?: string
}

