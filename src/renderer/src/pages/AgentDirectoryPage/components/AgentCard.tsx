import type { Agent } from '@renderer/types/agent'

type AgentCardProps = {
  agent: Agent
  onClick: () => void
}

function getPromptPreview(systemPrompt: string): string {
  // システムプロンプトから最初の3行を抽出（空行は除外）
  return systemPrompt
    .split('\n')
    .filter(line => line.trim() !== '')
    .slice(0, 3)
    .join('\n')
}

export const AgentCard = ({ agent, onClick }: AgentCardProps) => (
  <div
    onClick={onClick}
    className="group flex cursor-pointer flex-col rounded-lg border border-gray-200 bg-white p-6 transition-all hover:border-primary-500 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800 dark:hover:border-primary-500"
  >
    <div className="mb-4 flex items-start justify-between">
      <div className="flex-1">
        <h3 className="mb-1 text-xl font-semibold text-gray-900 group-hover:text-primary-500 dark:text-white dark:group-hover:text-primary-400">
          {agent.title}
        </h3>
        <div className="flex flex-wrap gap-2">
          {agent.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
      <div className="ml-4 h-10 w-10 flex-shrink-0">
        <img
          src={agent.author.avatar}
          alt={agent.author.name}
          className="h-full w-full rounded-full object-cover"
        />
      </div>
    </div>
    <div className="flex-1">
      <p className="mb-3 line-clamp-3 text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">
        {getPromptPreview(agent.systemPrompt)}
      </p>
    </div>
    <div className="mt-2 flex items-center border-t border-gray-100 pt-2 dark:border-gray-700">
      <p className="text-sm text-gray-500 dark:text-gray-400">{agent.author.name}</p>
    </div>
  </div>
)