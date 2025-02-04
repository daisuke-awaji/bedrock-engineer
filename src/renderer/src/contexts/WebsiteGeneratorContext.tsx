import React, { createContext, useContext, useState, useEffect } from 'react'
import { KnowledgeBase } from '@/types/agent-chat'

interface WebsiteGeneratorContextType {
  // Knowledge Base Settings
  knowledgeBases: KnowledgeBase[]
  setKnowledgeBases: (knowledgeBases: KnowledgeBase[]) => void
  enableKnowledgeBase: boolean
  setEnableKnowledgeBase: (bool: boolean) => void
}

const WebsiteGeneratorContext = createContext<WebsiteGeneratorContextType | undefined>(undefined)

export const WebsiteGeneratorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Knowledge Base Settings
  const [knowledgeBases, setStateKnowledgeBases] = useState<KnowledgeBase[]>([])
  const [enableKnowledgeBase, setStateEnableKnowledgeBase] = useState<boolean>(false)

  // Initialize settings
  useEffect(() => {
    const settings = window.store.get('websiteGenerator')
    if (settings?.knowledgeBases) {
      setStateKnowledgeBases(settings.knowledgeBases)
    }
    if (settings?.enableKnowledgeBase) {
      setStateEnableKnowledgeBase(settings.enableKnowledgeBase)
    }
  }, [])

  const setKnowledgeBases = (knowledgeBases: KnowledgeBase[]) => {
    const settings = window.store.get('websiteGenerator')
    setStateKnowledgeBases(knowledgeBases)
    window.store.set('websiteGenerator', {
      ...settings,
      knowledgeBases: knowledgeBases
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

  const value = {
    knowledgeBases,
    setKnowledgeBases,
    enableKnowledgeBase,
    setEnableKnowledgeBase
  }

  return (
    <WebsiteGeneratorContext.Provider value={value}>{children}</WebsiteGeneratorContext.Provider>
  )
}

export const useWebsiteGeneratorSetting = () => {
  const context = useContext(WebsiteGeneratorContext)
  if (context === undefined) {
    throw new Error('useWebsiteGenerator must be used within a WebsiteGeneratorProvider')
  }
  return context
}
