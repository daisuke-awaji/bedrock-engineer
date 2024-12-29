import { Tool } from '@aws-sdk/client-bedrock-runtime'
import { ToolService } from './toolService'
import { store } from '../store'

export const executeTool = async (toolName: string | undefined, toolInput: any) => {
  const toolService = new ToolService()
  switch (toolName) {
    case 'createFolder':
      return toolService.createFolder(toolInput['path'])
    case 'readFiles':
      return toolService.readFiles(toolInput['paths'])
    case 'writeToFile':
      return toolService.writeToFile(toolInput['path'], toolInput['content'])
    case 'listFiles':
      const ignoreFiles = store.get('agentChatConfig')?.ignoreFiles
      console.log(ignoreFiles)
      return toolService.listFiles(toolInput['path'], '', ignoreFiles)
    case 'moveFile':
      return toolService.moveFile(toolInput['source'], toolInput['destination'])
    case 'copyFile':
      return toolService.copyFile(toolInput['source'], toolInput['destination'])
    case 'tavilySearch':
      const apiKey = store.get('tavilySearch')?.apikey
      return toolService.tavilySearch(toolInput['query'], apiKey)
    case 'fetchWebsite':
      return toolService.fetchWebsite(toolInput['url'], toolInput['options'])
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
  },
  {
    toolSpec: {
      name: 'fetchWebsite',
      description: `Fetch content from a specified URL. For large content, it will be automatically split into manageable chunks.
First call without a chunkIndex(Must be 1 or greater) to get an overview and total number of chunks. Then, if needed, call again with a specific chunkIndex to retrieve that chunk.`,
      inputSchema: {
        json: {
          type: 'object',
          properties: {
            url: {
              type: 'string',
              description: 'The URL to fetch content from'
            },
            options: {
              type: 'object',
              description: 'Optional request configurations',
              properties: {
                method: {
                  type: 'string',
                  description: 'HTTP method (GET, POST, etc.)',
                  enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS']
                },
                headers: {
                  type: 'object',
                  description: 'Request headers',
                  additionalProperties: {
                    type: 'string'
                  }
                },
                body: {
                  type: 'string',
                  description: 'Request body (for POST, PUT, etc.)'
                },
                chunkIndex: {
                  type: 'number',
                  description:
                    'Optional. The index of the specific chunk to fetch (starting from 1, Must be 1 or greater). If not provided, returns a summary of all chunks.'
                }
              }
            }
          },
          required: ['url']
        }
      }
    }
  }
]
