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
export const DEFAULT_APP_TSX = `import React from 'react';

export default function App() {
  return (
    <div className="m-2">
      <h1>Hello World</h1>
    </div>
  );
}
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
  <div className="m-2">
    <h1>Hello {{ msg }}</h1>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
const msg = ref<string>('world');
</script>
`
export const DEFAULT_VANILLA_INDEX_HTML = `<!DOCTYPE html>
<html>

<head>
  <title>Parcel Sandbox</title>
  <meta charset="UTF-8" />
  <link rel="stylesheet" href="/styles.css" />
</head>

<body>
  <h1>Hello world</h1>
</body>

</html>
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
export const DEFAULT_SVELTE_APP_SVELTE = `<style>
  h1 {
    font-size: 1.5rem;
  }
</style>

<script>
  let name = 'world';
</script>

<main>
  <h1>Hello {name}</h1>
</main>
`
