import React from 'react'

interface ExecuteCommandResponse {
  success: boolean
  name: string
  message: string
  stdout?: string
  stderr?: string
  exitCode?: number
  processInfo?: {
    pid: number
    command: string
    detached: boolean
  }
}

export const ExecuteCommandResult: React.FC<{ response: ExecuteCommandResponse }> = ({
  response
}) => {
  const removeAnsiCodes = (text: string) => {
    // ANSI エスケープシーケンスを削除
    return text.replace(/\u001b\[\??\d*[a-zA-Z]/g, '')
  }

  return (
    <div className="bg-gray-800 text-white dark:bg-gray-900 dark:text-gray-100 p-4 rounded-lg overflow-x-auto shadow-sm border border-gray-700 dark:border-gray-800">
      {/* Command Info */}
      {response.processInfo?.command && (
        <div className="mb-2">
          <span className="text-green-400">$ </span>
          <span className="font-mono">{response.processInfo.command}</span>
        </div>
      )}

      {/* Process ID */}
      {response.processInfo?.pid && (
        <div className="text-sm text-gray-400 mb-2">
          Process ID: {response.processInfo.pid}
          {response.processInfo.detached && ' (detached)'}
        </div>
      )}

      {/* Output */}
      {(response.stdout || response.stderr) && (
        <div className="font-mono whitespace-pre-wrap">
          {response.stdout && <div className="text-white">{removeAnsiCodes(response.stdout)}</div>}
          {response.stderr && response.stderr !== '\u001b[?1034h' && (
            <div className="text-red-400">{removeAnsiCodes(response.stderr)}</div>
          )}
        </div>
      )}

      {/* Exit Code */}
      {response.exitCode !== undefined && (
        <div
          className={`text-sm mt-2 ${response.exitCode === 0 ? 'text-green-400' : 'text-red-400'}`}
        >
          Exit Code: {response.exitCode}
        </div>
      )}
    </div>
  )
}
