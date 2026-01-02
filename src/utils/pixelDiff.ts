export interface DiffResult {
  diffImageData: ImageData
  changedPixelCount: number
  totalPixelCount: number
}

export function computePixelDiff(
  img1: ImageData,
  img2: ImageData,
  threshold: number = 10
): DiffResult {
  const width = Math.min(img1.width, img2.width)
  const height = Math.min(img1.height, img2.height)
  const diffData = new Uint8ClampedArray(width * height * 4)
  let changedPixelCount = 0

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i1 = (y * img1.width + x) * 4
      const i2 = (y * img2.width + x) * 4
      const outIdx = (y * width + x) * 4

      const r1 = img1.data[i1], g1 = img1.data[i1 + 1], b1 = img1.data[i1 + 2]
      const r2 = img2.data[i2], g2 = img2.data[i2 + 1], b2 = img2.data[i2 + 2]

      const diff = (Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2)) / 3

      if (diff > threshold) {
        changedPixelCount++
        // Magenta highlight for changed pixels
        diffData[outIdx] = 255
        diffData[outIdx + 1] = 0
        diffData[outIdx + 2] = 255
        diffData[outIdx + 3] = 255
      } else {
        // Grayscale for unchanged pixels (dimmed to 50%)
        const gray = Math.round(0.299 * r2 + 0.587 * g2 + 0.114 * b2) * 0.5
        diffData[outIdx] = gray
        diffData[outIdx + 1] = gray
        diffData[outIdx + 2] = gray
        diffData[outIdx + 3] = 255
      }
    }
  }

  return {
    diffImageData: { data: diffData, width, height, colorSpace: 'srgb' } as ImageData,
    changedPixelCount,
    totalPixelCount: width * height
  }
}
