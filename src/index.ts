import { stdin as input, stdout as output } from "node:process";
import * as readline from "node:readline/promises";
import {
  BedrockRuntimeClient,
  ConverseCommand,
  Message,
  Tool,
} from "@aws-sdk/client-bedrock-runtime";
import { executeTool, tools } from "./tools/tools";
import systemPrompt from "./systemPrompt";
import dotenv from "dotenv";
import { log } from "./log";
dotenv.config();

const isSetTaihvilyApiKey = !!process.env.TAVILY_API_KEY;
const s3BucketNameForSamPackage = process.env.S3_BUCKET_NAME_FOR_SAM_PACKAGE;
const isSetPexelsApiKey = !!process.env.PEXELS_API_KEY;

const toolConfig = {
  tools: tools.filter((value) => {
    if (value.toolSpec?.name === "tavilySearch") {
      return isSetTaihvilyApiKey;
    } else if (value.toolSpec?.name === "pexelsSearch") {
      return isSetPexelsApiKey;
    }
    return true;
  }),
};

log.info(JSON.stringify(toolConfig, null, 2));

const client = new BedrockRuntimeClient({
  region: "us-east-1",
});

// const modelId = "anthropic.claude-3-haiku-20240307-v1:0"; // work
const modelId = "anthropic.claude-3-sonnet-20240229-v1:0"; // work
// const modelId = "anthropic.claude-3-opus-20240229-v1:0"
// const modelId = "anthropic.claude-3-5-sonnet-20240620-v1:0";
// const modelId = "mistral.mistral-large-2402-v1:0"; // doesn't work
// const modelId = "cohere.command-r-plus-v1:0"; // doesn't work

const inferenceConfig = {
  maxTokens: 4096,
  temperature: 0.5,
  topP: 0.9,
};

const conversationHistory: Message[] = [];

const rl = readline.createInterface({ input, output });
async function main() {
  log.ai("Welcome to the Bedrock Enginner! 🧙\n");
  log.ai(
    "Type 'automode' to enter Autonomous mode with infinite iterations. (requires user confirmation each time)"
  );

  try {
    while (true) {
      let userInput = await rl.question(`\nYou: `);

      if (userInput.length === 0) {
        userInput = "Continue with the next step.";
      }

      if (userInput.toLowerCase() === "automode") {
        await automodeLoop({ cmdRequireConfirm: true });
      }

      await chatWithClaude({ userInput });
    }
  } finally {
    rl.close();
  }
}

const automodeLoop = async (props?: { cmdRequireConfirm?: boolean }) => {
  log.info("Okay, Start automode.");

  let userInput = await rl.question(`\nYou: `);
  if (userInput.length === 0) {
    userInput = "Continue with the next step.";
  }

  log.info("Press Ctrl+C at any time to exit the automode loop.");

  await chatWithClaude({ userInput });
  while (true) {
    const assistantResponse = await chatWithClaude({
      userInput: "Continue with the next step.",
      automode: true,
      cmdRequireConfirm: props?.cmdRequireConfirm,
    });

    if (assistantResponse.includes("AUTOMODE_COMPLETE")) {
      log.info("Automode completed.");
      break;
    }
  }
};

type ChatWithClaudeProps = {
  userInput: string;
  automode?: boolean;
  cmdRequireConfirm?: boolean;
};
const chatWithClaude = async (props: ChatWithClaudeProps) => {
  const { userInput, automode, cmdRequireConfirm } = props;
  const msg: Message = {
    role: "user",
    content: [{ text: userInput }],
  };
  conversationHistory.push(msg);

  const command = new ConverseCommand({
    modelId,
    messages: conversationHistory.filter((msg) => msg.content !== undefined),
    system: [
      {
        text: systemPrompt({
          useTavilySearch: isSetTaihvilyApiKey,
          automode,
          s3BucketNameForSamPackage,
        }),
      },
    ],
    toolConfig,
    inferenceConfig,
  });
  await log.write(command);
  const res = await client.send(command);

  // assistant message
  let assistantResponse = "";
  for (const contentBlock of res.output?.message?.content ?? []) {
    if ("text" in contentBlock) {
      log.ai(`\nAssistant: ${contentBlock?.text?.replace(/\\n/g, "\n")}`);
      assistantResponse += contentBlock?.text + "\n";
    } else if ("toolUse" in contentBlock) {
      const toolInput = contentBlock.toolUse?.input;
      const toolName = contentBlock.toolUse?.name;
      const toolUseId = contentBlock.toolUse?.toolUseId;

      log.tool(`\nTool Used: ${toolName}`);
      log.tool(`Tool Input: ${JSON.stringify(toolInput, null, 4)}`);
      if (toolName === "execCmd" && cmdRequireConfirm) {
        // approved by human in cli input
        log.warn(
          `\nDo you want to execute the command?\nIf you want to execute the command, just press <Enter>.\nIf you don't want to execute the command, enter "cancel" or a string of one or more characters.`
        );
        const userInput = await rl.question(`\nYou: `);

        if (userInput.length > 0) {
          log.info("Okay, I'll not execute the command.");
          break;
        }
      }
      const toolResult = await executeTool(toolName, toolInput);
      log.tool(`Tool Result: ${toolResult}`);

      conversationHistory.push({
        role: "assistant",
        content: [contentBlock],
      });
      conversationHistory.push({
        role: "user",
        content: [
          {
            toolResult: {
              toolUseId,
              content: [{ text: toolResult }],
              status: "success",
            },
          },
        ],
      });

      const messages = conversationHistory.filter(
        (msg) => msg.content !== undefined
      );
      // console.log(JSON.stringify(messages, null, 4));
      const command = new ConverseCommand({
        modelId,
        messages,
        system: [
          {
            text: systemPrompt({
              useTavilySearch: isSetTaihvilyApiKey,
              automode,
              s3BucketNameForSamPackage,
            }),
          },
        ],
        toolConfig,
        inferenceConfig,
      });
      await log.write(command);
      const toolResponse = await client.send(command);

      for (const contentBlock of toolResponse.output?.message?.content ?? []) {
        if ("text" in contentBlock) {
          assistantResponse += contentBlock?.text;
        }
      }
    }
  }

  conversationHistory.push({
    role: "assistant",
    content: [
      { text: assistantResponse === "" ? "complete" : assistantResponse },
    ],
  });
  log.ai(`\nAssistant: ${assistantResponse.replace(/\\n/g, "\n")}`);

  return assistantResponse;
};

main();
