import { useState, useRef, useCallback } from 'react'

interface ImageComparerProps {
  currentSrc: string | null
  previousSrc: string | null
}

export default function ImageComparer({ currentSrc, previousSrc }: ImageComparerProps) {
  const [opacity, setOpacity] = useState(100)
  const [zoom, setZoom] = useState(100)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const dragStartRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev + 25, 400))
  }, [])

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev - 25, 25))
  }, [])

  const handleFit = useCallback(() => {
    setZoom(100)
    setPan({ x: 0, y: 0 })
  }, [])

  const handleZoom100 = useCallback(() => {
    setZoom(100)
  }, [])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return // Only left click
    setIsDragging(true)
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      panX: pan.x,
      panY: pan.y,
    }
  }, [pan])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return
    const dx = e.clientX - dragStartRef.current.x
    const dy = e.clientY - dragStartRef.current.y
    setPan({
      x: dragStartRef.current.panX + dx,
      y: dragStartRef.current.panY + dy,
    })
  }, [isDragging])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

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

      {/* Zoom control bar */}
      <div className="flex items-center justify-center gap-2 p-2 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={handleZoomOut}
          aria-label="Zoom out"
          className="px-2 py-1 text-sm bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded"
        >
          -
        </button>
        <span className="text-sm font-medium text-gray-600 dark:text-gray-300 w-12 text-center">
          {zoom}%
        </span>
        <button
          onClick={handleZoomIn}
          aria-label="Zoom in"
          className="px-2 py-1 text-sm bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded"
        >
          +
        </button>
        <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-2" />
        <button
          onClick={handleFit}
          aria-label="Fit"
          className="px-2 py-1 text-sm bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded"
        >
          Fit
        </button>
        <button
          onClick={handleZoom100}
          aria-label="100%"
          className="px-2 py-1 text-sm bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded"
        >
          100%
        </button>
      </div>

      {/* Image comparison area */}
      <div
        ref={containerRef}
        className="flex-1 relative overflow-hidden"
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom / 100})`,
            transformOrigin: 'center center',
          }}
        >
          {/* Old image (base layer) */}
          <img
            src={previousSrc!}
            alt="Old version"
            className="absolute max-w-none"
            style={{ pointerEvents: 'none' }}
          />

          {/* New image (overlay with opacity) */}
          <img
            src={currentSrc!}
            alt="New version"
            className="absolute max-w-none"
            style={{ opacity: opacity / 100, pointerEvents: 'none' }}
          />
        </div>
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
