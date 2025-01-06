type SearchFieldProps = {
  onSearch: (query: string) => void
}

export const SearchField = ({ onSearch }: SearchFieldProps) => (
  <div className="relative flex w-full">
    <input
      type="text"
      placeholder="Search agents by name or description..."
      onChange={(e) => onSearch(e.target.value)}
      className="w-full rounded-lg border border-gray-300 bg-white px-5 py-3 text-base text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
    />
    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
      <svg
        className="h-5 w-5 text-gray-400 dark:text-gray-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    </div>
  </div>
)
