import { useEffect, useState } from 'react'

const useWebsiteGeneratorSettings = () => {
  const [kbId, setStateKbId] = useState<string | undefined>()
  const [enableKnowledgeBase, setStateEnableKnowledgeBase] = useState<boolean>(false)

  useEffect(() => {
    const settings = window.store.get('websiteGenerator')
    if (settings.knowledgeBaseId) {
      setStateKbId(settings.knowledgeBaseId)
    }
    if (settings.enableKnowledgeBase) {
      setStateEnableKnowledgeBase(settings.enableKnowledgeBase)
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

  return { kbId, setKnowledgeBaseId, enableKnowledgeBase, setEnableKnowledgeBase }
}

export default useWebsiteGeneratorSettings
