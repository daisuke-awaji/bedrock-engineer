import {
  DEFAULT_INDEX_HTML,
  DEFAULT_APP_TSX,
  DEFAULT_APP_VUE,
  DEFAULT_VUE_INDEX_HTML,
  DEFAULT_SVELTE_APP_SVELTE,
  DEFAULT_SVELTE_INDEX_HTML
} from './DEFAULT_CODES'

import { SandpackPredefinedTemplate } from '@codesandbox/sandpack-react'
import { FaReact, FaVuejs } from 'react-icons/fa'
import { RiSvelteFill } from 'react-icons/ri'

export type SupportedTemplate = {
  id: SandpackPredefinedTemplate
  name: string
  logo: React.ReactNode
}

export const TEMPLATES: SupportedTemplate[] = [
  {
    id: 'react-ts',
    name: 'React',
    logo: <FaReact size={18} />
  },
  {
    id: 'vue-ts',
    name: 'Vue',
    logo: <FaVuejs size={18} />
  },
  {
    id: 'svelte',
    name: 'Svelte',
    logo: <RiSvelteFill size={18} />
  }
]

export const templates = {
  'react-ts': {
    files: {
      '/public/index.html': {
        code: DEFAULT_INDEX_HTML
      },
      'App.tsx': { code: DEFAULT_APP_TSX }
    },
    mainFile: 'App.tsx',
    customSetup: {
      dependencies: {
        recharts: '2.9.0',
        'react-router-dom': 'latest',
        'react-icons': 'latest',
        'date-fns': 'latest',
        '@mui/material': 'latest',
        '@emotion/react': 'latest',
        '@emotion/styled': 'latest',
        '@fontsource/roboto': 'latest',
        '@mui/icons-material': 'latest',
        '@cloudscape-design/components': 'latest',
        '@cloudscape-design/global-styles': 'latest'
        // 'react-dnd': 'latest',
        // 'react-dnd-html5-backend': 'latest',
        // three: 'latest',
        // '@react-three/xr': 'latest',
        // '@react-three/drei': 'latest',
        // '@react-three/fiber': 'latest'
      }
    }
  },
  'vue-ts': {
    files: {
      'src/App.vue': { code: DEFAULT_APP_VUE },
      '/public/index.html': {
        code: DEFAULT_VUE_INDEX_HTML
      }
    },
    mainFile: 'src/App.vue',
    customSetup: {
      dependencies: {
        recharts: '2.9.0',
        'date-fns': 'latest',
        'vue-chartjs': 'latest',
        'chart.js': 'latest',
        'vue-router': 'latest'
      }
    }
  },
  svelte: {
    files: {
      'App.svelte': { code: DEFAULT_SVELTE_APP_SVELTE },
      '/public/index.html': {
        code: DEFAULT_SVELTE_INDEX_HTML
      }
    },
    mainFile: 'App.svelte',
    customSetup: {
      dependencies: {
        d3: 'latest',
        'd3-scale': 'latest',
        'd3-color': 'latest',
        'd3-interpolate': 'latest',
        'd3-fetch': 'latest'
      }
    }
  }
}

export type Style = {
  label: string
  value: string
}

export const supportedStyles = {
  'react-ts': [
    {
      label: 'Inline style',
      value: 'inline'
    },
    {
      label: 'Tailwind.css',
      value: 'tailwind'
    },
    {
      label: 'Material UI',
      value: 'mui'
    }
  ],
  'vue-ts': [
    {
      label: 'Inline style',
      value: 'inline'
    },
    {
      label: 'Tailwind.css',
      value: 'tailwind'
    }
  ],
  svelte: [
    {
      label: 'Inline style',
      value: 'inline'
    },
    {
      label: 'Tailwind.css',
      value: 'tailwind'
    }
  ]
}
