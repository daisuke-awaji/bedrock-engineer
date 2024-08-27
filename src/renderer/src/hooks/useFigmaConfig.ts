import { useEffect, useState } from 'react'

const useFigma = () => {
  const [accessToken, setStateAccessToken] = useState<string>('figd_xxxxxxxxx-xxxxxxx')

  const getFigmaConfig = () => {
    const figma = window.store.get('figma')
    return figma
  }

  useEffect(() => {
    const figma = getFigmaConfig()
    if (figma) {
      setAccessToken(figma.personalAccessToken)
    }
  }, [])

  const setAccessToken = (token: string) => {
    setStateAccessToken(token)
    window.store.set('figma', {
      personalAccessToken: token
    })
  }

  return {
    accessToken,
    setAccessToken
  }
}

export default useFigma
