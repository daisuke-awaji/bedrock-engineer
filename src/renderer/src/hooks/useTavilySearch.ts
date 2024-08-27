import { useEffect, useState } from 'react'

const useTavilySearch = () => {
  const [apikey, setStateApiKey] = useState<string>('tvly-xxxxxxxxxxxxxxxxxxx')

  const getTavilySearchConfig = () => {
    const figma = window.store.get('tavilySearch')
    return figma
  }

  useEffect(() => {
    const config = getTavilySearchConfig()
    if (config) {
      setStateApiKey(config.apikey)
    }
  }, [])

  const setApiKey = (apikey: string) => {
    setStateApiKey(apikey)
    window.store.set('tavilySearch', {
      apikey: apikey
    })
  }

  return {
    apikey,
    setApiKey
  }
}

export default useTavilySearch
