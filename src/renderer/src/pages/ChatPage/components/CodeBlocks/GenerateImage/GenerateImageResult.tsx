import LocalImage from '@renderer/components/LocalImage'
import React from 'react'

interface GenerateImageResult {
  success: boolean
  name: string
  message: string
  result: {
    imagePath: string
    modelUsed: string
    seed?: number
    prompt: string
    negativePrompt?: string
    aspect_ratio: string
  }
}

export const GenerateImageResult: React.FC<{ response: GenerateImageResult }> = ({ response }) => {
  const { result } = response
  const imageUrl = `${result.imagePath}`

  return (
    <div className="flex gap-4 bg-gray-800 text-white dark:bg-gray-900 dark:text-gray-100 p-4 rounded-lg overflow-hidden shadow-sm border border-gray-700 dark:border-gray-800">
      {/* Image Display */}

      <LocalImage src={imageUrl} alt={result.prompt} className="aspect-auto h-[30vh]" />

      {/* Image Details */}
      <div className="space-y-3 text-sm text-gray-300 h-[30vh] overflow-y-scroll">
        {/* Prompt Section */}
        <div className="space-y-2">
          <div className="flex flex-col">
            <span className="font-semibold mb-1">Prompt:</span>
            <span className="font-mono bg-gray-900 dark:bg-gray-800 p-2 rounded-md">
              {result.prompt}
            </span>
          </div>

          {result.negativePrompt && (
            <div className="flex flex-col">
              <span className="font-semibold mb-1">Negative Prompt:</span>
              <span className="font-mono bg-gray-900 dark:bg-gray-800 p-2 rounded-md text-red-400">
                {result.negativePrompt}
              </span>
            </div>
          )}
        </div>

        {/* Technical Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 bg-gray-900 dark:bg-gray-800 p-3 rounded-md">
          <div className="flex items-center">
            <span className="font-semibold mr-2">Model:</span>
            <span className="font-mono">{result.modelUsed}</span>
          </div>

          <div className="flex items-center">
            <span className="font-semibold mr-2">Aspect Ratio:</span>
            <span className="font-mono">{result.aspect_ratio}</span>
          </div>

          {result.seed !== undefined && (
            <div className="flex items-center">
              <span className="font-semibold mr-2">Seed:</span>
              <span className="font-mono">{result.seed}</span>
            </div>
          )}

          <div className="flex items-center">
            <span className="font-semibold mr-2">Path:</span>
            <span className="font-mono text-xs truncate" title={result.imagePath}>
              {result.imagePath}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
