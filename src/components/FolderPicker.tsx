interface FolderPickerProps {
  onOpen: () => void
  repoPath: string | null
  isLoading: boolean
}

export default function FolderPicker({ onOpen, repoPath, isLoading }: FolderPickerProps) {
  return (
    <div className="flex items-center gap-4">
      <button
        onClick={onOpen}
        disabled={isLoading}
        className={`
          px-4 py-2 rounded-md font-medium transition-colors
          ${isLoading
            ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
          }
        `}
      >
        {isLoading ? 'Loading...' : 'Open Repository'}
      </button>

      {repoPath && (
        <span className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-md">
          {repoPath}
        </span>
      )}
    </div>
  )
}
