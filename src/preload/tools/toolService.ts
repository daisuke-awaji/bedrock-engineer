import * as fs from 'fs/promises'
import * as path from 'path'
import GitignoreLikeMatcher from '../lib/gitignore-like-matcher'
import { ipcRenderer } from 'electron'
import { ContentChunker, ContentChunk } from '../lib/contentChunker'
import {
  AspectRatio,
  BedrockService,
  OutputFormat,
  ImageGeneratorModel
} from '../../main/api/bedrock'
import { CommandConfig, CommandInput, CommandStdinInput } from '../../main/api/command/types'
import { CommandService } from '../../main/api/command/commandService'

// コマンドサービスのインスタンスとその設定を保持
interface CommandServiceState {
  service: CommandService
  config: CommandConfig
}

let commandServiceState: CommandServiceState | null = null

export class ToolService {
  private getCommandService(config: CommandConfig): CommandService {
    // 設定が変更された場合は新しいインスタンスを作成
    if (
      !commandServiceState ||
      JSON.stringify(commandServiceState.config) !== JSON.stringify(config)
    ) {
      commandServiceState = {
        service: new CommandService(config),
        config
      }
    }
    return commandServiceState.service
  }

  async createFolder(folderPath: string): Promise<string> {
    try {
      await fs.mkdir(folderPath, { recursive: true })
      return `Folder created: ${folderPath}`
    } catch (e: any) {
      throw `Error creating folder: ${e.message}`
    }
  }

  async writeToFile(
    filePath: string,
    content: string,
    start_line?: number,
    end_line?: number
  ): Promise<string> {
    try {
      // 部分更新の場合
      if (typeof start_line === 'number') {
        // ファイルが存在しない場合は新規作成
        if (!(await this.fileExists(filePath))) {
          if (start_line > 1) {
            throw new Error('Cannot specify start_line > 1 for non-existent file')
          }
          await fs.writeFile(filePath, content)
          return `New file created with content: ${filePath}\n\n${content}`
        }

        // 既存ファイルの内容を読み込む
        const fileContent = await fs.readFile(filePath, 'utf-8')
        const lines = fileContent.split('\n')

        // 行番号を0ベースのインデックスに変換
        const startIndex = start_line - 1
        const endIndex = typeof end_line === 'number' ? end_line - 1 : startIndex

        // 範囲チェック
        if (startIndex < 0) {
          throw new Error('start_line must be greater than 0')
        }

        // 新しい内容を行配列に分割
        const newLines = content.split('\n')

        // 必要に応じて配列を拡張
        if (startIndex > lines.length) {
          lines.push(...Array(startIndex - lines.length).fill(''))
        }

        // 指定範囲の行を置換
        if (typeof end_line === 'number') {
          // 範囲指定の場合
          lines.splice(startIndex, endIndex - startIndex + 1, ...newLines)
        } else {
          // 単一行の場合
          lines.splice(startIndex, 1, ...newLines)
        }

        // 変更を保存
        await fs.writeFile(filePath, lines.join('\n'))

        return JSON.stringify(
          {
            success: true,
            message: `Updated ${
              typeof end_line === 'number'
                ? `lines ${start_line}-${end_line}`
                : `line ${start_line}`
            } in ${filePath}`,
            updatedContent: content
          },
          null,
          2
        )
      }

      // 通常の全体書き込み
      await fs.writeFile(filePath, content)
      return `Content written to file: ${filePath}\n\n${content}`
    } catch (e: any) {
      throw `Error writing to file: ${e.message}`
    }
  }

  async readFiles(filePaths: string[]): Promise<string> {
    try {
      const fileContents = await Promise.all(
        filePaths.map(async (filePath) => {
          const content = await fs.readFile(filePath, 'utf-8')
          return { path: filePath, content }
        })
      )

      const result = fileContents
        .map(({ path, content }) => {
          return `File: ${path}\n${'='.repeat(path.length + 6)}\n${content}\n\n`
        })
        .join('')

      return result
    } catch (e: any) {
      throw `Error reading multiple files: ${e.message}`
    }
  }

  async listFiles(dirPath: string, prefix: string = '', ignoreFiles?: string[]): Promise<string> {
    try {
      const files = await fs.readdir(dirPath, { withFileTypes: true })
      const matcher = new GitignoreLikeMatcher(ignoreFiles ?? [])
      let result = ''

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const isLast = i === files.length - 1
        const currentPrefix = prefix + (isLast ? '└── ' : '├── ')
        const nextPrefix = prefix + (isLast ? '    ' : '│   ')
        const filePath = path.join(dirPath, file.name)
        const relativeFilePath = path.relative(process.cwd(), filePath)

        if (ignoreFiles && ignoreFiles.length && matcher.isIgnored(relativeFilePath)) {
          continue
        }

        if (file.isDirectory()) {
          result += `${currentPrefix}📁 ${file.name}\n`
          result += await this.listFiles(filePath, nextPrefix)
        } else {
          result += `${currentPrefix}📄 ${file.name}\n`
        }
      }

      return result
    } catch (e: any) {
      throw `Error listing directory structure: ${e}`
    }
  }

  async moveFile(source: string, destination: string): Promise<string> {
    try {
      await fs.rename(source, destination)
      return `File moved: ${source} to ${destination}`
    } catch (e: any) {
      throw `Error moving file: ${e.message}`
    }
  }

  async copyFile(source: string, destination: string): Promise<string> {
    try {
      await fs.copyFile(source, destination)
      return `File copied: ${source} to ${destination}`
    } catch (e: any) {
      throw `Error copying file: ${e.message}`
    }
  }

  async tavilySearch(query: string, apiKey: string): Promise<string> {
    try {
      const response = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          api_key: apiKey,
          query,
          search_depth: 'advanced',
          include_answer: true,
          include_images: true,
          include_raw_content: true,
          max_results: 3,
          include_domains: [],
          exclude_domains: []
        })
      })

      const body = await response.json()
      return JSON.stringify(body, null, 2)
    } catch (e: any) {
      throw `Error searching: ${e.message}`
    }
  }

  async fetchWebsite(
    url: string,
    options?: RequestInit & { chunkIndex?: number }
  ): Promise<string> {
    try {
      const { chunkIndex, ...requestOptions } = options || {}
      const chunkStore: Map<string, ContentChunk[]> = global.chunkStore || new Map()
      let chunks: ContentChunk[] | undefined = chunkStore.get(url)

      if (!chunks) {
        const response = await ipcRenderer.invoke('fetch-website', url, requestOptions)
        const rawContent =
          typeof response.data === 'string' ? response.data : JSON.stringify(response.data, null, 2)
        chunks = ContentChunker.splitContent(rawContent, { url })
        chunkStore.set(url, chunks)
        global.chunkStore = chunkStore
      }

      if (typeof chunkIndex === 'number') {
        if (!chunks || chunks.length === 0) {
          throw new Error('No content chunks available')
        }

        if (chunkIndex < 1 || chunkIndex > chunks.length) {
          throw new Error(`Invalid chunk index. Available chunks: 1 to ${chunks.length}`)
        }

        const chunk = chunks[chunkIndex - 1]
        return `Chunk ${chunk.index}/${chunk.total}:\n\n${chunk.content}`
      }

      if (chunks.length === 1) {
        return `Content successfully retrieved:\n\n${chunks[0].content}`
      }

      return this.createChunkSummary(chunks)
    } catch (e: any) {
      throw `Error fetching website: ${e.message}`
    }
  }

  private createChunkSummary(chunks: ContentChunk[]): string {
    const summary = [
      `Content successfully retrieved and split into ${chunks.length} chunks:`,
      `URL: ${chunks[0].metadata?.url}`,
      `Timestamp: ${new Date(chunks[0].metadata?.timestamp ?? '').toISOString()}`,
      '\nTo retrieve specific chunks, use the fetchWebsite tool with chunkIndex option:',
      `Total Chunks: ${chunks.length}`,
      'Example usage:',
      '```',
      `fetchWebsite("${chunks[0].metadata?.url}", { chunkIndex: 1 })`,
      '```\n'
    ].join('\n')

    return summary
  }

  async generateImage(
    bedrock: BedrockService,
    toolInput: {
      prompt: string
      outputPath: string
      modelId: ImageGeneratorModel
      negativePrompt?: string
      aspect_ratio?: AspectRatio
      seed?: number
      output_format?: OutputFormat
    }
  ): Promise<string> {
    const {
      prompt,
      outputPath,
      modelId,
      negativePrompt,
      aspect_ratio,
      seed,
      output_format = 'png'
    } = toolInput

    try {
      const result = await bedrock.generateImage({
        modelId,
        prompt,
        negativePrompt,
        aspect_ratio,
        seed,
        output_format
      })

      if (!result.images || result.images.length === 0) {
        throw new Error('No image was generated')
      }

      const imageData = result.images[0]
      const binaryData = Buffer.from(imageData, 'base64')
      await fs.writeFile(outputPath, new Uint8Array(binaryData))

      return JSON.stringify({
        success: true,
        message: `Image generated successfully and saved to ${outputPath}`,
        modelUsed: modelId,
        seed: result.seeds?.[0]
      })
    } catch (error: any) {
      if (error.name === 'ThrottlingException') {
        const alternativeModels = [
          'stability.sd3-large-v1:0',
          'stability.stable-image-core-v1:1',
          'stability.stable-image-ultra-v1:1'
        ].filter((m) => m !== modelId)

        throw `Error generateImage: ${JSON.stringify({
          success: false,
          error: 'Rate limit exceeded. Please try again with a different model.',
          suggestedModels: alternativeModels,
          message: error.message
        })}`
      }

      throw `Error generateImage: ${JSON.stringify({
        success: false,
        error: 'Failed to generate image',
        message: error.message
      })}`
    }
  }

  async executeCommand(
    input: CommandInput | CommandStdinInput,
    config: CommandConfig
  ): Promise<string> {
    try {
      const commandService = this.getCommandService(config)
      let result

      if ('stdin' in input && 'pid' in input) {
        // 標準入力を送信
        result = await commandService.sendInput(input)
      } else if ('command' in input && 'cwd' in input) {
        // 新しいコマンドを実行
        result = await commandService.executeCommand(input)
      } else {
        throw new Error('Invalid input format')
      }

      return JSON.stringify({
        success: true,
        ...result
      })
    } catch (error) {
      throw JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      })
    }
  }

  // ファイルの存在確認用ヘルパーメソッド
  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath)
      return true
    } catch {
      return false
    }
  }
}
