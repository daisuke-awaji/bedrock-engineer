import { Tool } from '@aws-sdk/client-bedrock-runtime'
import * as fs from 'fs/promises'
import * as path from 'path'
import { store } from './store'
import * as diff from 'diff'
import GitignoreLikeMatcher from './lib/gitignore-like-matcher'

export async function createFolder(folderPath: string): Promise<string> {
  try {
    await fs.mkdir(folderPath, { recursive: true })
    return `Folder created: ${folderPath}`
  } catch (e: any) {
    throw `Error creating folder: ${e.message}`
  }
}

export async function writeToFile(filePath: string, content: string): Promise<string> {
  try {
    await fs.writeFile(filePath, content)
    return `Content written to file: ${filePath}`
  } catch (e: any) {
    throw `Error writing to file: ${e.message}`
  }
}

export async function readFiles(filePaths: string[]): Promise<string> {
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

export async function listFiles(dirPath: string, prefix: string = ''): Promise<string> {
  try {
    const files = await fs.readdir(dirPath, { withFileTypes: true })

    const ignoreFiles = store.get('agentChatConfig')?.ignoreFiles
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
        result += await listFiles(filePath, nextPrefix)
      } else {
        result += `${currentPrefix}📄 ${file.name}\n`
      }
    }

    return result
  } catch (e: any) {
    throw `Error listing directory structure: ${e}`
  }
}
export async function moveFile(source: string, destination: string): Promise<string> {
  try {
    await fs.rename(source, destination)
    return `File moved: ${source} to ${destination}`
  } catch (e: any) {
    throw `Error moving file: ${e.message}`
  }
}

export async function copyFile(source: string, destination: string): Promise<string> {
  try {
    await fs.copyFile(source, destination)
    return `File copied: ${source} to ${destination}`
  } catch (e: any) {
    throw `Error copying file: ${e.message}`
  }
}

export async function tavilySearch(query: string): Promise<string> {
  try {
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        api_key: store.get('tavilySearch').apikey,
        query,
        search_depth: 'advanced',
        include_answer: true,
        include_images: false,
        include_raw_content: true,
        max_results: 3,
        include_domains: [],
        exclude_domains: []
      })
    })

    const body = await response.text()
    return body
  } catch (e: any) {
    throw `Error searching: ${e.message}`
  }
}

export async function fetchAPI(url: string, options?: RequestInit): Promise<string> {
  try {
    const res = await fetch(url, options)
    const text = await res.text()
    return text
  } catch (e: any) {
    throw `Error fetchAPI: ${JSON.stringify(e)}`
  }
}

export async function pexelsSearch(query: string): Promise<string> {
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
 * @deprecated 生成AIの出力が安定しないので使用しない
 */
export async function applyUnifiedDiff(filePath: string, unifiedDiff: string): Promise<string> {
  try {
    // ファイルの現在の内容を読み取る
    const currentContent = await fs.readFile(filePath, 'utf-8')

    // 差分を適用する
    const patched = diff.applyPatch(currentContent, unifiedDiff)

    if (patched === false) {
      throw new Error('Failed to apply patch')
    }

    // 更新された内容をファイルに書き込む
    await fs.writeFile(filePath, patched)

    return `Successfully applied unified diff to ${filePath}`
  } catch (e: any) {
    throw `Error applying unified diff: ${e.message}`
  }
}

export const executeTool = async (toolName: string | undefined, toolInput: any) => {
  switch (toolName) {
    case 'createFolder':
      return createFolder(toolInput['path'])
    case 'readFiles':
      return readFiles(toolInput['paths'])
    case 'writeToFile':
      return writeToFile(toolInput['path'], toolInput['content'])
    case 'listFiles':
      return listFiles(toolInput['path'])
    case 'moveFile':
      return moveFile(toolInput['source'], toolInput['destination'])
    case 'copyFile':
      return copyFile(toolInput['source'], toolInput['destination'])
    case 'tavilySearch':
      return tavilySearch(toolInput['query'])
    // case 'applyUnifiedDiff':
    //   return applyUnifiedDiff(toolInput['filePath'], toolInput['unifiedDiff'])
    default:
      throw new Error(`Unknown tool: ${toolName}`)
  }
}

export const tools: Tool[] = [
  {
    toolSpec: {
      name: 'createFolder',
      description:
        'Create a new folder at the specified path. Use this when you need to create a new directory in the project structure.',
      inputSchema: {
        json: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'The path where the folder should be created'
            }
          },
          required: ['path']
        }
      }
    }
  },
  {
    toolSpec: {
      name: 'writeToFile',
      description:
        'Write content to an existing file at the specified path. Use this when you need to add or update content in an existing file.',
      inputSchema: {
        json: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'The path of the file to write to'
            },
            content: {
              type: 'string',
              description: 'The content to write to the file'
            }
          },
          required: ['path', 'content']
        }
      }
    }
  },
  {
    toolSpec: {
      name: 'readFiles',
      description:
        'Read the contents of multiple files at the specified paths, including text files and Excel files (.xlsx, .xls). For Excel files, the content is converted to CSV format. Use this when you need to examine the contents of several existing files at once.',
      inputSchema: {
        json: {
          type: 'object',
          properties: {
            paths: {
              type: 'array',
              items: {
                type: 'string'
              },
              description:
                'An array of file paths to read. Supports text files and Excel files (.xlsx, .xls).'
            }
          },
          required: ['paths']
        }
      }
    }
  },
  {
    toolSpec: {
      name: 'listFiles',
      description:
        'List the entire directory structure, including all subdirectories and files, in a hierarchical format. Use this when you need a comprehensive view of the project structure.',
      inputSchema: {
        json: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'The root path to start listing the directory structure from'
            }
          },
          required: ['path']
        }
      }
    }
  },
  {
    toolSpec: {
      name: 'moveFile',
      description:
        'Move a file from one location to another. Use this when you need to organize files in the project structure.',
      inputSchema: {
        json: {
          type: 'object',
          properties: {
            source: {
              type: 'string',
              description: 'The current path of the file'
            },
            destination: {
              type: 'string',
              description: 'The new path for the file'
            }
          },
          required: ['source', 'destination']
        }
      }
    }
  },
  {
    toolSpec: {
      name: 'copyFile',
      description:
        'Copy a file from one location to another. Use this when you need to duplicate a file in the project structure.',
      inputSchema: {
        json: {
          type: 'object',
          properties: {
            source: {
              type: 'string',
              description: 'The path of the file to copy'
            },
            destination: {
              type: 'string',
              description: 'The new path for the copied file'
            }
          },
          required: ['source', 'destination']
        }
      }
    }
  },
  {
    toolSpec: {
      name: 'tavilySearch',
      description:
        'Perform a web search using Tavily API to get up-to-date information or additional context. Use this when you need current information or feel a search could provide a better answer.',
      inputSchema: {
        json: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'The search query'
            }
          },
          required: ['query']
        }
      }
    }
  }
  // {
  //   toolSpec: {
  //     name: 'applyUnifiedDiff',
  //     description: 'Apply a unified diff to a file, modifying its contents accordingly.',
  //     inputSchema: {
  //       json: {
  //         type: 'object',
  //         properties: {
  //           filePath: {
  //             type: 'string',
  //             description: 'The path of the file to modify'
  //           },
  //           unifiedDiff: {
  //             type: 'string',
  //             description: 'The unified diff to apply to the file'
  //           }
  //         },
  //         required: ['filePath', 'unifiedDiff']
  //       }
  //     }
  //   }
  // }
]
