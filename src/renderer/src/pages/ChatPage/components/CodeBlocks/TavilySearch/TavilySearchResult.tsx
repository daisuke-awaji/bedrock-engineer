import React from 'react'
import { SearchResult } from './SearchResult'
import { SearchImage } from './SearchImage'

interface SearchResult {
  title: string
  url: string
  content: string
  score: number
  raw_content: string
}

interface TavilySearchResponse {
  name: string
  success: boolean
  message: string
  result: {
    query: string
    follow_up_questions: null | string[]
    answer: string
    images: string[]
    results: SearchResult[]
    response_time: number
  }
}

interface Props {
  response: TavilySearchResponse
}

export const TavilySearchResult: React.FC<Props> = ({ response }) => {
  return (
    <div className="space-y-4">
      {/* Answer Section */}
      {response.result.answer && (
        <div>
          <h3 className="text-sm font-bold mb-2 text-gray-900 dark:text-white">Answer</h3>
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm text-sm">
            <p className="text-gray-700 dark:text-gray-300">{response.result.answer}</p>
          </div>
        </div>
      )}

      {/* Search Results */}
      {response.result.results.length > 0 && (
        <div>
          <h3 className="text-sm font-bold mb-2 text-gray-900 dark:text-white">Sources</h3>
          <div className="space-y-4 max-h-[50vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-200 dark:scrollbar-track-gray-800">
            {response.result.results.map((result, index) => (
              <SearchResult key={index} result={result} />
            ))}
          </div>
        </div>
      )}

      {/* Images Grid */}
      {response.result.images.length > 0 && (
        <div>
          <h3 className="text-sm font-bold mb-2 text-gray-900 dark:text-white">Images</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {response.result.images.map((image, index) => (
              <SearchImage key={index} url={image} />
            ))}
          </div>
        </div>
      )}

      {/* Follow-up Questions */}
      {response.result.follow_up_questions && response.result.follow_up_questions.length > 0 && (
        <div>
          <h3 className="text-sm font-bold mb-2 text-gray-900 dark:text-white">
            Follow-up Questions
          </h3>
          <ul className="space-y-2">
            {response.result.follow_up_questions.map((question, index) => (
              <li
                key={index}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-sm text-gray-700 dark:text-gray-300"
              >
                {question}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
