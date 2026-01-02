import { useState, useRef, useEffect, useCallback } from 'react'
import { computePixelDiff } from '../utils/pixelDiff'

type ViewMode = 'onion' | 'side-by-side' | 'diff'

interface ImageComparerProps {
  currentSrc: string | null
  previousSrc: string | null
}

export default function ImageComparer({ currentSrc, previousSrc }: ImageComparerProps) {
  const [opacity, setOpacity] = useState(100)
  const [viewMode, setViewMode] = useState<ViewMode>('onion')
  const [sensitivity, setSensitivity] = useState(10)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [diffStats, setDiffStats] = useState<{ changed: number; total: number } | null>(null)

  const computeDiff = useCallback(() => {
    if (viewMode !== 'diff' || !currentSrc || !previousSrc || !canvasRef.current) {
      return
    }

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img1 = new Image()
    const img2 = new Image()

    let loaded = 0
    const onLoad = () => {
      loaded++
      if (loaded < 2) return

      // Set canvas size to match images
      const width = Math.max(img1.width, img2.width)
      const height = Math.max(img1.height, img2.height)
      canvas.width = width
      canvas.height = height

      // Create temporary canvases to get image data
      const tempCanvas1 = document.createElement('canvas')
      tempCanvas1.width = img1.width
      tempCanvas1.height = img1.height
      const tempCtx1 = tempCanvas1.getContext('2d')
      if (!tempCtx1) return
      tempCtx1.drawImage(img1, 0, 0)
      const imgData1 = tempCtx1.getImageData(0, 0, img1.width, img1.height)

      const tempCanvas2 = document.createElement('canvas')
      tempCanvas2.width = img2.width
      tempCanvas2.height = img2.height
      const tempCtx2 = tempCanvas2.getContext('2d')
      if (!tempCtx2) return
      tempCtx2.drawImage(img2, 0, 0)
      const imgData2 = tempCtx2.getImageData(0, 0, img2.width, img2.height)

      // Compute diff
      const result = computePixelDiff(imgData1, imgData2, sensitivity)

      // Draw diff to canvas
      ctx.putImageData(result.diffImageData, 0, 0)
      setDiffStats({ changed: result.changedPixelCount, total: result.totalPixelCount })
    }

    img1.onload = onLoad
    img2.onload = onLoad
    img1.src = previousSrc
    img2.src = currentSrc
  }, [viewMode, currentSrc, previousSrc, sensitivity])

  useEffect(() => {
    computeDiff()
  }, [computeDiff])

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
        <div className="flex items-center gap-2" role="radiogroup" aria-label="View mode">
          <label className="flex items-center gap-1 cursor-pointer">
            <input
              type="radio"
              name="viewMode"
              value="onion"
              checked={viewMode === 'onion'}
              onChange={() => setViewMode('onion')}
              className="sr-only"
              aria-label="Onion Skin"
            />
            <span
              className={`px-2 py-1 text-xs rounded ${
                viewMode === 'onion'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
              }`}
            >
              Onion Skin
            </span>
          </label>
          <label className="flex items-center gap-1 cursor-pointer">
            <input
              type="radio"
              name="viewMode"
              value="side-by-side"
              checked={viewMode === 'side-by-side'}
              onChange={() => setViewMode('side-by-side')}
              className="sr-only"
              aria-label="Side by Side"
            />
            <span
              className={`px-2 py-1 text-xs rounded ${
                viewMode === 'side-by-side'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
              }`}
            >
              Side by Side
            </span>
          </label>
          <label className="flex items-center gap-1 cursor-pointer">
            <input
              type="radio"
              name="viewMode"
              value="diff"
              checked={viewMode === 'diff'}
              onChange={() => setViewMode('diff')}
              className="sr-only"
              aria-label="Diff"
            />
            <span
              className={`px-2 py-1 text-xs rounded ${
                viewMode === 'diff'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
              }`}
            >
              Diff
            </span>
          </label>
        </div>

        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
          New (Working)
        </span>
      </div>

      {/* Image comparison area */}
      {viewMode === 'onion' && (
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
      )}

      {viewMode === 'side-by-side' && (
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

      {viewMode === 'diff' && (
        <div className="flex-1 flex items-center justify-center overflow-hidden">
          <canvas
            ref={canvasRef}
            data-testid="diff-canvas"
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )}

      {/* Slider control - different based on view mode */}
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

      {viewMode === 'diff' && (
        <div className="p-4 bg-gray-100 dark:bg-gray-800">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 dark:text-gray-300 w-16">
              Sensitive
            </span>
            <input
              type="range"
              min="0"
              max="50"
              value={sensitivity}
              onChange={(e) => setSensitivity(Number(e.target.value))}
              aria-label="Sensitivity"
              className="flex-1 h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
            <span className="text-sm text-gray-600 dark:text-gray-300 w-16 text-right">
              Tolerant
            </span>
          </div>
          <div className="text-center mt-1 text-xs text-gray-500 dark:text-gray-400">
            Threshold: {sensitivity}{diffStats && ` | Changed: ${diffStats.changed}/${diffStats.total} pixels (${((diffStats.changed / diffStats.total) * 100).toFixed(1)}%)`}
          </div>
        </div>
      )}
    </div>
  )
}
