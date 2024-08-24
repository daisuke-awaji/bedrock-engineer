import { autocompletion, completionKeymap } from '@codemirror/autocomplete'
import { SandpackCodeEditor, SandpackPreview, SandpackProvider } from '@codesandbox/sandpack-react'

import React from 'react'
import { FiMaximize } from 'react-icons/fi'

type ReactSandpackProps = {
  code?: string
  showCode?: boolean
}

// const DEFAULT_INDEX_HTML = `<!DOCTYPE html>
// <html lang="en">
//   <head>
//     <meta charset="UTF-8" />
//     <meta name="viewport" content="width=device-width, initial-scale=1.0" />
//     <title>Document</title>
//     <script src="https://cdn.tailwindcss.com"></script>
//   </head>
//   <body>
//     <div id="root"></div>
//   </body>
// </html>

// `

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
  <h1>Hello {{ msg }}</h1>
</template>

<script setup lang="ts">
import { ref } from 'vue';
const msg = ref<string>('world');
</script>
`
const VueSandpack: React.FC<ReactSandpackProps> = ({ code, showCode = true }) => {
  return (
    <SandpackProvider
      template="vue-ts"
      files={{
        'src/App.vue': { code: code ?? DEFAULT_APP_VUE },
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
      // customSetup={{
      //   dependencies: {
      //     recharts: '2.9.0',
      //     'react-router-dom': 'latest',
      //     'react-icons': 'latest',
      //     'date-fns': 'latest'
      //   }
      // }}
    >
      <div className="flex gap-2">
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
            >
              <FiMaximize className="text-gray" />
            </button>
          }
        />
      </div>
    </SandpackProvider>
  )
}

export default VueSandpack
