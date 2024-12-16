import { useEffect, useState } from 'react'

const useWebsiteGeneratorSettings = () => {
  const [kbId, setStateKbId] = useState<string | undefined>()
  const [enableKnowledgeBase, setStateEnableKnowledgeBase] = useState<boolean>(false)
  const [modelId, setStateModelId] = useState<string | undefined>()

  useEffect(() => {
    const settings = window.store.get('websiteGenerator')
    if (settings?.knowledgeBaseId) {
      setStateKbId(settings.knowledgeBaseId)
    }
    if (settings?.enableKnowledgeBase) {
      setStateEnableKnowledgeBase(settings.enableKnowledgeBase)
    }
    if (settings?.modelId) {
      setStateModelId(settings.modelId)
    }
  }, [])

  const setKnowledgeBaseId = (id: string) => {
    setStateKbId(id)
    const settings = window.store.get('websiteGenerator')
    window.store.set('websiteGenerator', {
      ...settings,
      knowledgeBaseId: id
    })
  }

  const setEnableKnowledgeBase = (bool: boolean) => {
    setStateEnableKnowledgeBase(bool)
    const settings = window.store.get('websiteGenerator')
    window.store.set('websiteGenerator', {
      ...settings,
      enableKnowledgeBase: bool
    })
  }

  const setModelId = (arn: string) => {
    setStateModelId(arn)
    const settings = window.store.get('websiteGenerator')
    window.store.set('websiteGenerator', {
      ...settings,
      modelId: arn
    })
  }

  return {
    kbId,
    setKnowledgeBaseId,
    enableKnowledgeBase,
    setEnableKnowledgeBase,
    modelId,
    setModelId
  }
}

export default useWebsiteGeneratorSettings
