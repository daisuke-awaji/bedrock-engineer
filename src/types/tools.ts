import { AspectRatio, ImageGeneratorModel } from '../main/api/bedrock'

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

// ツールごとの入力型定義
export type CreateFolderInput = {
  type: 'createFolder'
  path: string
}

export type ReadFilesInput = {
  type: 'readFiles'
  paths: string[]
}

export type WriteToFileInput = {
  type: 'writeToFile'
  path: string
  content: string
}

export type ListFilesInput = {
  type: 'listFiles'
  path: string
}

export type MoveFileInput = {
  type: 'moveFile'
  source: string
  destination: string
}

export type CopyFileInput = {
  type: 'copyFile'
  source: string
  destination: string
}

export type TavilySearchInput = {
  type: 'tavilySearch'
  query: string
}

export type FetchWebsiteInput = {
  type: 'fetchWebsite'
  url: string
  options?: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS'
    headers?: Record<string, string>
    body?: string
    chunkIndex?: number
  }
}

export type GenerateImageInput = {
  type: 'generateImage'
  prompt: string
  outputPath: string
  modelId: ImageGeneratorModel
  negativePrompt?: string
  aspect_ratio?: AspectRatio
  seed?: number
  output_format?: 'png' | 'jpeg' | 'webp'
}

export type RetrieveInput = {
  type: 'retrieve'
  knowledgeBaseId: string
  query: string
}

export type InvokeBedrockAgentInput = {
  type: 'invokeBedrockAgent'
  agentId: string
  agentAliasId: string
  inputText: string
  sessionId?: string
  file?: {
    filePath: string
    useCase: 'CODE_INTERPRETER' | 'CHAT'
  }
}

export type ExecuteCommandInput = {
  type: 'executeCommand'
} & (
  | {
      command: string
      cwd: string
      pid?: never
      stdin?: never
    }
  | {
      command?: never
      cwd?: never
      pid: number
      stdin: string
    }
)

// ディスクリミネーテッドユニオン型
export type ToolInput =
  | CreateFolderInput
  | ReadFilesInput
  | WriteToFileInput
  | ListFilesInput
  | MoveFileInput
  | CopyFileInput
  | TavilySearchInput
  | FetchWebsiteInput
  | GenerateImageInput
  | RetrieveInput
  | InvokeBedrockAgentInput
  | ExecuteCommandInput

// ツール名から入力型を取得するユーティリティ型
export type ToolInputTypeMap = {
  createFolder: CreateFolderInput
  readFiles: ReadFilesInput
  writeToFile: WriteToFileInput
  listFiles: ListFilesInput
  moveFile: MoveFileInput
  copyFile: CopyFileInput
  tavilySearch: TavilySearchInput
  fetchWebsite: FetchWebsiteInput
  generateImage: GenerateImageInput
  retrieve: RetrieveInput
  invokeBedrockAgent: InvokeBedrockAgentInput
  executeCommand: ExecuteCommandInput
}
