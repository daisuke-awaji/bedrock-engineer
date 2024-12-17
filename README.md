Language: [English](./README.md) / [Japanese](./README-ja.md)

# 🧙 Bedrock Enginner

Bedrock Enginner is an AI assistant for software development tasks powered by [Amazon Bedrock](https://aws.amazon.com/bedrock/). This autonomous AI agent combines the capabilities of large language models with practical file system operations and web search functionality to support your development process.

## 💻 Demo

https://github.com/user-attachments/assets/6d7c67e2-4089-4c24-9171-a6896b990d6b

## 🍎 Getting Started

It is still under development and no packaged binaries have been created. Please build it locally and use it.

### Build

First, install the npm modules:

```
npm install
```

Then, build appplication package

```
npm run build:mac
```

or

```
npm run build:win
```

or

```
npm run build:linux
```

Use the application stored in the `dist` directory.

## ✨ Features

### Agent Chat

- 💬 Interactive chat interface with human-like Amazon Nova and Claude 3.5 models
- 📁 File system operations (create folders, files, read/write files)
- 🔍 Web search capabilities using Tavily API
- 🏗️ Project structure creation and management
- 🧐 Code analysis and improvement suggestions
- 🚀 Automode for autonomous task completion
- 🔄 Iteration tracking in automode

### Website Generator

Generate source code and preview in real-time for:

- React.js (w/ Typescript)
- Vue.js (w/ Typescript)
- Svelte.js
- Vanilla.js

## Connect datasource for your design system

By connecting to the Knowledge base for Amazon Bedrock, you can generate a website using any design system, project source code, website styles, etc. as reference.

You need to store source code and crawled web pages in the knowledge base in advance. When you register source code in the knowledge base, it is recommended that you convert it into a format that LLM can easily understand using a method such as gpt-repositoy-loader.

![knowledgebase-connect](./assets//knowledgebase-connect.gif)

Click the "Connect" button at the bottom of the screen and enter your Knowledge base ID.

The following styles are also supported as presets:

- Inline styling
- Tailwind.css
- Material UI (React mode only)

### Step Function Generator

Generate AWS Step Functions ASL definitions and preview them in real-time.

## Star history

[![Star History Chart](https://api.star-history.com/svg?repos=daisuke-awaji/bedrock-engineer&type=Date)](https://star-history.com/#daisuke-awaji/bedrock-engineer&Date)

## License

MIT License

This software uses [Lottie Files](https://lottiefiles.com/free-animation/robot-futuristic-ai-animated-xyiArJ2DEF).
