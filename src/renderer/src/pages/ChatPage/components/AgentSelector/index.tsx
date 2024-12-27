import React from 'react'
import { Agent } from '../../types'

type AgentSelectorProps = {
  agents: readonly Agent[]
  selectedAgent: string
  onSelectAgent: (value: string) => void
}

export const AgentSelector: React.FC<AgentSelectorProps> = ({
  agents,
  selectedAgent,
  onSelectAgent
}) => {
  return (
    <div className="justify-center flex flex-col items-center gap-2">
      <span className="text-gray-400 text-xs">Select agent</span>
      <select
        className="w-[30vw] bg-gray-50 border border-gray-300 text-gray-600 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-1.5"
        value={selectedAgent}
        onChange={(e) => onSelectAgent(e.target.value)}
      >
        {agents.map((agent, index) => (
          <option key={index} value={agent.value}>
            {agent.name}
          </option>
        ))}
      </select>
    </div>
  )
}