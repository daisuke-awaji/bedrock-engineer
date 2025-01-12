import React, { useCallback } from 'react'

interface Completion {
  message: string
  files: { name: string; content: Uint8Array }[]
}

interface InvokeAgentResult {
  $metadata: {
    httpStatusCode: number
    requestId: string
    attempts: number
    totalRetryDelay: number
  }
  contentType: string
  sessionId: string
  completion?: Completion
}

interface BedrockAgentResponse {
  success: boolean
  name: string
  message: string
  result: InvokeAgentResult
}

// Uint8Array を Base64 文字列に変換する関数
const arrayBufferToBase64 = (buffer: Uint8Array): string => {
  let binary = ''
  const bytes = new Uint8Array(buffer)
  const len = bytes.byteLength
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return window.btoa(binary)
}

// ファイルの種類を判定する関数
const getFileType = (fileName: string): string => {
  const extension = fileName.split('.').pop()?.toLowerCase() || ''
  switch (extension) {
    case 'png':
      return 'image/png'
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg'
    case 'gif':
      return 'image/gif'
    case 'webp':
      return 'image/webp'
    default:
      return 'application/octet-stream'
  }
}

export const BedrockAgentResult: React.FC<{ response: BedrockAgentResponse }> = ({ response }) => {
  const { result } = response
  const completion = result.completion

  if (!completion) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
        <strong className="font-bold">Error:</strong>
        <span className="block sm:inline"> No completion data available.</span>
      </div>
    )
  }

  const handleClickFileSave = useCallback((file: Completion['files'][0]) => {
    // Blob を作成
    const blob = new Blob([file.content], { type: getFileType(file.name) })

    // ダウンロードリンクを作成
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = file.name
    document.body.appendChild(a)
    a.click()

    // クリーンアップ
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }, [])

  const renderFilePreview = (file: Completion['files'][0]) => {
    const isImage = /\.(png|jpg|jpeg|gif|webp)$/i.test(file.name)

    if (isImage) {
      // Base64 形式で画像を表示
      const base64 = arrayBufferToBase64(file.content)
      const mimeType = getFileType(file.name)
      return (
        <div className="mt-2">
          <img
            src={`data:${mimeType};base64,${base64}`}
            alt={file.name}
            className="max-w-xs max-h-48 object-contain rounded-lg shadow-md"
          />
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-4 bg-gray-800 text-white dark:bg-gray-900 dark:text-gray-100 p-4 rounded-lg overflow-hidden shadow-sm border border-gray-700 dark:border-gray-800">
      {/* Message Section */}
      <div className="space-y-2">
        <h3 className="text-sm font-bold text-gray-200">Response</h3>
        <div className="bg-gray-900 dark:bg-gray-800 p-4 rounded-lg">
          <p className="text-gray-300 whitespace-pre-wrap">{completion.message}</p>
        </div>
      </div>

      {/* Files Section - if any */}
      {completion.files.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-gray-200">Generated Files</h3>
          <div className="bg-gray-900 dark:bg-gray-800 p-4 rounded-lg">
            <ul className="space-y-4">
              {completion.files.map((file, index) => (
                <li key={index} className="space-y-2">
                  <div
                    className="flex items-center space-x-2 cursor-pointer hover:bg-gray-800 dark:hover:bg-gray-700 p-2 rounded-lg transition-colors"
                    onClick={() => handleClickFileSave(file)}
                    title="Click to download"
                  >
                    <span className="text-blue-400">📄</span>
                    <span className="text-gray-300">{file.name}</span>
                    <span className="text-gray-500 text-sm">({file.content.length} bytes)</span>
                  </div>
                  {renderFilePreview(file)}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Metadata Section */}
      <div className="space-y-2">
        <h3 className="text-sm font-bold text-gray-200">Metadata</h3>
        <div className="bg-gray-900 dark:bg-gray-800 p-4 rounded-lg">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Session ID:</span>
              <span className="ml-2 text-gray-300">{result.sessionId}</span>
            </div>
            <div>
              <span className="text-gray-400">Content Type:</span>
              <span className="ml-2 text-gray-300">{result.contentType}</span>
            </div>
            <div>
              <span className="text-gray-400">Status Code:</span>
              <span className="ml-2 text-gray-300">{result.$metadata.httpStatusCode}</span>
            </div>
            <div>
              <span className="text-gray-400">Request ID:</span>
              <span className="ml-2 text-gray-300">{result.$metadata.requestId}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
