// import Versions from './components/Versions'
// import electronLogo from './assets/electron.svg'
// import { useState } from 'react'
// import { streamChatCompletion } from './lib/api'
import GenerativeUIPage from './pages/GenerativeAIPage'

// const callConverseStream = async () => {
//   const res = await window.api.bedrock.converseStream({
//     modelId: 'anthropic.claude-3-haiku-20240307-v1:0',
//     system: [{ text: 'hello' }],
//     messages: [{ role: 'user', content: [{ text: 'hi' }] }]
//   })

//   if (res.stream === undefined) {
//     return
//   }

//   for await (const item of res.stream) {
//     console.log(item?.contentBlockDelta?.delta?.text)
//   }
// }

function App(): JSX.Element {
  return (
    <>
      <p className="text-blue-600 font-bold text-5xl ">Hello Tailwind</p>
      <GenerativeUIPage />
    </>
  )
  // const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')
  // const listModel = () => window.api.bedrock.listModels().then((res) => console.log(res))
  // const callConverseAPI = () => {
  //   window.api.bedrock
  //     .converse({
  //       modelId: 'anthropic.claude-3-haiku-20240307-v1:0',
  //       system: [{ text: 'hello' }],
  //       messages: [{ role: 'user', content: [{ text: 'hi' }] }]
  //     })
  //     .then((res) => console.log(res))
  // }
  // const [txt, setTxt] = useState('')
  // const fetchApi = async () => {
  //   const generator = streamChatCompletion({
  //     modelId: 'anthropic.claude-3-haiku-20240307-v1:0',
  //     system: [{ text: 'hello' }],
  //     messages: [{ role: 'user', content: [{ text: 'hi' }] }]
  //   })
  //   for await (const token of generator) {
  //     try {
  //       const json = JSON.parse(token)
  //       console.log(json)
  //       const text = json.contentBlockDelta?.delta?.text
  //       if (text) {
  //         setTxt((prev) => prev + json.contentBlockDelta?.delta?.text)
  //       }
  //     } catch (error) {
  //       console.log(token)
  //     }
  //   }
  // }
  // return (
  //   <>
  //     <img alt="logo" className="logo" src={electronLogo} />
  //     <div className="creator">Powered by electron-vite</div>
  //     <div className="text">
  //       Build an Electron app with <span className="react">React</span>
  //       &nbsp;and <span className="ts">TypeScript</span>
  //     </div>
  //     <p className="tip">
  //       Please try pressing <code>F12</code> to open the devTool
  //     </p>
  //     <div className="actions">
  //       <div className="action">
  //         <a href="https://electron-vite.org/" target="_blank" rel="noreferrer">
  //           Documentation
  //         </a>
  //       </div>
  //       <div className="action">
  //         <a target="_blank" rel="noreferrer" onClick={callConverseAPI}>
  //           Send IPC
  //         </a>
  //         <a target="_blank" rel="noreferrer" onClick={callConverseStream}>
  //           strem
  //         </a>
  //         <a target="_blank" rel="noreferrer" onClick={fetchApi}>
  //           fetch
  //         </a>
  //       </div>
  //       <div>{txt}</div>
  //     </div>
  //     <Versions></Versions>
  //   </>
  // )
}

export default App
