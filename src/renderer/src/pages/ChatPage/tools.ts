import { Tool } from '@aws-sdk/client-bedrock-runtime'

const tools: Tool[] = [
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
  }
  // {
  //   toolSpec: {
  //     name: 'tavilySearch',
  //     description:
  //       'Perform a web search using Tavily API to get up-to-date information or additional context. Use this when you need current information or feel a search could provide a better answer.',
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
  // },
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

export default tools
