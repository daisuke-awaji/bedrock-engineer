import React, { useState, useRef, useEffect } from 'react'
import { Agent } from '@/types/agent-chat'
import { TbRobot } from 'react-icons/tb'
import { FaCode } from 'react-icons/fa'
import { MdDesignServices } from 'react-icons/md'
import { BsLaptopFill } from 'react-icons/bs'

type AgentSelectorProps = {
  agents: readonly Agent[]
  selectedAgent: string
  onSelectAgent: (value: string) => void
  openable: boolean
}

const AGENT_ICONS = {
  softwareAgent: <BsLaptopFill className="size-4" />,
  codeBuddy: <FaCode className="size-4" />,
  productDesigner: <MdDesignServices className="size-4" />
} as const

const AGENT_COLORS = {
  softwareAgent: {
    icon: 'text-blue-600 dark:text-blue-400',
    hover: 'hover:bg-blue-50 dark:hover:bg-blue-900/50'
  },
  codeBuddy: {
    icon: 'text-green-600 dark:text-green-400',
    hover: 'hover:bg-green-50 dark:hover:bg-green-900/50'
  },
  productDesigner: {
    icon: 'text-purple-600 dark:text-purple-400',
    hover: 'hover:bg-purple-50 dark:hover:bg-purple-900/50'
  }
} as const

export const AgentSelector: React.FC<AgentSelectorProps> = ({
  agents,
  selectedAgent,
  onSelectAgent,
  openable
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedAgentData = agents.find((agent) => agent.id === selectedAgent)
  const colors = AGENT_COLORS[selectedAgent as keyof typeof AGENT_COLORS] || {
    icon: 'text-gray-600 dark:text-gray-400',
    hover: 'hover:bg-gray-50 dark:hover:bg-gray-800'
  }

  return (
    <div className="justify-center flex items-center gap-2 relative" ref={dropdownRef}>
      <div className="relative w-[30vw]">
        <button
          type="button"
          onClick={() => (openable ? setIsOpen(!isOpen) : undefined)}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-900
            text-gray-600 dark:text-gray-300 rounded-md hover:text-gray-500 dark:hover:text-gray-400
            transition-colors"
        >
          <span className="flex items-center gap-2">
            <span className={colors.icon}>
              {AGENT_ICONS[selectedAgent as keyof typeof AGENT_ICONS] || (
                <TbRobot className="size-4" />
              )}
            </span>
            <span className="flex-1 text-left">{selectedAgentData?.name}</span>
          </span>
          {openable ? (
            <svg
              className={`w-4 h-4 ml-auto transition-transform ${isOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          ) : null}
        </button>

        {isOpen && (
          <div
            className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-900 rounded-lg shadow-lg
            border border-gray-200 dark:border-gray-700 py-2 px-2 max-h-[40vh] overflow-y-auto"
          >
            {agents.map((agent) => {
              const agentColors = AGENT_COLORS[agent.id as keyof typeof AGENT_COLORS] || {
                icon: 'text-gray-600 dark:text-gray-400',
                hover: 'hover:bg-gray-50 dark:hover:bg-gray-800'
              }

              return (
                <div
                  key={agent.id}
                  onClick={() => {
                    onSelectAgent(agent.id)
                    setIsOpen(false)
                  }}
                  className={`
                    flex items-center gap-4 px-3 py-2.5 cursor-pointer
                    ${agent.id === selectedAgent ? 'bg-gray-50 dark:bg-gray-800' : 'bg-white dark:bg-gray-900'}
                    ${agentColors.hover}
                    transition-colors rounded-md
                  `}
                >
                  <div className={`rounded-md ${agentColors.icon}`}>
                    {AGENT_ICONS[agent.id as keyof typeof AGENT_ICONS] || (
                      <TbRobot className="size-5" />
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {agent.name}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {agent.description}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
