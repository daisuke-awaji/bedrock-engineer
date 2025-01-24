import { memo, useState } from 'react'
import { CommandConfig, AVAILABLE_SHELLS } from '.'

// コマンド設定フォームコンポーネント
export const CommandForm = memo(
  ({
    allowedCommands,
    setAllowedCommands,
    shell,
    setShell
  }: {
    allowedCommands: CommandConfig[]
    setAllowedCommands: (commands: CommandConfig[]) => void
    shell: string
    setShell: (shell: string) => void
  }) => {
    const [newCommand, setNewCommand] = useState('')
    const [newDescription, setNewDescription] = useState('')

    const handleAddCommand = () => {
      if (newCommand.trim() && newDescription.trim()) {
        setAllowedCommands([
          ...allowedCommands,
          {
            pattern: newCommand.trim(),
            description: newDescription.trim()
          }
        ])
        setNewCommand('')
        setNewDescription('')
      }
    }

    const handleRemoveCommand = (pattern: string) => {
      setAllowedCommands(allowedCommands.filter((cmd) => cmd.pattern !== pattern))
    }

    return (
      <div className="mt-4 space-y-4">
        {/* シェル選択 */}
        <div className="space-y-2">
          <label className="block text-xs text-gray-600 dark:text-gray-400">Command Shell</label>
          <select
            value={shell}
            onChange={(e) => setShell(e.target.value)}
            className="w-full p-2 text-sm border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:text-gray-200"
          >
            {AVAILABLE_SHELLS.map((shellOption) => (
              <option key={shellOption.value} value={shellOption.value}>
                {shellOption.label}
              </option>
            ))}
          </select>
        </div>

        {/* コマンド追加フォーム */}
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <div className="flex-grow">
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                Command Pattern
              </label>
              <input
                type="text"
                value={newCommand}
                onChange={(e) => setNewCommand(e.target.value)}
                placeholder="e.g., ls *"
                className="w-full p-2 text-sm border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
              />
            </div>
            <div className="flex-grow">
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                Description
              </label>
              <input
                type="text"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="e.g., List directory contents"
                className="w-full p-2 text-sm border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
              />
            </div>
          </div>
          <button
            onClick={handleAddCommand}
            disabled={!newCommand.trim() || !newDescription.trim()}
            className="px-4 py-2 text-sm text-white bg-blue-500 rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Add Command
          </button>
        </div>

        {/* 登録済みコマンドリスト */}
        <div className="space-y-2">
          {allowedCommands.map((command) => (
            <div
              key={command.pattern}
              className="flex flex-col p-3 text-sm bg-gray-100 dark:bg-gray-900 dark:text-gray-300 rounded"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono">{command.pattern}</span>
                <button
                  onClick={() => handleRemoveCommand(command.pattern)}
                  className="text-red-500 hover:text-red-600"
                >
                  Remove
                </button>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{command.description}</p>
            </div>
          ))}
        </div>
      </div>
    )
  }
)
CommandForm.displayName = 'CommandForm'
