import mermaid from 'mermaid'
import React from 'react'
import { useEffect, useState } from 'react'
import { IoIosClose } from 'react-icons/io'

type Props = {
  code: string
  handler?: any
}

mermaid.initialize({
  // syntax error が dom node に勝手に追加されないようにする
  // https://github.com/mermaid-js/mermaid/pull/4359
  suppressErrorRendering: true,
  securityLevel: 'loose', // SVGのレンダリングを許可
  theme: document.documentElement.classList.contains('dark') ? 'dark' : 'default',
  fontFamily: 'monospace', // フォントファミリーを指定
  fontSize: 16, // フォントサイズを指定
  htmlLabels: true // HTMLラベルを許可
})

export const MermaidCore: React.FC<Props> = (props) => {
  const { code } = props
  const outputRef = React.useRef<HTMLDivElement>(null)

  const render = React.useCallback(async () => {
    if (outputRef.current && code) {
      try {
        // 一意な ID を指定する必要あり
        const { svg } = await mermaid.render(`m${crypto.randomUUID()}`, code)
        outputRef.current.innerHTML = svg
      } catch (error) {
        console.error(error)
        outputRef.current.innerHTML = 'Invalid syntax'
      }
    }
  }, [code])

  React.useEffect(() => {
    render()
  }, [render])

  return code ? (
    <div
      onClick={props.handler}
      className="h-full w-full cursor-pointer bg-gray-100 dark:bg-gray-900 flex justify-center items-center content-center  hover:shadow-lg duration-700 rounded-lg p-8"
    >
      <div
        ref={outputRef}
        className="w-full h-full flex justify-center items-center overflow-visible"
        style={{ minHeight: '100px' }}
      />
    </div>
  ) : null
}

export const Mermaid = ({ chart }: { chart: string }) => {
  const [zoom, setZoom] = useState(false)

  // on click esc key
  useEffect(() => {
    const handleEsc = (event: any) => {
      if (event.keyCode === 27) {
        setZoom(false)
      }
    }
    window.addEventListener('keydown', handleEsc)
    return () => {
      window.removeEventListener('keydown', handleEsc)
    }
  }, [])

  return (
    <>
      <MermaidCore handler={() => setZoom(true)} code={chart} />

      {zoom && (
        <div
          className="fixed left-1/2 top-1/2 z-[110] -translate-x-1/2 -translate-y-1/2 w-[100%] h-[100%]"
          onClick={() => {
            setZoom(false)
          }}
        >
          {/* close button */}
          <div className="absolute top-0 right-0 z-[111] p-4" onClick={() => setZoom(false)}>
            <IoIosClose className="text-lg flex justify-center content-center w-8 h-8 dark:hover:bg-gray-400 hover:bg-gray-200 rounded cursor-pointer" />
          </div>

          <MermaidCore code={chart} />
        </div>
      )}
    </>
  )
}
