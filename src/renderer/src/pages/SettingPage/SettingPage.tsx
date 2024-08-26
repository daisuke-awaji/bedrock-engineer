import { useEffect } from 'react'

// setting page
const SettingPage = () => {
  useEffect(() => {
    console.log(window.store.counter)
  }, [])
  return (
    <div>
      <h1>SettingPage</h1>
    </div>
  )
}

export default SettingPage
