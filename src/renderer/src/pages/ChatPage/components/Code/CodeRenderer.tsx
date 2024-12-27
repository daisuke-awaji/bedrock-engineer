import { useCallback } from 'react'
import { Mermaid } from './Mermaid'
import MD from '../../../../components/Markdown/MD'

type CodeRendererProps = {
  text?: string
}
const CodeRenderer = (props: CodeRendererProps) => {
  const { text } = props

  const renderMarkdownAndCodePreview = useCallback(() => {
    const htmlMatches = text?.match(/```html([\s\S]*?)```/g) || []
    const mermaidMatches = text?.match(/```mermaid([\s\S]*?)```/g) || []

    const match = htmlMatches.length || mermaidMatches.length

    return match ? (
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
  }, [text])

  return <div className="w-full dark:text-white">{renderMarkdownAndCodePreview()}</div>
}

export default CodeRenderer
