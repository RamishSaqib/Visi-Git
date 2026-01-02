import type { ChangedFile } from '../types'

interface FileListProps {
  files: ChangedFile[]
  selectedFile: string | null
  onSelect: (path: string) => void
  isLoading?: boolean
}

function getStatusIndicator(status: string): { letter: string; className: string } {
  switch (status) {
    case 'modified':
      return { letter: 'M', className: 'bg-yellow-500 text-yellow-900' }
    case 'added':
      return { letter: 'A', className: 'bg-green-500 text-green-900' }
    case 'deleted':
      return { letter: 'D', className: 'bg-red-500 text-red-900' }
    default:
      return { letter: '?', className: 'bg-gray-500 text-gray-900' }
  }
}

export default function FileList({ files, selectedFile, onSelect, isLoading }: FileListProps) {
  if (isLoading) {
    return (
      <div className="p-4 text-gray-500 dark:text-gray-400">
        Loading files...
      </div>
    )
  }

  if (files.length === 0) {
    return (
      <div className="p-4 text-gray-500 dark:text-gray-400">
        No changed images found
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      {files.map((file) => {
        const { letter, className } = getStatusIndicator(file.status)
        const isSelected = selectedFile === file.path

        return (
          <button
            key={file.path}
            onClick={() => onSelect(file.path)}
            className={`
              flex items-center gap-2 px-3 py-2 text-left transition-colors
              hover:bg-gray-100 dark:hover:bg-gray-800
              ${isSelected ? 'bg-blue-100 dark:bg-blue-900' : ''}
            `}
          >
            <span
              className={`
                inline-flex items-center justify-center w-5 h-5
                text-xs font-bold rounded ${className}
              `}
            >
              {letter}
            </span>
            <span className="truncate text-sm text-gray-900 dark:text-gray-100">
              {file.filename}
            </span>
          </button>
        )
      })}
    </div>
  )
}
