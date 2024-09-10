import mermaid from 'mermaid'
import { useEffect } from 'react'

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

export const Mermaid = ({ chart, id }: { chart: string; id: string }) => {
  useEffect(() => {
    const ele = document.getElementById(id)
    if (ele) {
      mermaid.run({
        nodes: [ele]
      })
    }

    mermaid.parseError = (err: any, hash: any) => {
      console.error(err, hash)
    }
  }, [chart, id])

  const handleClick = () => {
    const ele = document.getElementById(id)
    ele?.requestFullscreen()
  }

  return (
    <div className="mermaid cursor-pointer bg-gray-100" id={id} onClick={() => handleClick()}>
      {chart}
    </div>
  )
}
