import React, { useMemo } from 'react'
import { Mermaid } from './Mermaid'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import MD from '@renderer/components/Markdown/MD'

// Types
type CodeRendererProps = {
  text?: string
  className?: string
}

type HtmlPreviewProps = {
  code: string
  className?: string
}

type CodePreviewGridProps = {
  htmlBlocks: string[]
  mermaidBlocks: string[]
}

// Utility functions for parsing code blocks
const parseHtmlBlocks = (text: string): string[] => {
  return (
    text
      .match(/```html([\s\S]*?)```/g)
      ?.map((match) => match.replace(/^```html\n?|\n?```$/g, '').trim()) || []
  )
}

const parseMermaidBlocks = (text: string): string[] => {
  return (
    text
      .match(/```mermaid([\s\S]*?)```/g)
      ?.map((match) => match.replace(/^```mermaid\n?|\n?```$/g, '').trim()) || []
  )
}

// Resizer Handle Component
const ResizeHandle: React.FC = () => (
  <PanelResizeHandle className="group relative w-2 mx-1">
    <div className="absolute top-0 bottom-0 left-1/2 w-1 -translate-x-1/2 group-hover:bg-slate-200 group-active:bg-slate-300 rounded transition-colors" />
  </PanelResizeHandle>
)

// Preview Components
const HtmlPreview: React.FC<HtmlPreviewProps> = ({ code, className }) => (
  <iframe
    srcDoc={code}
    className={`h-full w-full border rounded-md border-gray-300 ${className}`}
  />
)

const CodePreviewGrid: React.FC<CodePreviewGridProps> = ({ htmlBlocks, mermaidBlocks }) => (
  <div className="grid gap-2 h-full overflow-auto">
    {htmlBlocks.map((code, index) => (
      <HtmlPreview key={`html-${index}`} code={code} />
    ))}
    {mermaidBlocks.map((code, index) => (
      <Mermaid chart={code} key={`mermaid-${index}`} />
    ))}
  </div>
)

// Main Component
export const CodeRenderer: React.FC<CodeRendererProps> = ({ text = '', className = '' }) => {
  // Parse code blocks and check if preview is needed
  const { htmlBlocks, mermaidBlocks, hasPreviewContent } = useMemo(() => {
    const html = parseHtmlBlocks(text)
    const mermaid = parseMermaidBlocks(text)
    return {
      htmlBlocks: html,
      mermaidBlocks: mermaid,
      hasPreviewContent: html.length > 0 || mermaid.length > 0
    }
  }, [text])

  // If no preview content, render markdown only
  if (!hasPreviewContent) {
    return (
      <div className={`w-full dark:text-white ${className}`}>
        <MD>{text}</MD>
      </div>
    )
  }

  // Render markdown and preview grid with resizable panels
  return (
    <div className={`w-full dark:text-white ${className}`}>
      <PanelGroup direction="horizontal" autoSaveId="code-preview-panels">
        <Panel defaultSize={50} minSize={30} className="overflow-auto">
          <div className="pr-2">
            <MD>{text}</MD>
          </div>
        </Panel>

        <ResizeHandle />

        <Panel defaultSize={50} minSize={30} className="overflow-auto">
          <div className="pl-2">
            <CodePreviewGrid htmlBlocks={htmlBlocks} mermaidBlocks={mermaidBlocks} />
          </div>
        </Panel>
      </PanelGroup>
    </div>
  )
}

export default CodeRenderer
