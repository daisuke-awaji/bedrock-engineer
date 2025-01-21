import React from 'react'

interface Props {
  result: {
    title: string
    url: string
    content: string
    score: number
  }
}

export const SearchResult: React.FC<Props> = ({ result }) => {
  const { title, url, content, score } = result

  const handleUrlClick = (url: string) => {
    open(url)
  }

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 p-4">
      {/* Title & Score */}
      <div className="flex items-start justify-between gap-4 mb-2">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white line-clamp-2 text-sm">
          {title}
        </h3>
        <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium px-2.5 py-0.5 rounded whitespace-nowrap">
          {(score * 100).toFixed(1)}%
        </span>
      </div>

      {/* URL */}
      <div
        className="text-xs text-blue-600 dark:text-blue-400 hover:underline cursor-pointer mb-2 break-all"
        onClick={() => handleUrlClick(url)}
      >
        {url}
      </div>

      {/* Content */}
      <p className="text-xs text-gray-700 dark:text-gray-300 line-clamp-3">{content}</p>
    </div>
  )
}
