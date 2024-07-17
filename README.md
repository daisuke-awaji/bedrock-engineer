# 🧙 Bedrock Engineer

<a href="./docs/README_JP.md"><img src="https://img.shields.io/badge/ドキュメント-日本語-white.svg" alt="JA doc"/></a>


Bedrock Engineer is an interactive command-line interface (CLI) to assist with software development tasks. This tool combines the capabilities of a large language model with practical file system operations, web search functionality and build/deploy features of AWS cloud resources.

This application is implemented in node.js based on the source code of super cool [Claude-Enginner](https://github.com/Doriandarko/claude-engineer), and supports various [Amazon Bedrock](https://aws.amazon.com/jp/bedrock/) models. It uses Bedrock's [Converse API](https://docs.aws.amazon.com/bedrock/latest/APIReference/API_runtime_Converse.html).

## 💻 Demo

https://github.com/daisuke-awaji/bedrock-engineer/assets/20736455/b206ba1c-8f73-4021-90d3-f2ab6c5e1363

## ✨ Features

- 💬 Interactive chat interface with Anthoropic Claude 3 models.
- 📁 File system operations (create folders, files, read/write files)
- 🔍 Web search capabilities using Tavily API
- 🏗️ Project structure creation and management
- 🧐 Code analysis and improvement suggestions
- 🚀 Automode for autonomous task completion
- 🔄 Iteration tracking in automode
- ☁️ Build and deploy application and infrastructure to AWS Cloud
- 💻 Execute CLI commands (requires user confirmation each time)
- 🖼️ Fetch Images from [pexels](https://www.pexels.com/)

TOBE implementation

- 🌈 Syntax highlighting for code snippets
- 🖼️ Vision capabilities support via drag and drop of images in the terminal
- 🤖 Support models: Mistral AI and Cohere Command R/R+

## 🛠️ Installation

1. Clone this repository:

   ```bash
   git clone https://github.com/daisuke-awaji/bedrock-engineer
   cd bedrock-engineer
   ```

2. Install the required dependencies:

   ```bash
   npm install
   ```

3. (Optional) Set up your API keys:

   Add your Tavily API keys at the start of the .env file:

   ```.env
   TAVILY_API_KEY=tvly-xxxxxxxxxxxxx
   ```


## 🐳 Docker Setup

You can also run Bedrock Engineer using Docker. This setup ensures a consistent environment across different machines.

1. Make sure you have Docker and Docker Compose installed on your system.

2. Build and start the Docker container:

   ```bash
   docker-compose up --build
   ```

   This command builds the Docker image and starts the container based on the specifications in the `docker-compose.yml` file.

3. Once the container is running, you can execute commands inside it. To start the Bedrock Engineer interface:

   ```bash
   docker-compose exec bedrock-engineer /bin/bash
   npm run start
   ```

   This opens a bash shell in the running container and then starts the Bedrock Engineer application.

### Docker Compose Configuration

The `docker-compose.yml` file defines the service configuration:

```yaml
version: '3.8'

services:
  bedrock-engineer:
    build: .
    volumes:
      - .:/app
      - /app/node_modules
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    tty: true
    env_file:
      - .env
```

This configuration:
- Builds the Docker image using the Dockerfile in the current directory.
- Mounts the current directory to `/app` in the container.
- Creates a named volume for `node_modules` to preserve installed dependencies.
- Maps port 3000 from the container to the host.
- Sets the Node environment to production.
- Loads environment variables from a `.env` file.

By using this Docker setup, you can ensure a consistent environment for running Bedrock Engineer across different systems.


## 🚀 Usage

Run the main script to start the Bedrock Engineer interface:

```
npm run start
```

## 🤖 Automode

Automode allows Bedrock to work autonomously on complex tasks. When in automode:

1. Bedrock sets clear, achievable goals based on your request.
2. It works through these goals one by one, using available tools as needed.
3. Bedrock provides regular updates on its progress.
4. Automode continues until goals are completed.

To use automode:

1. Type 'automode' when prompted for input.
2. Provide your request when prompted.
3. Bedrock will work autonomously, providing updates after each iteration.

## Star history

[![Star History Chart](https://api.star-history.com/svg?repos=daisuke-awaji/bedrock-engineer&type=Date)](https://star-history.com/#daisuke-awaji/bedrock-engineer&Date)
