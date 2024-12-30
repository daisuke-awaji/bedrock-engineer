import * as fs from 'fs/promises'
import * as path from 'path'
import GitignoreLikeMatcher from '../lib/gitignore-like-matcher'
import { ipcRenderer } from 'electron'
import { ContentChunker, ContentChunk } from '../lib/contentChunker'
import { AspectRatio, BedrockService, OutputFormat, StabilityModel } from '../../main/api/bedrock'

export class ToolService {
  async createFolder(folderPath: string): Promise<string> {
    try {
      await fs.mkdir(folderPath, { recursive: true })
      return `Folder created: ${folderPath}`
    } catch (e: any) {
      throw `Error creating folder: ${e.message}`
    }
  }

  async writeToFile(filePath: string, content: string): Promise<string> {
    try {
      await fs.writeFile(filePath, content)
      return `Content written to file: ${filePath}`
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
        const filePath = path.join(dirPath, file.name) // nosemgrep
        const relativeFilePath = path.relative(process.cwd(), filePath)

        // Check if the current file path matches any of the ignore file paths
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

      // 既存のチャンクストアからチャンクを取得を試みる
      const chunkStore: Map<string, ContentChunk[]> = global.chunkStore || new Map()
      let chunks: ContentChunk[] | undefined = chunkStore.get(url)

      // チャンクが存在しない場合は、新たにコンテンツを取得して分割
      if (!chunks) {
        const response = await ipcRenderer.invoke('fetch-website', url, requestOptions)
        const rawContent =
          typeof response.data === 'string' ? response.data : JSON.stringify(response.data, null, 2)
        chunks = ContentChunker.splitContent(rawContent, { url })

        // 新しいチャンクを保存
        chunkStore.set(url, chunks)
        global.chunkStore = chunkStore
      }

      // チャンクインデックスが指定されている場合は特定のチャンクを返す
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

      // チャンクインデックスが指定されていない場合で、かつチャンクの長さが1の場合は、そのチャンクの内容を返す
      if (chunks.length === 1) {
        return `Content successfully retrieved:\n\n${chunks[0].content}`
      }

      // チャンクインデックスが指定されていない場合はサマリーを返す
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

  async pexelsSearch(query: string): Promise<string> {
    try {
      const res = await fetch(`https://api.pexels.com/v1/search?${query}&per_page=1`, {
        headers: {
          Authorization: process.env.PRELOAD_VITE_PEXELS_API_KEY ?? ''
        }
      })
      return JSON.stringify(res)
    } catch (e: any) {
      throw `Error pexelsSearch: ${JSON.stringify(e)}`
    }
  }

  /**
   * Generate image from text prompt using Bedrock service.
   * @param bedrock
   * @param toolInput
   * @returns
   */
  async generateImage(
    bedrock: BedrockService,
    toolInput: {
      prompt: string
      outputPath: string
      modelId?: StabilityModel
      negativePrompt?: string
      aspect_ratio?: AspectRatio
      seed?: number
      output_format?: OutputFormat
    }
  ): Promise<string> {
    const {
      prompt,
      outputPath,
      modelId = 'stability.sd3-5-large-v1:0',
      negativePrompt,
      aspect_ratio,
      seed,
      output_format = 'png'
    } = toolInput

    try {
      // Generate image
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

      // Save the first generated image
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

        return JSON.stringify({
          success: false,
          error: 'Rate limit exceeded. Please try again with a different model.',
          suggestedModels: alternativeModels,
          message: error.message
        })
      }

      return JSON.stringify({
        success: false,
        error: 'Failed to generate image',
        message: error.message
      })
    }
  }
}
