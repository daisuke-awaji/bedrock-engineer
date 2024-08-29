import { useEffect, useState } from 'react'
import { SendMsgKey } from 'src/types/agent-chat'

const useAdvancedSetting = () => {
  const [sendMsgKey, setStateSendMsgKey] = useState<SendMsgKey>()

  useEffect(() => {
    const setting = window.store.get('advancedSetting')
    setStateSendMsgKey(setting?.keybinding?.sendMsgKey)
  }, [])

  const setSendMsgKey = (key: SendMsgKey) => {
    setStateSendMsgKey(key)
    window.store.set('advancedSetting', {
      keybinding: { sendMsgKey: key }
    })
  }

  return { sendMsgKey, setSendMsgKey }
}

export default useAdvancedSetting
