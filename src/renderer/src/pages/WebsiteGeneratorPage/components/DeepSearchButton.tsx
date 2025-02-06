import { BsGlobeAmericas } from 'react-icons/bs'

type DeepSearchButtonProps = {
  enableDeepSearch: boolean
  handleToggleDeepSearch: () => void
}

export const DeepSearchButton: React.FC<DeepSearchButtonProps> = (props) => {
  const { enableDeepSearch, handleToggleDeepSearch } = props
  return (
    <button
      onClick={handleToggleDeepSearch}
      className={`flex items-center justify-center p-[2px] overflow-hidden text-xs text-gray-900 rounded-lg group
        ${
          enableDeepSearch
            ? 'bg-gradient-to-br from-blue-200 via-blue-300 to-cyan-200 group-hover:from-blue-200 group-hover:via-blue-300 group-hover:to-cyan-200'
            : 'border border-gray-200 dark:border-gray-700'
        }
        dark:text-white dark:hover:text-gray-900 focus:ring-4 focus:outline-none focus:ring-blue-100 dark:focus:ring-blue-400`}
    >
      <span
        className={`items-center px-3 py-1.5 transition-all ease-in duration-75 rounded-md flex gap-2
          ${
            enableDeepSearch
              ? 'bg-white dark:bg-gray-900 group-hover:bg-opacity-0'
              : 'bg-transparent'
          }`}
      >
        <BsGlobeAmericas className="text-sm" />
        Search
      </span>
    </button>
  )
}
