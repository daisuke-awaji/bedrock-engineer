import { autocompletion, completionKeymap } from '@codemirror/autocomplete'
import {
  SandpackCodeEditor,
  SandpackLayout,
  SandpackPreview,
  SandpackProvider
} from '@codesandbox/sandpack-react'

import React from 'react'
import { FiMaximize } from 'react-icons/fi'
import { SandpackViewerProps } from './Sandpack'
import { Loader } from '@renderer/components/Loader'

const DEFAULT_INDEX_HTML = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width,initial-scale=1.0" />
    <title>codesandbox</title>
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body>
    <noscript>
      <strong
        >We're sorry but codesandbox doesn't work properly without JavaScript
        enabled. Please enable it to continue.</strong
      >
    </noscript>
    <div id="app"></div>
    <!-- built files will be auto injected -->
  </body>
</html>
`

const DEFAULT_APP_VUE = `<template>
  <div className="m-2">
    <h1>Hello {{ msg }}</h1>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
const msg = ref<string>('world');
</script>
`
const VueSandpack: React.FC<SandpackViewerProps> = ({
  code = DEFAULT_APP_VUE,
  showCode = true,
  loading = false
}) => {
  return (
    <SandpackProvider
      template="vue-ts"
      files={{
        'src/App.vue': { code: code },
        '/public/index.html': {
          code: DEFAULT_INDEX_HTML
        }
      }}
      options={{
        externalResources: ['https://unpkg.com/@tailwindcss/ui/dist/tailwind-ui.min.css'],
        initMode: 'user-visible',
        recompileMode: 'delayed',
        autorun: true,
        autoReload: true
      }}
    >
      <SandpackLayout
        style={{
          display: 'flex',
          gap: '1rem',
          backgroundColor: 'rgb(243 244 246 / var(--tw-bg-opacity))',
          border: 'none'
        }}
      >
        {showCode && (
          <SandpackCodeEditor
            style={{
              height: '80vh',
              borderRadius: '8px',
              overflowX: 'scroll',
              maxWidth: '50vw'
            }}
            showTabs
            showLineNumbers
            showRunButton={true}
            extensions={[autocompletion()]}
            extensionsKeymap={[completionKeymap as any]}
          />
        )}
        {loading ? (
          <div className="flex w-[50%] h-[80vh] justify-center items-center content-center align-center">
            <Loader />
          </div>
        ) : (
          <SandpackPreview
            id="sandpack-preview"
            style={{
              height: '80vh',
              borderRadius: '8px',
              backgroundColor: 'white'
            }}
            showOpenInCodeSandbox={false}
            actionsChildren={
              <button
                onClick={() => {
                  const iframe = document.getElementById('sandpack-preview')
                  if (iframe) {
                    iframe?.requestFullscreen()
                  }
                }}
                className="border rounded-full bg-[#EFEFEF] p-2 text-gray-500 hover:text-gray-800"
              >
                <FiMaximize className="text-gray" />
              </button>
            }
          />
        )}
      </SandpackLayout>
    </SandpackProvider>
  )
}

export default VueSandpack
