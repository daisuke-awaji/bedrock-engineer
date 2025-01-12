export type ToolName =
  | 'createFolder'
  | 'readFiles'
  | 'writeToFile'
  | 'listFiles'
  | 'moveFile'
  | 'copyFile'
  | 'tavilySearch'
  | 'fetchWebsite'
  | 'generateImage'
  | 'retrieve'
  | 'invokeBedrockAgent'
  | 'executeCommand'

export interface ToolResult<T = any> {
  name: ToolName
  success: boolean
  message?: string
  error?: string
  result: T
}
