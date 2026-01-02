import { describe, it, expect } from 'vitest'
import { computePixelDiff } from './pixelDiff'

describe('computePixelDiff', () => {
  const createImageData = (width: number, height: number, fill: number[]): ImageData => {
    const data = new Uint8ClampedArray(width * height * 4)
    for (let i = 0; i < width * height; i++) {
      data[i * 4] = fill[0]
      data[i * 4 + 1] = fill[1]
      data[i * 4 + 2] = fill[2]
      data[i * 4 + 3] = fill[3]
    }
    return { data, width, height, colorSpace: 'srgb' } as ImageData
  }

  it('returns no changes for identical images', () => {
    const img1 = createImageData(2, 2, [100, 100, 100, 255])
    const img2 = createImageData(2, 2, [100, 100, 100, 255])
    const result = computePixelDiff(img1, img2, 10)
    expect(result.changedPixelCount).toBe(0)
  })

  it('detects all pixels changed for completely different images', () => {
    const img1 = createImageData(2, 2, [0, 0, 0, 255])
    const img2 = createImageData(2, 2, [255, 255, 255, 255])
    const result = computePixelDiff(img1, img2, 10)
    expect(result.changedPixelCount).toBe(4)
  })

  it('respects threshold - small differences ignored at high threshold', () => {
    const img1 = createImageData(1, 1, [100, 100, 100, 255])
    const img2 = createImageData(1, 1, [105, 105, 105, 255])
    expect(computePixelDiff(img1, img2, 10).changedPixelCount).toBe(0)
    expect(computePixelDiff(img1, img2, 2).changedPixelCount).toBe(1)
  })

  it('returns correct totalPixelCount', () => {
    const img1 = createImageData(3, 4, [100, 100, 100, 255])
    const img2 = createImageData(3, 4, [100, 100, 100, 255])
    const result = computePixelDiff(img1, img2, 10)
    expect(result.totalPixelCount).toBe(12)
  })

  it('returns diffImageData with correct dimensions', () => {
    const img1 = createImageData(5, 3, [100, 100, 100, 255])
    const img2 = createImageData(5, 3, [100, 100, 100, 255])
    const result = computePixelDiff(img1, img2, 10)
    expect(result.diffImageData.width).toBe(5)
    expect(result.diffImageData.height).toBe(3)
  })

  it('highlights changed pixels in magenta (255, 0, 255)', () => {
    const img1 = createImageData(1, 1, [0, 0, 0, 255])
    const img2 = createImageData(1, 1, [255, 255, 255, 255])
    const result = computePixelDiff(img1, img2, 10)

    // Check magenta color for changed pixel
    expect(result.diffImageData.data[0]).toBe(255) // R
    expect(result.diffImageData.data[1]).toBe(0)   // G
    expect(result.diffImageData.data[2]).toBe(255) // B
    expect(result.diffImageData.data[3]).toBe(255) // A
  })

  it('renders unchanged pixels in grayscale', () => {
    const img1 = createImageData(1, 1, [100, 100, 100, 255])
    const img2 = createImageData(1, 1, [100, 100, 100, 255])
    const result = computePixelDiff(img1, img2, 10)

    // Unchanged pixels should be grayscale (R = G = B)
    const r = result.diffImageData.data[0]
    const g = result.diffImageData.data[1]
    const b = result.diffImageData.data[2]
    expect(r).toBe(g)
    expect(g).toBe(b)
  })

  it('handles images of different sizes by using minimum dimensions', () => {
    const img1 = createImageData(3, 3, [0, 0, 0, 255])
    const img2 = createImageData(5, 5, [255, 255, 255, 255])
    const result = computePixelDiff(img1, img2, 10)

    // Should use minimum dimensions (3x3)
    expect(result.diffImageData.width).toBe(3)
    expect(result.diffImageData.height).toBe(3)
    expect(result.totalPixelCount).toBe(9)
  })
})
