import { useCallback } from 'react'
import MD from './MD'
import { Mermaid } from './Mermaid'

type CodeRendererProps = {
  text?: string
  showCodePreview: boolean
}
const CodeRenderer = (props: CodeRendererProps) => {
  const { text, showCodePreview } = props

  const renderMarkdownAndCodePreview = useCallback(() => {
    const htmlMatches = text?.match(/```html([\s\S]*?)```/g) || []
    const mermaidMatches = text?.match(/```mermaid([\s\S]*?)```/g) || []

    const match = htmlMatches.length || mermaidMatches.length

    return showCodePreview && match ? (
      <div className="grid grid-cols-2 gap-2">
        <MD>{text}</MD>
        <div className="grid gap-2">
          {htmlMatches.map((match, index) => {
            const code = match.replace(/^```html\n?|\n?```$/g, '').trim()
            return (
              <iframe
                key={`html-${index}`}
                srcDoc={code}
                className="h-full w-full border rounded-md border-gray-300"
              />
            )
          })}
          {mermaidMatches.map((match, index) => {
            const code = match.replace(/^```mermaid\n?|\n?```$/g, '').trim()
            return <Mermaid chart={code} key={`mermaid-${index}`} />
          })}
        </div>
      </div>
    ) : (
      <MD>{text}</MD>
    )
  }, [text, showCodePreview])

  return <div className="w-full dark:text-white">{renderMarkdownAndCodePreview()}</div>
}

export default CodeRenderer
