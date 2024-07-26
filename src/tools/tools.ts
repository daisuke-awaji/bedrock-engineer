import * as fs from "fs/promises";
import { Tool } from "@aws-sdk/client-bedrock-runtime";
import {
  CloudFormationClient,
  CreateStackCommand,
  DescribeStackEventsCommand,
  DescribeStacksCommand,
  ListStacksCommand,
  Parameter,
  StackStatus,
  UpdateStackCommand,
} from "@aws-sdk/client-cloudformation";
// import { CloudWatchLogsClient } from "@aws-sdk/client-cloudwatch-logs";
import { promisify } from "util";
import { exec } from "child_process";
import { isStackStatuses } from "./functions";
import { capabilities, STACK_STATUS } from "./constants";
const promiseExec = promisify(exec);

const region = "us-east-1";
const cfn = new CloudFormationClient({ region });
// const cloudwatch = new CloudWatchLogsClient({ region });

export async function createStack(
  template: string,
  stackName: string,
  parameters?: Parameter[]
): Promise<string> {
  try {
    const cmd = new CreateStackCommand({
      TemplateBody: template,
      StackName: stackName,
      Parameters: parameters,
      Capabilities: capabilities,
      OnFailure: "DELETE",
      Tags: [
        {
          Key: "project",
          Value: "bedrock-engineer",
        },
      ],
    });
    const res = await cfn.send(cmd);
    return `Stack created: ${stackName}, StackId: ${res.StackId}`;
  } catch (e) {
    return `Error createStack: ${JSON.stringify(e)}`;
  }
}

export async function describeStack(stackName: string): Promise<string> {
  try {
    const cmd = new DescribeStacksCommand({
      StackName: stackName,
    });
    const res = await cfn.send(cmd);
    const stack = res?.Stacks ? res.Stacks[0] : undefined;
    return JSON.stringify(stack);
  } catch (e) {
    return `Error describeStack: ${JSON.stringify(e)}`;
  }
}

export async function listStacks(stackStatus: string[]): Promise<string> {
  try {
    const cmd = new ListStacksCommand({
      StackStatusFilter: isStackStatuses(stackStatus) ? stackStatus : [],
    });
    const res = await cfn.send(cmd);
    return JSON.stringify(res.StackSummaries);
  } catch (e) {
    return `Error listStacks: ${JSON.stringify(e)}`;
  }
}

export async function describeStackEvents(stackName: string): Promise<string> {
  try {
    const cmd = new DescribeStackEventsCommand({
      StackName: stackName,
    });
    const res = await cfn.send(cmd);
    return JSON.stringify(res.StackEvents);
  } catch (e) {
    return `Error describeStackEvents: ${JSON.stringify(e)}`;
  }
}

export async function updateStack(
  template: string,
  stackName: string,
  parameters?: Parameter[]
): Promise<string> {
  try {
    const cmd = new UpdateStackCommand({
      TemplateBody: template,
      StackName: stackName,
      Parameters: parameters,
      Capabilities: capabilities,
      Tags: [
        {
          Key: "project",
          Value: "bedrock-engineer",
        },
      ],
    });
    const res = await cfn.send(cmd);
    return `Stack updated: ${stackName}, StackId: ${res.StackId}`;
  } catch (e) {
    return `Error updateStack: ${JSON.stringify(e)}`;
  }
}

export async function createFolder(folderPath: string): Promise<string> {
  try {
    await fs.mkdir(folderPath, { recursive: true });
    return `Folder created: ${folderPath}`;
  } catch (e: any) {
    return `Error creating folder: ${e.message}`;
  }
}

export async function createFile(
  filePath: string,
  content: string
): Promise<string> {
  try {
    await fs.writeFile(filePath, content);
    return `File created: ${filePath}`;
  } catch (e: any) {
    return `Error creating file: ${e.message}`;
  }
}

export async function writeToFile(
  filePath: string,
  content: string
): Promise<string> {
  try {
    await fs.writeFile(filePath, content);
    return `Content written to file: ${filePath}`;
  } catch (e: any) {
    return `Error writing to file: ${e.message}`;
  }
}

export async function readFile(filePath: string): Promise<string> {
  try {
    const content = await fs.readFile(filePath, "utf-8");
    return content;
  } catch (e: any) {
    return `Error reading file: ${e.message}`;
  }
}

export async function listFiles(dirPath = "."): Promise<string> {
  try {
    const files = await fs.readdir(dirPath);
    return files.join("\n");
  } catch (e: any) {
    return `Error listing files: ${e.message}`;
  }
}

export async function tavilySearch(query: string): Promise<string> {
  try {
    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: process.env.TAVILY_API_KEY,
        query,
        search_depth: "advanced",
        include_answer: true,
        include_images: false,
        include_raw_content: true,
        max_results: 1,
        include_domains: [],
        exclude_domains: [],
      }),
    });

    const body = await response.text();
    return body;
  } catch (e: any) {
    return `Error searching: ${e.message}`;
  }
}

export async function fetchAPI(
  url: string,
  options?: RequestInit
): Promise<string> {
  try {
    const res = await fetch(url, options);
    const json = await res.json();
    return JSON.stringify(json);
  } catch (e: any) {
    return `Error fetchAPI: ${JSON.stringify(e)}`;
  }
}

export async function pexelsSearch(query: string): Promise<string> {
  try {
    const res = await fetch(
      `https://api.pexels.com/v1/search?${query}&per_page=1`,
      {
        headers: {
          Authorization: process.env.PEXELS_API_KEY ?? "",
        },
      }
    );
    return JSON.stringify(res);
  } catch (e: any) {
    return `Error pexelsSearch: ${JSON.stringify(e)}`;
  }
}

export async function execCmd(cmd: string): Promise<string> {
  try {
    const res = await promiseExec(cmd);
    return JSON.stringify(res);
  } catch (e: any) {
    return `Error execCmd: ${JSON.stringify(e)}`;
  }
}

export const tools: Tool[] = [
  {
    toolSpec: {
      name: "createFolder",
      description:
        "Create a new folder at the specified path. Use this when you need to create a new directory in the project structure.",
      inputSchema: {
        json: {
          type: "object",
          properties: {
            path: {
              type: "string",
              description: "The path where the folder should be created",
            },
          },
          required: ["path"],
        },
      },
    },
  },
  {
    toolSpec: {
      name: "createFile",
      description:
        "Create a new file at the specified path with optional content. Use this when you need to create a new file in the project structure.",
      inputSchema: {
        json: {
          type: "object",
          properties: {
            path: {
              type: "string",
              description: "The path where the file should be created",
            },
            content: {
              type: "string",
              description: "The initial content of the file",
            },
          },
          required: ["path", "content"],
        },
      },
    },
  },
  {
    toolSpec: {
      name: "writeToFile",
      description:
        "Write content to an existing file at the specified path. Use this when you need to add or update content in an existing file.",
      inputSchema: {
        json: {
          type: "object",
          properties: {
            path: {
              type: "string",
              description: "The path of the file to write to",
            },
            content: {
              type: "string",
              description: "The content to write to the file",
            },
          },
          required: ["path", "content"],
        },
      },
    },
  },
  {
    toolSpec: {
      name: "readFile",
      description:
        "Read the contents of a file at the specified path. Use this when you need to examine the contents of an existing file.",
      inputSchema: {
        json: {
          type: "object",
          properties: {
            path: {
              type: "string",
              description: "The path of the file to read",
            },
          },
          required: ["path"],
        },
      },
    },
  },
  {
    toolSpec: {
      name: "listFiles",
      description:
        "List all files and directories in the root folder where the script is running. Use this when you need to see the contents of the current directory.",
      inputSchema: {
        json: {
          type: "object",
          properties: {
            path: {
              type: "string",
              description:
                "The path of the folder to list (default: current directory)",
            },
          },
        },
      },
    },
  },
  {
    toolSpec: {
      name: "tavilySearch",
      description:
        "Perform a web search using Tavily API to get up-to-date information or additional context. Use this when you need current information or feel a search could provide a better answer.",
      inputSchema: {
        json: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "The search query",
            },
          },
          required: ["query"],
        },
      },
    },
  },
  {
    toolSpec: {
      name: "createStack",
      description:
        "Create a CloudFormation stack with the specified template and stack name.",
      inputSchema: {
        json: {
          type: "object",
          properties: {
            template: {
              type: "string",
              description:
                "The AWS CloudFormation template body. Structure containing the template body with a minimum length of 1 byte and a maximum length of 51,200 bytes. For more information, go to Template anatomy in the CloudFormation User Guide .",
            },
            stackName: {
              type: "string",
              description: "The AWS CloudFormation Stack Name",
            },
            parameters: {
              type: "array",
              description: `The AWS CloudFormation Stack Parameters
A list of <code>Parameter</code> structures that specify input parameters for the stack. 
For more information, see the "https://docs.aws.amazon.com/AWSCloudFormation/latest/APIReference/API_Parameter.html" data type.</p>
`,
              items: {
                type: "object",
                properties: {
                  ParameterKey: {
                    type: "string",
                    description: "The key of the parameter",
                  },
                  ParameterValue: {
                    type: "string",
                    description: "The value of the parameter",
                  },
                },
              },
            },
          },
          required: ["template", "stackName"],
        },
      },
    },
  },
  {
    toolSpec: {
      name: "updateStack",
      description:
        "Update a CloudFormation stack with the specified template and stack name.",
      inputSchema: {
        json: {
          type: "object",
          properties: {
            template: {
              type: "string",
              description: "The AWS CloudFormation template",
            },
            stackName: {
              type: "string",
              description: "The AWS CloudFormation Stack Name",
            },
            parameters: {
              type: "array",
              description: `The AWS CloudFormation Stack Parameters
A list of <code>Parameter</code> structures that specify input parameters for the stack. 
For more information, see the "https://docs.aws.amazon.com/AWSCloudFormation/latest/APIReference/API_Parameter.html" data type.</p>
`,
              items: {
                type: "object",
                properties: {
                  ParameterKey: {
                    type: "string",
                    description: "The key of the parameter",
                  },
                  ParameterValue: {
                    type: "string",
                    description: "The value of the parameter",
                  },
                },
              },
            },
          },
          required: ["template", "stackName"],
        },
      },
    },
  },
  {
    toolSpec: {
      name: "describeStack",
      description: "Describe a CloudFormation stack by stack name",
      inputSchema: {
        json: {
          type: "object",
          properties: {
            stackName: {
              type: "string",
              description: `The AWS CloudFormation Stack Name or Stack ID. The name or the unique stack ID that's associated with the stack, which aren't always interchangeable
Running stacks: You can specify either the stack's name or its unique stack ID.
Deleted stacks: You must specify the unique stack ID.
`,
            },
          },
          required: ["stackName"],
        },
      },
    },
  },
  {
    toolSpec: {
      name: "listStacks",
      description: "List CloudFormation stacks with the specified status",
      inputSchema: {
        json: {
          type: "object",
          properties: {
            stackStatus: {
              type: "array",
              description: "The AWS CloudFormation Stack Status Array",
              items: {
                type: "string",
                enum: STACK_STATUS,
                description: "The AWS CloudFormation Stack Status",
              },
            },
          },
          required: ["stackStatus"],
        },
      },
    },
  },
  {
    toolSpec: {
      name: "describeStackEvents",
      description: "Describe a CloudFormation stack events by stack name",
      inputSchema: {
        json: {
          type: "object",
          properties: {
            stackName: {
              type: "string",
              description:
                "The unique stack ID (arn) e.g. arn:aws:cloudformation:us-east-1:000000000000:stack/my-stack/731f00f6",
            },
          },
          required: ["stackName"],
        },
      },
    },
  },
  {
    toolSpec: {
      name: "fetchAPI",
      description:
        "Fetch data from a specified API endpoint. Use this when you need to retrieve data from a third-party API.",
      inputSchema: {
        json: {
          type: "object",
          properties: {
            url: {
              type: "string",
              description: "The URL of the API endpoint",
            },
            options: {
              type: "object",
              description:
                "The options for the fetch request. This specifies the Node.js fetch api's second argument 'RequestInit' ",
            },
          },
          required: ["url"],
        },
      },
    },
  },
  {
    toolSpec: {
      name: "pexelsSearch",
      description:
        "Search for photos on Pexels. Use this when you need to retrieve photos from the Pexels API.",
      inputSchema: {
        json: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "The search query",
            },
          },
          required: ["query"],
        },
      },
    },
  },
  {
    toolSpec: {
      name: "execCmd",
      description:
        "Execute a command in the terminal. Use this when you need to run a command in your terminal.",
      inputSchema: {
        json: {
          type: "object",
          properties: {
            cmd: {
              type: "string",
              description: "The command to execute",
            },
          },
          required: ["cmd"],
        },
      },
    },
  },
];

export const executeTool = (toolName: string | undefined, toolInput: any) => {
  switch (toolName) {
    case "createFolder":
      return createFolder(toolInput["path"]);
    case "createFile":
      return createFile(toolInput["path"], toolInput["content"]);
    case "writeToFile":
      return writeToFile(toolInput["path"], toolInput["content"]);
    case "readFile":
      return readFile(toolInput["path"]);
    case "listFiles":
      return listFiles(toolInput["path"]);
    case "tavilySearch":
      return tavilySearch(toolInput["query"]);
    case "createStack":
      return createStack(
        toolInput["template"],
        toolInput["stackName"],
        toolInput["parameters"]
      );
    case "describeStack":
      return describeStack(toolInput["stackName"]);
    case "listStacks":
      return listStacks(toolInput["stackStatus"]);
    case "describeStackEvents":
      return describeStackEvents(toolInput["stackName"]);
    case "updateStack":
      return updateStack(
        toolInput["template"],
        toolInput["stackName"],
        toolInput["parameters"]
      );
    case "fetchAPI":
      return fetchAPI(toolInput["url"], toolInput["options"]);
    case "execCmd":
      return execCmd(toolInput["cmd"]);
    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
};
