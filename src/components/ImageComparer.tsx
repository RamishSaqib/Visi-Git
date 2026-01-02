import { useState } from 'react'

interface ImageComparerProps {
  currentSrc: string | null
  previousSrc: string | null
}

type ViewMode = 'onion' | 'side-by-side'

export default function ImageComparer({ currentSrc, previousSrc }: ImageComparerProps) {
  const [opacity, setOpacity] = useState(100)
  const [viewMode, setViewMode] = useState<ViewMode>('onion')

  // No images to compare
  if (!currentSrc && !previousSrc) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
        Select an image to compare
      </div>
    )
  }

  // New file (no previous version)
  if (currentSrc && !previousSrc) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-center p-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
          <span className="font-medium">New File</span>
        </div>
        <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
          <img
            src={currentSrc}
            alt="New image"
            className="max-w-full max-h-full object-contain"
          />
        </div>
      </div>
    )
  }

  // Deleted file (no current version)
  if (!currentSrc && previousSrc) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-center p-2 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200">
          <span className="font-medium">Deleted</span>
        </div>
        <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
          <img
            src={previousSrc}
            alt="Deleted image (old version)"
            className="max-w-full max-h-full object-contain grayscale"
          />
        </div>
      </div>
    )
  }

  // Both versions exist - show comparison with mode toggle
  return (
    <div className="flex flex-col h-full">
      {/* Header with labels and view mode toggle */}
      <div className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-800">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
          Old (HEAD)
        </span>

        {/* View mode toggle */}
        <div className="flex items-center gap-2" role="radiogroup">
          <label className="flex items-center gap-1 cursor-pointer">
            <input
              type="radio"
              name="viewMode"
              value="onion"
              checked={viewMode === 'onion'}
              onChange={() => setViewMode('onion')}
              className="w-4 h-4"
              aria-label="Onion Skin"
            />
            <span className="text-sm text-gray-600 dark:text-gray-300">Onion Skin</span>
          </label>
          <label className="flex items-center gap-1 cursor-pointer">
            <input
              type="radio"
              name="viewMode"
              value="side-by-side"
              checked={viewMode === 'side-by-side'}
              onChange={() => setViewMode('side-by-side')}
              className="w-4 h-4"
              aria-label="Side by Side"
            />
            <span className="text-sm text-gray-600 dark:text-gray-300">Side by Side</span>
          </label>
        </div>

        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
          New (Working)
        </span>
      </div>

      {/* Image comparison area */}
      {viewMode === 'onion' ? (
        <div className="flex-1 relative overflow-hidden">
          {/* Old image (base layer) */}
          <img
            src={previousSrc!}
            alt="Old version"
            className="absolute inset-0 w-full h-full object-contain"
          />

          {/* New image (overlay with opacity) */}
          <img
            src={currentSrc!}
            alt="New version"
            className="absolute inset-0 w-full h-full object-contain"
            style={{ opacity: opacity / 100 }}
          />
        </div>
      ) : (
        <div className="flex-1 flex overflow-hidden">
          {/* Old image container */}
          <div className="flex-1 flex flex-col border-r border-gray-300 dark:border-gray-600">
            <div className="text-center py-1 bg-gray-200 dark:bg-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300">
              Old
            </div>
            <div className="flex-1 flex items-center justify-center p-2 overflow-hidden">
              <img
                src={previousSrc!}
                alt="Old version"
                className="max-w-full max-h-full object-contain"
              />
            </div>
          </div>

          {/* New image container */}
          <div className="flex-1 flex flex-col">
            <div className="text-center py-1 bg-gray-200 dark:bg-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300">
              New
            </div>
            <div className="flex-1 flex items-center justify-center p-2 overflow-hidden">
              <img
                src={currentSrc!}
                alt="New version"
                className="max-w-full max-h-full object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {/* Slider control - only show in onion skin mode */}
      {viewMode === 'onion' && (
        <div className="p-4 bg-gray-100 dark:bg-gray-800">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 dark:text-gray-300 w-16">
              Old
            </span>
            <input
              type="range"
              min="0"
              max="100"
              value={opacity}
              onChange={(e) => setOpacity(Number(e.target.value))}
              className="flex-1 h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
            <span className="text-sm text-gray-600 dark:text-gray-300 w-16 text-right">
              New
            </span>
          </div>
          <div className="text-center mt-1 text-xs text-gray-500 dark:text-gray-400">
            {opacity}% new / {100 - opacity}% old
          </div>
        </div>
      )}
    </div>
  )
}
