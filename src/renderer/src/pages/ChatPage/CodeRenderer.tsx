import { useCallback } from 'react'
import MD from './MD'
import { Mermaid } from './Mermaid'

function convertToId(str) {
  // 文字列を小文字に変換
  str = str.toLowerCase()

  // 空白文字を'-'に置換
  str = str.replace(/\s+/g, '-')

  // 30文字だけ抜き出す
  str = str.slice(0, 30)

  return str
}

type CodeRendererProps = {
  text?: string
  showCodePreview: boolean
}
const CodeRenderer = (props: CodeRendererProps) => {
  const { text, showCodePreview } = props

  const MDAndCodePreview = useCallback(() => {
    const htmlMatches = text?.match(/```html([\s\S]*?)```/g) || []
    const mermaidMatches = text?.match(/```mermaid([\s\S]*?)```/g) || []

    return showCodePreview ? (
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
            return (
              <div className="flex justify-center align-center" key={`mermaid-${index}`}>
                <Mermaid chart={code} id={`mermaid-${index}}-${convertToId(code)}`} />
              </div>
            )
          })}
        </div>
      </div>
    ) : (
      <MD>{text}</MD>
    )
  }, [text, showCodePreview])

  return (
    <div className="w-full">
      <MDAndCodePreview />
    </div>
  )
}

export default CodeRenderer
