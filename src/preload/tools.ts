import { Tool } from '@aws-sdk/client-bedrock-runtime'
import * as fs from 'fs/promises'
import * as path from 'path'
import { store } from './store'
import { applyPatch } from 'diff'

export async function createFolder(folderPath: string): Promise<string> {
  try {
    await fs.mkdir(folderPath, { recursive: true })
    return `Folder created: ${folderPath}`
  } catch (e: any) {
    return `Error creating folder: ${e.message}`
  }
}

export async function createFile(filePath: string, content: string): Promise<string> {
  try {
    await fs.writeFile(filePath, content)
    return `File created: ${filePath}`
  } catch (e: any) {
    return `Error creating file: ${e.message}`
  }
}

export async function writeToFile(filePath: string, content: string): Promise<string> {
  try {
    await fs.writeFile(filePath, content)
    return `Content written to file: ${filePath}`
  } catch (e: any) {
    return `Error writing to file: ${e.message}`
  }
}

export async function applyPatchToFile(filePath: string, patch: string): Promise<string> {
  try {
    // ファイルの内容を読み込む
    const originalContent = await fs.readFile(filePath, 'utf-8')

    // パッチを適用
    const patchedContent = applyPatch(originalContent, patch, { fuzzFactor: 2 })

    if (typeof patchedContent !== 'string') {
      throw new Error('Failed to apply patch')
    }

    // 変更された内容をファイルに書き込む
    await fs.writeFile(filePath, patchedContent, 'utf-8')

    return `Successfully applied patch to ${filePath}`
  } catch (e: any) {
    return `Error applying patch to ${filePath}: ${e.message}`
  }
}

export async function readFile(filePath: string): Promise<string> {
  try {
    const content = await fs.readFile(filePath, 'utf-8')
    return content
  } catch (e: any) {
    return `Error reading file: ${e.message}`
  }
}

export async function readMultipleFiles(filePaths: string[]): Promise<string> {
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
    return `Error reading multiple files: ${e.message}`
  }
}

export async function listFiles(dirPath = '.'): Promise<string> {
  try {
    const files = await fs.readdir(dirPath, { withFileTypes: true })
    const result = files
      .map((file) => {
        const type = file.isDirectory() ? 'Dir' : 'File'
        return `${type}: ${file.name}`
      })
      .join('\n')
    return result
  } catch (e: any) {
    return `Error listing files and directories: ${e.message}`
  }
}

export async function listDirectoryStructure(
  dirPath: string,
  prefix: string = ''
): Promise<string> {
  try {
    const files = await fs.readdir(dirPath, { withFileTypes: true })
    let result = ''

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const isLast = i === files.length - 1
      const currentPrefix = prefix + (isLast ? '└── ' : '├── ')
      const nextPrefix = prefix + (isLast ? '    ' : '│   ')

      if (file.isDirectory()) {
        result += `${currentPrefix}📁 ${file.name}\n`
        result += await listDirectoryStructure(path.join(dirPath, file.name), nextPrefix)
      } else {
        result += `${currentPrefix}📄 ${file.name}\n`
      }
    }

    return result
  } catch (e: any) {
    return `Error listing directory structure: ${e.message}`
  }
}
export async function moveFile(source: string, destination: string): Promise<string> {
  try {
    await fs.rename(source, destination)
    return `File moved: ${source} to ${destination}`
  } catch (e: any) {
    return `Error moving file: ${e.message}`
  }
}

export async function copyFile(source: string, destination: string): Promise<string> {
  try {
    await fs.copyFile(source, destination)
    return `File copied: ${source} to ${destination}`
  } catch (e: any) {
    return `Error copying file: ${e.message}`
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
        max_results: 1,
        include_domains: [],
        exclude_domains: []
      })
    })

    const body = await response.text()
    return body
  } catch (e: any) {
    return `Error searching: ${e.message}`
  }
}

export async function fetchAPI(url: string, options?: RequestInit): Promise<string> {
  try {
    const res = await fetch(url, options)
    const text = await res.text()
    return text
  } catch (e: any) {
    return `Error fetchAPI: ${JSON.stringify(e)}`
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
    return `Error pexelsSearch: ${JSON.stringify(e)}`
  }
}

export const executeTool = async (toolName: string | undefined, toolInput: any) => {
  switch (toolName) {
    case 'createFolder':
      return createFolder(toolInput['path'])
    case 'createFile':
      return createFile(toolInput['path'], toolInput['content'])
    case 'writeToFile':
      return writeToFile(toolInput['path'], toolInput['content'])
    case 'applyPatchToFile':
      return applyPatchToFile(toolInput['path'], toolInput['patch'])
    case 'readFile':
      return readFile(toolInput['path'])
    case 'readMultipleFiles':
      return readMultipleFiles(toolInput['paths'])
    case 'listFiles':
      return listFiles(toolInput['path'])
    case 'listDirectoryStructure':
      return listDirectoryStructure(toolInput['path'])
    case 'moveFile':
      return moveFile(toolInput['source'], toolInput['destination'])
    case 'copyFile':
      return copyFile(toolInput['source'], toolInput['destination'])
    case 'tavilySearch':
      return tavilySearch(toolInput['query'])
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
      name: 'createFile',
      description:
        'Create a new file at the specified path with optional content. Use this when you need to create a new file in the project structure.',
      inputSchema: {
        json: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'The path where the file should be created'
            },
            content: {
              type: 'string',
              description: 'The initial content of the file'
            }
          },
          required: ['path', 'content']
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
      name: 'applyPatchToFile',
      description:
        'Apply a patch to an existing file at the specified path. Use this when you need to make specific changes to parts of an existing file.',
      inputSchema: {
        json: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'The path of the file to apply the patch to'
            },
            patch: {
              type: 'string',
              description: `The patch content to apply. It must be a unified patch.
<example>
@@ -10,7 +10,7 @@
function greeting(name: string) {
- console.log("Hello, " + name);
+ console.log(\`Hello, \${name}!\`);
}
</example>`
            }
          },
          required: ['path', 'patch']
        }
      }
    }
  },
  {
    toolSpec: {
      name: 'readFile',
      description:
        'Read the contents of a file at the specified path. Use this when you need to examine the contents of an existing file.',
      inputSchema: {
        json: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'The path of the file to read'
            }
          },
          required: ['path']
        }
      }
    }
  },
  {
    toolSpec: {
      name: 'readMultipleFiles',
      description:
        'Read the contents of multiple files at the specified paths. Use this when you need to examine the contents of several existing files at once.',
      inputSchema: {
        json: {
          type: 'object',
          properties: {
            paths: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'An array of file paths to read'
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
        'List all files and directories in the specified folder. Use this when you need to see the contents of a specific directory.',
      inputSchema: {
        json: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'The path of the folder to list (default: current directory)'
            }
          }
        }
      }
    }
  },
  {
    toolSpec: {
      name: 'listDirectoryStructure',
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
]
