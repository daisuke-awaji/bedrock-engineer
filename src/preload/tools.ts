import { Tool } from '@aws-sdk/client-bedrock-runtime'
import * as fs from 'fs/promises'
import { store } from './store'

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

export async function readFile(filePath: string): Promise<string> {
  try {
    const content = await fs.readFile(filePath, 'utf-8')
    return content
  } catch (e: any) {
    return `Error reading file: ${e.message}`
  }
}

// export async function listFiles(dirPath = '.'): Promise<string> {
//   try {
//     const files = await fs.readdir(dirPath)
//     return files.join('\n')
//   } catch (e: any) {
//     return `Error listing files: ${e.message}`
//   }
// }

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
    case 'readFile':
      return readFile(toolInput['path'])
    case 'listFiles':
      return listFiles(toolInput['path'])
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
      name: 'listFiles',
      description:
        'List all files and directories in the root folder where the script is running. Use this when you need to see the contents of the current directory.',
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
  //     name: 'fetchAPI',
  //     description:
  //       'Fetch data from a specified API endpoint. Use this when you need to retrieve data from a third-party API.',
  //     inputSchema: {
  //       json: {
  //         type: 'object',
  //         properties: {
  //           url: {
  //             type: 'string',
  //             description: 'The URL of the API endpoint'
  //           },
  //           options: {
  //             type: 'object',
  //             description:
  //               "The options for the fetch request. This specifies the Node.js fetch api's second argument 'RequestInit' "
  //           }
  //         },
  //         required: ['url']
  //       }
  //     }
  //   }
  // },
  // {
  //   toolSpec: {
  //     name: 'pexelsSearch',
  //     description:
  //       'Search for photos on Pexels. Use this when you need to retrieve photos from the Pexels API.',
  //     inputSchema: {
  //       json: {
  //         type: 'object',
  //         properties: {
  //           query: {
  //             type: 'string',
  //             description: 'The search query'
  //           }
  //         },
  //         required: ['query']
  //       }
  //     }
  //   }
  // }
]
