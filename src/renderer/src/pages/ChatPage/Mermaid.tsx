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
    mermaid.contentLoaded()

    mermaid.parseError = (err: any, hash: any) => {
      console.error(err, hash)
    }
  }, [chart, id])

  return (
    <div className="mermaid w-full cursor-pointer bg-gray-100" id={id}>
      {chart}
    </div>
  )
}
