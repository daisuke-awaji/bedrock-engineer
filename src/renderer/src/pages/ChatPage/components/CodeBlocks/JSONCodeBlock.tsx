import React from 'react'

export const JSONCodeBlock: React.FC<{ json: any }> = ({ json }) => {
  const formattedJson = JSON.stringify(json, null, 2)
  return (
    <pre className="bg-gray-800 text-white p-4 rounded-md overflow-x-auto whitespace-pre-wrap max-h-[50vh] max-w-[90vw]">
      <code>{formattedJson}</code>
    </pre>
  )
}
