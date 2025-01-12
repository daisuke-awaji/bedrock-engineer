import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Agent, Scenario } from '@/types/agent-chat'
import useSetting from '@renderer/hooks/useSetting'
import {
  SOFTWARE_AGENT_SYSTEM_PROMPT,
  CODE_BUDDY_SYSTEM_PROMPT,
  PRODUCT_DESIGNER_SYSTEM_PROMPT
} from './defaultAgents'
import { replacePlaceholders as replacePlaceholdersUtil } from '../utils/placeholder'

// ソフトウェア開発者のシナリオ定義
const getSoftwareAgentScenarios = (): Scenario[] => [
  { title: 'What is Amazon Bedrock', content: '' },
  { title: 'Organizing folders', content: '' },
  { title: 'Simple website', content: '' },
  { title: 'Simple Web API', content: '' },
  { title: 'CDK Project', content: '' },
  { title: 'Understanding the source code', content: '' },
  { title: 'Refactoring', content: '' },
  { title: 'Testcode', content: '' }
]

// プログラミングメンターのシナリオ定義
const getCodeBuddyScenarios = (): Scenario[] => [
  { title: 'Learning JavaScript Basics', content: '' },
  { title: 'Understanding Functions', content: '' },
  { title: 'DOM Manipulation', content: '' },
  { title: 'Debugging JavaScript', content: '' },
  { title: 'Building a Simple Web App', content: '' },
  { title: 'Learning Python', content: '' },
  { title: 'Object-Oriented Programming', content: '' },
  { title: 'Data Visualization with Python', content: '' }
]

// プロダクトデザイナーのシナリオ定義
const getProductDesignerScenarios = (): Scenario[] => [
  { title: 'Wireframing a Mobile App', content: '' },
  { title: 'Designing a Landing Page', content: '' },
  { title: 'Improving User Experience', content: '' },
  { title: 'Creating a Design System', content: '' },
  { title: 'Accessibility Evaluation', content: '' },
  { title: 'Prototyping an Interface', content: '' },
  { title: 'Design Handoff', content: '' },
  { title: 'Design Trend Research', content: '' }
]

export const useDefaultAgents = () => {
  const { t, i18n } = useTranslation()
  const { projectPath, allowedCommands, knowledgeBases, bedrockAgents } = useSetting()

  // プレースホルダーを置換する関数
  const replacePlaceholders = useCallback(
    (text: string): string => {
      if (!text) return text
      return replacePlaceholdersUtil(text, {
        projectPath: projectPath || t('no project path'),
        allowedCommands: allowedCommands,
        knowledgeBases: knowledgeBases,
        bedrockAgents: bedrockAgents
      })
    },
    [projectPath, t, allowedCommands, knowledgeBases, bedrockAgents]
  )

  // シナリオをローカライズする関数
  const localizeScenarios = useCallback(
    (scenarios: Scenario[]): Scenario[] => {
      return scenarios.map((scenario) => ({
        title: t(scenario.title),
        content: replacePlaceholders(t(`${scenario.title} description`))
      }))
    },
    [t, replacePlaceholders]
  )

  // エージェントの基本定義を取得
  const getBaseAgents = useCallback((): Agent[] => {
    return [
      {
        name: 'Software Developer',
        id: 'softwareAgent',
        description: t('softwareAgent.description'),
        system: SOFTWARE_AGENT_SYSTEM_PROMPT,
        scenarios: getSoftwareAgentScenarios()
      },
      {
        name: 'Programming Mentor',
        id: 'codeBuddy',
        description: t('codeBuddy.description'),
        system: CODE_BUDDY_SYSTEM_PROMPT,
        scenarios: getCodeBuddyScenarios()
      },
      {
        name: 'Product Designer',
        id: 'productDesigner',
        description: t('productDesigner.description'),
        system: PRODUCT_DESIGNER_SYSTEM_PROMPT,
        scenarios: getProductDesignerScenarios()
      }
    ]
  }, [t])

  // ローカライズされたエージェントを生成
  const localizedAgents = useMemo(() => {
    const baseAgents = getBaseAgents()
    return baseAgents.map((agent) => ({
      ...agent,
      name: agent.name,
      system: replacePlaceholders(agent.system),
      scenarios: localizeScenarios(agent.scenarios)
    }))
  }, [getBaseAgents, i18n.language, t, replacePlaceholders, localizeScenarios])

  return localizedAgents
}
