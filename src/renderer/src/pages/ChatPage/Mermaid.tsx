import mermaid from 'mermaid'
import React from 'react'
import { useEffect, useState } from 'react'
import { IoIosClose } from 'react-icons/io'

type Props = {
  code: string
  handler?: any
}

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
        className="w-full h-full flex justify-center aligh-center items-center"
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
          className="fixed left-1/2 top-1/2 z-[110] -translate-x-1/2 -translate-y-1/2 w-screen h-screen"
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
