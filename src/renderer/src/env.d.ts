/// <reference types="vite/client" />

interface ImportMetaEnv {
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface Window {
  api: {
    bedrock: {
      executeTool: (toolName: string, toolInput: any) => Promise<any>
    }
    contextMenu: {
      onContextMenuCommand: (callback: (command: string) => void) => void
    }
    images: {
      getLocalImage: (path: string) => Promise<string>
    }
  }
}
