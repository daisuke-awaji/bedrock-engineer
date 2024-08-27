/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly PRELOAD_VITE_PEXELS_API_KEY: string
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
