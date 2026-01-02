import type { CommitInfo } from '../types'

interface CommitSelectorProps {
  commits: CommitInfo[]
  selectedCommit: string | null
  onSelect: (commitHash: string | null) => void
  label: string
}

export default function CommitSelector({
  commits,
  selectedCommit,
  onSelect,
  label,
}: CommitSelectorProps) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    onSelect(value === '' ? null : value)
  }

  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
        {label}
      </label>
      <select
        value={selectedCommit ?? ''}
        onChange={handleChange}
        className="px-2 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
      >
        <option value="">Working Directory</option>
        {commits.map((commit) => (
          <option key={commit.hash} value={commit.hash}>
            {commit.short_hash} - {commit.message}
          </option>
        ))}
      </select>
    </div>
  )
}
