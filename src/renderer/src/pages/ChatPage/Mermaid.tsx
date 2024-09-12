import mermaid from 'mermaid'
import { useEffect, useState } from 'react'
import { IoIosClose } from 'react-icons/io'

mermaid.initialize({
  theme: 'default',
  startOnLoad: true
})

mermaid.registerIconPacks([
  {
    name: 'logos',
    loader: () => import('@iconify-json/logos').then((module) => module.icons)
  }
])

const MermaidCore = ({ chart, id, handler }: { chart: string; id: string; handler?: any }) => {
  useEffect(() => {
    mermaid.contentLoaded()

    mermaid.parseError = (err: any, hash: any) => {
      console.error(err, hash)
    }
  }, [chart, id])

  return (
    <div
      className="mermaid w-full cursor-pointer bg-gray-100 dark:bg-gray-900 flex justify-center content-center h-full hover:shadow-lg duration-700 rounded-lg p-8"
      id={id}
      onClick={handler}
    >
      {chart}
    </div>
  )
}

export const Mermaid = ({ chart, id }: { chart: string; id: string }) => {
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
      <MermaidCore handler={() => setZoom(true)} chart={chart} id={id} />

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
          <MermaidCore chart={chart} id={id} />
        </div>
      )}
    </>
  )
}
