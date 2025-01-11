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
  | 'executeCommand'

export interface ToolResult {
  name: ToolName
  success: boolean
  message?: string
  error?: string
  result: any
}
