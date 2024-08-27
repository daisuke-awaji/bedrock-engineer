import { useEffect, useState } from 'react'
import { LLM } from 'src/types/llm'

const useLLM = () => {
  const [llm, setStateLlm] = useState<LLM>({
    modelId: 'anthropic.claude-3-haiku-20240307-v1:0',
    modelName: 'Claude 3 Haiku'
  })

  const [availableModels, setAvailableModels] = useState<LLM[]>([])
  const fetchModels = async () => {
    const models = await window.api.bedrock.listModels()
    if (models) {
      setAvailableModels(models as LLM[])
    }
  }
  const getSelectedModel = async () => {
    const model = window.store.get('llm')
    if (model) {
      setStateLlm(model)
    }
  }

  const setLLM = (selectedModel: LLM) => {
    setStateLlm(selectedModel)
    window.store.set('llm', selectedModel)
  }

  useEffect(() => {
    getSelectedModel()
    fetchModels()
  }, [])

  return { llm, setLLM, availableModels }
}

export default useLLM
