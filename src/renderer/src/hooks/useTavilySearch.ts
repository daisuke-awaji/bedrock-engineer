import { useEffect, useState } from 'react'

const useTavilySearch = () => {
  const [apikey, setStateApiKey] = useState<string>('tvly-xxxxxxxxxxxxxxxxxxx')

  const getTavilySearchConfig = () => {
    const tavilySearchConfig = window.store.get('tavilySearch')
    return tavilySearchConfig
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

  const enabledTavilySearch = apikey !== 'tvly-xxxxxxxxxxxxxxxxxxx'

  return {
    apikey,
    setApiKey,
    enabledTavilySearch
  }
}

export default useTavilySearch
