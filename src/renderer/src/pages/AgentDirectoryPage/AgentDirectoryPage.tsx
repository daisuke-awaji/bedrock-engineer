import { useState } from 'react'
import { SearchField } from './components/SearchField'
import { TagFilter } from './components/TagFilter'
import { AgentCard } from './components/AgentCard'
import { AgentDetailModal } from './components/AgentDetailModal'
import { Agents } from './agents'
import { Agent } from '@renderer/types/agent'

export default function AgentDirectoryPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState('All')
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [showModal, setShowModal] = useState(false)

  const allTags = ['All', ...Array.from(new Set(Agents.flatMap((a) => a.tags)))]

  const filteredAgents = Agents.filter((agent) => {
    const matchesSearch =
      agent.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.systemPrompt.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTag = selectedTag === 'All' || agent.tags.includes(selectedTag)
    return matchesSearch && matchesTag
  })

  const handleAgentClick = (agent: Agent) => {
    setSelectedAgent(agent)
    setShowModal(true)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">Agent Directory</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Discover and use specialized AI agents for different tasks
        </p>
      </div>

      <div className="mb-8 flex flex-col space-y-6">
        <SearchField onSearch={setSearchQuery} />
        <TagFilter tags={allTags} selectedTag={selectedTag} onSelectTag={setSelectedTag} />
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredAgents.map((agent) => (
          <AgentCard key={agent.id} agent={agent} onClick={() => handleAgentClick(agent)} />
        ))}
      </div>

      <AgentDetailModal
        agent={selectedAgent}
        show={showModal}
        onClose={() => setShowModal(false)}
      />
    </div>
  )
}