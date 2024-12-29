export interface InferenceParameters {
  maxTokens: number
  temperature: number
  topP: number
}

export interface LLM {
  modelId: string
  modelName: string
}
