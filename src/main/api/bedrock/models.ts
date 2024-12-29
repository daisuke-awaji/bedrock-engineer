export const models = [
  {
    modelId: 'anthropic.claude-3-sonnet-20240229-v1:0',
    modelName: 'Claude 3 Sonnet'
  },
  {
    modelId: 'anthropic.claude-3-haiku-20240307-v1:0',
    modelName: 'Claude 3 Haiku'
  },
  {
    modelId: 'anthropic.claude-3-5-haiku-20241022-v1:0',
    modelName: 'Claude 3.5 Haiku'
  },
  {
    modelId: 'us.anthropic.claude-3-5-haiku-20241022-v1:0',
    modelName: 'Claude 3.5 Haiku (cross region inference)'
  },
  {
    modelId: 'anthropic.claude-3-5-sonnet-20240620-v1:0',
    modelName: 'Claude 3.5 Sonnet'
  },
  {
    modelId: 'us.anthropic.claude-3-5-sonnet-20240620-v1:0',
    modelName: 'Claude 3.5 Sonnet (cross region inference)'
  },
  {
    modelId: 'anthropic.claude-3-5-sonnet-20241022-v2:0',
    modelName: 'Claude 3.5 Sonnet v2'
  },
  {
    modelId: 'us.anthropic.claude-3-5-sonnet-20241022-v2:0',
    modelName: 'Claude 3.5 Sonnet v2 (cross region inference)'
  },
  {
    modelId: 'amazon.nova-pro-v1:0',
    modelName: 'Amazon Nova Pro'
  },
  {
    modelId: 'amazon.nova-lite-v1:0',
    modelName: 'Amazon Nova Lite'
  },
  {
    modelId: 'amazon.nova-micro-v1:0',
    modelName: 'Amazon Nova Micro'
  },
  {
    modelId: 'us.amazon.nova-pro-v1:0',
    modelName: 'Amazon Nova Pro (cross region inference)'
  },
  {
    modelId: 'us.amazon.nova-lite-v1:0',
    modelName: 'Amazon Nova Lite (cross region inference)'
  },
  {
    modelId: 'us.amazon.nova-micro-v1:0',
    modelName: 'Amazon Nova Micro (cross region inference)'
  }
]

export const getDefaultPromptRouter = (accountId: string, region: string) => {
  if (region === 'us-east-1' || region === 'us-west-2') {
    return [
      {
        modelId: `arn:aws:bedrock:${region}:${accountId}:default-prompt-router/anthropic.claude:1`,
        modelName: 'Claude Prompt Router'
      },
      {
        modelId: `arn:aws:bedrock:${region}:${accountId}:default-prompt-router/meta.llama:1`,
        modelName: 'Meta Prompt Router'
      }
    ]
  }

  return []
}
