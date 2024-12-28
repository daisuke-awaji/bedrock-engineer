import React from 'react'
import { motion } from 'framer-motion'
import { Scenario } from '@/types/agent-chat'

type ExampleScenariosProps = {
  scenarios?: Scenario[]
  onSelectScenario: (content: string) => void
}

export const ExampleScenarios: React.FC<ExampleScenariosProps> = ({
  scenarios = [],
  onSelectScenario
}) => {
  if (scenarios.length === 0) {
    return null
  }

  return (
    <div className="grid grid-cols-4 gap-2 pt-6 text-xs">
      {scenarios.map((scenario, index) => (
        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.15 }}
          key={scenario.title}
          className="px-4 py-2 border rounded-md text-gray-400 hover:text-gray-700 hover:border-gray-300"
          onClick={() => onSelectScenario(scenario.content)}
        >
          {scenario.title}
        </motion.button>
      ))}
    </div>
  )
}