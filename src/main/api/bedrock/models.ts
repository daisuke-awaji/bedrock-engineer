import { LLM } from '../../../types/llm'

export const models: LLM[] = [
  {
    modelId: 'anthropic.claude-3-sonnet-20240229-v1:0',
    modelName: 'Claude 3 Sonnet',
    toolUse: true
  },
  {
    modelId: 'anthropic.claude-3-haiku-20240307-v1:0',
    modelName: 'Claude 3 Haiku',
    toolUse: true
  },
  {
    modelId: 'anthropic.claude-3-5-haiku-20241022-v1:0',
    modelName: 'Claude 3.5 Haiku',
    toolUse: true
  },
  {
    modelId: 'us.anthropic.claude-3-5-haiku-20241022-v1:0',
    modelName: 'Claude 3.5 Haiku (cross region inference)',
    toolUse: true
  },
  {
    modelId: 'anthropic.claude-3-5-sonnet-20240620-v1:0',
    modelName: 'Claude 3.5 Sonnet',
    toolUse: true
  },
  {
    modelId: 'us.anthropic.claude-3-5-sonnet-20240620-v1:0',
    modelName: 'Claude 3.5 Sonnet (cross region inference)',
    toolUse: true
  },
  {
    modelId: 'anthropic.claude-3-5-sonnet-20241022-v2:0',
    modelName: 'Claude 3.5 Sonnet v2',
    toolUse: true
  },
  {
    modelId: 'us.anthropic.claude-3-5-sonnet-20241022-v2:0',
    modelName: 'Claude 3.5 Sonnet v2 (cross region inference)',
    toolUse: true
  },
  {
    modelId: 'amazon.nova-pro-v1:0',
    modelName: 'Amazon Nova Pro',
    toolUse: true
  },
  {
    modelId: 'amazon.nova-lite-v1:0',
    modelName: 'Amazon Nova Lite',
    toolUse: true
  },
  {
    modelId: 'amazon.nova-micro-v1:0',
    modelName: 'Amazon Nova Micro',
    toolUse: true
  },
  {
    modelId: 'us.amazon.nova-pro-v1:0',
    modelName: 'Amazon Nova Pro (cross region inference)',
    toolUse: true
  },
  {
    modelId: 'us.amazon.nova-lite-v1:0',
    modelName: 'Amazon Nova Lite (cross region inference)',
    toolUse: true
  },
  {
    modelId: 'us.amazon.nova-micro-v1:0',
    modelName: 'Amazon Nova Micro (cross region inference)',
    toolUse: true
  }
]

export const getDefaultPromptRouter = (accountId: string, region: string) => {
  if (region === 'us-east-1' || region === 'us-west-2') {
    return [
      {
        modelId: `arn:aws:bedrock:${region}:${accountId}:default-prompt-router/anthropic.claude:1`,
        modelName: 'Claude Prompt Router',
        toolUse: true
      },
      {
        modelId: `arn:aws:bedrock:${region}:${accountId}:default-prompt-router/meta.llama:1`,
        modelName: 'Meta Prompt Router',
        toolUse: false
      }
    ]
  }

  return []
}
