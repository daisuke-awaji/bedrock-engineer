const agents = [
  {
    name: 'ソフトウェア開発',
    value: 'softwareAgent',
    description:
      'This AI agent understands software project structures and creates files and folders.'
  },
  {
    name: 'プログラミングメンター',
    value: 'codeBuddy',
    description: 'This AI agent helps you with programming tasks.'
  },
  {
    name: 'プロダクトデザイナー',
    value: 'productDesigner',
    description: 'This AI agent helps you with product design tasks.'
  },
  {
    name: 'カフェの店員',
    value: 'cafeAssistant',
    description: 'This AI agent helps you with cafe tasks.'
  }
] as const

export default agents
