import { Tool } from '@aws-sdk/client-bedrock-runtime'
import { ToolService } from './toolService'
import { store } from '../store'
import { BedrockService } from '../../main/api/bedrock'
import { ToolInput, ToolResult } from '../../types/tools'

export const executeTool = async (input: ToolInput): Promise<string | ToolResult> => {
  const toolService = new ToolService()
  const bedrock = new BedrockService({ store })

  switch (input.type) {
    case 'createFolder':
      return toolService.createFolder(input.path)

    case 'readFiles':
      return toolService.readFiles(input.paths)

    case 'writeToFile':
      return toolService.writeToFile(input.path, input.content)

    case 'listFiles': {
      const ignoreFiles = store.get('agentChatConfig')?.ignoreFiles
      return toolService.listFiles(input.path, '', ignoreFiles)
    }

    case 'moveFile':
      return toolService.moveFile(input.source, input.destination)

    case 'copyFile':
      return toolService.copyFile(input.source, input.destination)

    case 'tavilySearch': {
      const apiKey = store.get('tavilySearch').apikey
      return toolService.tavilySearch(input.query, apiKey)
    }

    case 'fetchWebsite':
      return toolService.fetchWebsite(input.url, input.options)

    case 'generateImage':
      return toolService.generateImage(bedrock, {
        prompt: input.prompt,
        outputPath: input.outputPath,
        modelId: input.modelId,
        negativePrompt: input.negativePrompt,
        aspect_ratio: input.aspect_ratio,
        seed: input.seed,
        output_format: input.output_format
      })

    case 'retrieve':
      return toolService.retrieve(bedrock, {
        knowledgeBaseId: input.knowledgeBaseId,
        query: input.query
      })

    case 'invokeBedrockAgent': {
      const projectPath = store.get('projectPath')!
      return toolService.invokeBedrockAgent(bedrock, projectPath, {
        agentId: input.agentId,
        agentAliasId: input.agentAliasId,
        sessionId: input.sessionId,
        inputText: input.inputText,
        file: input.file
      })
    }

    case 'executeCommand': {
      const commandSettings = store.get('command')
      const commandConfig = {
        allowedCommands: commandSettings.allowedCommands,
        shell: commandSettings.shell
      }

      if ('pid' in input && 'stdin' in input && input?.pid && input?.stdin) {
        return toolService.executeCommand(
          {
            pid: input.pid,
            stdin: input.stdin
          },
          commandConfig
        )
      } else if ('command' in input && 'cwd' in input && input?.command && input?.cwd) {
        return toolService.executeCommand(
          {
            command: input.command,
            cwd: input.cwd
          },
          commandConfig
        )
      }

      throw new Error(
        'Invalid input format for executeCommand: requires either (command, cwd) or (pid, stdin)'
      )
    }
  }
}

// ツール定義（JSON Schema）
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
      name: 'retrieve',
      description:
        'Retrieve information from a knowledge base using Amazon Bedrock Knowledge Base. Use this when you need to get information from a knowledge base.',
      inputSchema: {
        json: {
          type: 'object',
          properties: {
            knowledgeBaseId: {
              type: 'string',
              description: 'The ID of the knowledge base to retrieve from'
            },
            query: {
              type: 'string',
              description: 'The query to search for in the knowledge base'
            }
          },
          required: ['knowledgeBaseId', 'query']
        }
      }
    }
  },
  {
    toolSpec: {
      name: 'invokeBedrockAgent',
      description:
        'Invoke an Amazon Bedrock Agent using the specified agent ID and alias ID. Use this when you need to interact with an agent.',
      inputSchema: {
        json: {
          type: 'object',
          properties: {
            agentId: {
              type: 'string',
              description: 'The ID of the agent to invoke'
            },
            agentAliasId: {
              type: 'string',
              description: 'The alias ID of the agent to invoke'
            },
            sessionId: {
              type: 'string',
              description:
                'Optional. The session ID to use for the agent invocation. The session ID is issued when you execute invokeBedrockAgent for the first time and is included in the response. Specify it if you want to continue the conversation from the second time onwards.'
            },
            inputText: {
              type: 'string',
              description: 'The input text to send to the agent'
            },
            file: {
              type: 'object',
              description:
                'Optional. The file to send to the agent. Be sure to specify if you need to analyze files.',
              properties: {
                filePath: {
                  type: 'string',
                  description: 'The path of the file to send to the agent'
                },
                useCase: {
                  type: 'string',
                  description:
                    'The use case of the file. Specify "CODE_INTERPRETER" if Python code analysis is required. Otherwise, specify "CHAT".',
                  enum: ['CODE_INTERPRETER', 'CHAT']
                }
              }
            }
          },
          required: ['agentId', 'agentAliasId', 'inputText']
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
              description:
                'Process ID to send input to (used when sending input to existing process)'
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
