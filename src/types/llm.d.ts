export interface InferenceParameters {
  maxTokens: number
  temperature: number
  topP: number
}

export interface LLM {
  modelId: string
  modelName: string
  toolUse: boolean // この LLM が ToolUse をサポートしているかどうか
}
