type TagFilterProps = {
  tags: string[]
  selectedTag: string
  onSelectTag: (tag: string) => void
}

export const TagFilter = ({ tags, selectedTag, onSelectTag }: TagFilterProps) => (
  <div className="w-full overflow-x-auto pb-2">
    <div className="flex space-x-2 whitespace-nowrap">
      {tags.map((tag) => (
        <button
          key={tag}
          onClick={() => onSelectTag(tag)}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-200 ${
            selectedTag === tag
              ? 'bg-primary-500 text-white bg-gray-700 hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          {tag}
        </button>
      ))}
    </div>
  </div>
)
