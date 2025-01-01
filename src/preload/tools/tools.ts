import { Tool } from '@aws-sdk/client-bedrock-runtime'
import { ToolService } from './toolService'
import { store } from '../store'
import { BedrockService } from '../../main/api/bedrock'

export const executeTool = async (toolName: string | undefined, toolInput: any) => {
  const toolService = new ToolService()
  const bedrock = new BedrockService({ store })
  switch (toolName) {
    case 'createFolder':
      return toolService.createFolder(toolInput['path'])
    case 'readFiles':
      return toolService.readFiles(toolInput['paths'])
    case 'writeToFile':
      return toolService.writeToFile(toolInput['path'], toolInput['content'])
    case 'listFiles': {
      const ignoreFiles = store.get('agentChatConfig').ignoreFiles
      console.log(ignoreFiles)
      return toolService.listFiles(toolInput['path'], '', ignoreFiles)
    }
    case 'moveFile':
      return toolService.moveFile(toolInput['source'], toolInput['destination'])
    case 'copyFile':
      return toolService.copyFile(toolInput['source'], toolInput['destination'])
    case 'tavilySearch': {
      const apiKey = store.get('tavilySearch').apikey
      return toolService.tavilySearch(toolInput['query'], apiKey)
    }
    case 'fetchWebsite':
      return toolService.fetchWebsite(toolInput['url'], toolInput['options'])
    case 'generateImage': {
      return toolService.generateImage(bedrock, {
        prompt: toolInput['prompt'],
        outputPath: toolInput['outputPath'],
        modelId: toolInput['modelId'],
        negativePrompt: toolInput['negativePrompt'],
        aspect_ratio: toolInput['aspect_ratio'],
        seed: toolInput['seed'],
        output_format: toolInput['output_format']
      })
    }
    case 'executeCommand':
      if (toolInput['pid'] && toolInput['stdin']) {
        // 標準入力を送信
        return toolService.executeCommand(
          {
            pid: toolInput['pid'],
            stdin: toolInput['stdin']
          },
          {
            allowedCommands: store.get('command').allowedCommands
          }
        )
      } else if (toolInput['command'] && toolInput['cwd']) {
        // 新しいコマンドを実行
        return toolService.executeCommand(
          {
            command: toolInput['command'],
            cwd: toolInput['cwd']
          },
          {
            allowedCommands: store.get('command').allowedCommands
          }
        )
      } else {
        throw new Error('Invalid input format for executeCommand: requires either (command, cwd) or (pid, stdin)')
      }
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
  },
  {
    toolSpec: {
      name: 'generateImage',
      description:
        'Generate an image using Amazon Bedrock Foundation Models. By default uses stability.sd3-5-large-v1:0. Images are saved to the specified path. For Titan models, specific aspect ratios and sizes are supported.',
      inputSchema: {
        json: {
          type: 'object',
          properties: {
            prompt: {
              type: 'string',
              description: 'Text description of the image you want to generate'
            },
            outputPath: {
              type: 'string',
              description:
                'Path where the generated image should be saved, including filename (e.g., "/path/to/image.png")'
            },
            modelId: {
              type: 'string',
              description:
                'Model to use. Includes Stability.ai models and Amazon models. Note that Amazon models have specific region availability.',
              enum: [
                'stability.sd3-5-large-v1:0',
                'stability.sd3-large-v1:0',
                'stability.stable-image-core-v1:1',
                'stability.stable-image-ultra-v1:1',
                'amazon.nova-canvas-v1:0',
                'amazon.titan-image-generator-v2:0',
                'amazon.titan-image-generator-v1'
              ],
              default: 'stability.sd3-5-large-v1:0'
            },
            negativePrompt: {
              type: 'string',
              description: 'Optional. Things to exclude from the image'
            },
            aspect_ratio: {
              type: 'string',
              description:
                'Optional. Aspect ratio of the generated image. For Titan models, specific sizes will be chosen based on the aspect ratio.',
              enum: [
                '1:1',
                '16:9',
                '2:3',
                '3:2',
                '4:5',
                '5:4',
                '9:16',
                '9:21',
                '5:3',
                '3:5',
                '7:9',
                '9:7',
                '6:11',
                '11:6',
                '5:11',
                '11:5',
                '9:5'
              ]
            },
            seed: {
              type: 'number',
              description:
                'Optional. Seed for deterministic generation. For Titan models, range is 0 to 2147483647.'
            },
            output_format: {
              type: 'string',
              description: 'Optional. Output format of the generated image',
              enum: ['png', 'jpeg', 'webp'],
              default: 'png'
            }
          },
          required: ['prompt', 'outputPath', 'modelId']
        }
      }
    }
  },
  {
    toolSpec: {
      name: 'executeCommand',
      description:
        'Execute a command or send input to a running process. First execute the command to get a PID, then use that PID to send input if needed. Usage: 1) First call with command and cwd to start process, 2) If input is required, call again with pid and stdin.',
      inputSchema: {
        json: {
          type: 'object',
          properties: {
            command: {
              type: 'string',
              description: 'The command to execute (used when starting a new process)'
            },
            cwd: {
              type: 'string',
              description: 'The working directory for the command execution (used with command)'
            },
            pid: {
              type: 'number',
              description: 'Process ID to send input to (used when sending input to existing process)'
            },
            stdin: {
              type: 'string',
              description: 'Standard input to send to the process (used with pid)'
            }
          }
        }
      }
    }
  }
]