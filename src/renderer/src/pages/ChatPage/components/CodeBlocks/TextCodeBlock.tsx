import React from 'react'

export const TextCodeBlock: React.FC<{ text: string }> = ({ text }) => {
  return (
    <pre className="bg-gray-800 text-white p-4 rounded-md overflow-x-auto whitespace-pre-wrap max-h-[50vh] max-w-[90vw]">
      <code>{text}</code>
    </pre>
  )
}
