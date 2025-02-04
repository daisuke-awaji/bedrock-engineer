export const DEFAULT_INDEX_HTML = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
    <script src="https://cdn.tailwindcss.com?plugins=@digital-go-jp/tailwind-theme-plugin"></script>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
`
export const DEFAULT_APP_TSX = `import React, { useState } from 'react';

const WebsiteGenerator = () => {
  const [prompt, setPrompt] = useState('');

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <h1 className="text-5xl font-light text-gray-900 mb-12">
        Website Generator
      </h1>
      <span>
        What can I help you build ?
      </span>
    </div>
  );
};

export default WebsiteGenerator;
`
export const DEFAULT_VUE_INDEX_HTML = `<!DOCTYPE html>
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
export const DEFAULT_APP_VUE = `<template>
  <div class="min-h-screen bg-white flex flex-col items-center justify-center p-4">
    <h1 class="text-5xl font-light text-gray-900 mb-12">
      Website Generator
    </h1>
    <span class="text-lg text-gray-700 mb-6">
      What can I help you build?
    </span>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
const msg = ref<string>('world');
</script>
`

export const DEFAULT_SVELTE_INDEX_HTML = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf8" />
    <meta name="viewport" content="width=device-width" />
    <script src="https://cdn.tailwindcss.com"></script>
    <title>Svelte app</title>

    <link rel="stylesheet" href="public/bundle.css" />
  </head>

  <body>
    <script src="bundle.js"></script>
  </body>
</html>`
export const DEFAULT_SVELTE_APP_SVELTE = `<script>
  let prompt = '';
</script>
<main class="min-h-screen bg-white flex flex-col items-center justify-center p-4">
  <h1 class="text-5xl font-light text-gray-900 mb-12">
    Website Generator
  </h1>
  <span>
    What can I help you build ?
  </span>
</main>

<style>
  main {
    font-family: system-ui, -apple-system, sans-serif;
  }
</style>
`
