import { useEffect, useState } from 'react'

const useAgentChatSetting = () => {
  const [automode, setStateAutomode] = useState(false)

  useEffect(() => {
    setStateAutomode(false)
  }, [])

  const setAutomode = (b: boolean) => {
    window.store.set('agentChatConfig', {
      automode: b
    })
    setStateAutomode(b)
  }

  const getAutomode = () => {
    return window.store.get('agentChatConfig').automode
  }

  return { automode, setAutomode, getAutomode }
}

export default useAgentChatSetting
