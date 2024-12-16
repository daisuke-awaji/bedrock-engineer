/** @type {import('tailwindcss').Config} */
const flowbite = require('flowbite-react/tailwind')

module.exports = {
  content: [
    './src/renderer/src/**/*.{js,jsx,ts,tsx}',
    './src/renderer/index.html',
    flowbite.content()
  ],
  theme: {
    extend: {}
  },
  plugins: [flowbite.plugin()],
  darkMode: 'media'
}
