import ReactLogo from '../../assets/images/icons/react.svg'
import VueLogo from '../../assets/images/icons/vue.svg'
import VanillaLogo from '../../assets/images/icons/vanilla.svg'
import SvelteLogo from '../../assets/images/icons/svelte.svg'
import {
  DEFAULT_INDEX_HTML,
  DEFAULT_APP_TSX,
  DEFAULT_APP_VUE,
  DEFAULT_VUE_INDEX_HTML,
  DEFAULT_SVELTE_APP_SVELTE,
  DEFAULT_SVELTE_INDEX_HTML,
  DEFAULT_VANILLA_INDEX_HTML
} from './DEFAULT_CODES'

import { SandpackPredefinedTemplate } from '@codesandbox/sandpack-react'

export type SupportedTemplate = {
  id: SandpackPredefinedTemplate
  name: string
  logo: React.ReactNode
}

export const TEMPLATES: SupportedTemplate[] = [
  {
    id: 'react-ts',
    name: 'React',
    logo: <ReactLogo />
  },
  {
    id: 'vue-ts',
    name: 'Vue',
    logo: <VueLogo />
  },
  {
    id: 'svelte',
    name: 'Svelte',
    logo: <SvelteLogo />
  },
  {
    id: 'static',
    name: 'Vanilla',
    logo: <VanillaLogo />
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
  },
  static: {
    files: {
      'index.html': {
        code: DEFAULT_VANILLA_INDEX_HTML
      }
    },
    mainFile: 'index.html',
    customSetup: {
      dependencies: {}
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
  ],
  static: [
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
