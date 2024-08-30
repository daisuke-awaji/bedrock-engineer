import { useEffect, useState } from 'react'

const useWebsiteGeneratorSettings = () => {
  const [kbId, setStateKbId] = useState<string | undefined>()

  useEffect(() => {
    const settings = window.store.get('websiteGenerator')
    if (settings.knowledgeBaseId) {
      setStateKbId(settings.knowledgeBaseId)
    }
  }, [])

  const setKnowledgeBaseId = (id: string) => {
    setStateKbId(id)
    window.store.set('websiteGenerator', {
      knowledgeBaseId: id
    })
  }

  return { kbId, setKnowledgeBaseId }
}

export default useWebsiteGeneratorSettings
