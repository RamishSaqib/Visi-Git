import { useState } from 'react'

interface ImageComparerProps {
  currentSrc: string | null
  previousSrc: string | null
}

export default function ImageComparer({ currentSrc, previousSrc }: ImageComparerProps) {
  const [opacity, setOpacity] = useState(100)

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

  // Both versions exist - show onion skin comparison
  return (
    <div className="flex flex-col h-full">
      {/* Header with labels */}
      <div className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-800">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
          Old (HEAD)
        </span>
        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
          New (Working)
        </span>
      </div>

      {/* Image comparison area */}
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

      {/* Slider control */}
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
    </div>
  )
}
