import '@testing-library/jest-dom'

// Mock Canvas API for jsdom (needed for pixel diff canvas rendering)
class MockCanvasRenderingContext2D {
  canvas: HTMLCanvasElement
  fillStyle: string = ''
  strokeStyle: string = ''
  lineWidth: number = 1

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
  }

  getImageData(_x: number, _y: number, width: number, height: number): ImageData {
    // Return a mock ImageData with neutral gray pixels
    const data = new Uint8ClampedArray(width * height * 4)
    for (let i = 0; i < width * height; i++) {
      data[i * 4] = 128     // R
      data[i * 4 + 1] = 128 // G
      data[i * 4 + 2] = 128 // B
      data[i * 4 + 3] = 255 // A
    }
    return { data, width, height, colorSpace: 'srgb' } as ImageData
  }

  putImageData(_imageData: ImageData, _dx: number, _dy: number): void {}

  drawImage(): void {}

  clearRect(): void {}

  fillRect(): void {}

  strokeRect(): void {}

  beginPath(): void {}

  closePath(): void {}

  moveTo(): void {}

  lineTo(): void {}

  stroke(): void {}

  fill(): void {}

  save(): void {}

  restore(): void {}

  scale(): void {}

  translate(): void {}

  rotate(): void {}
}

HTMLCanvasElement.prototype.getContext = function (
  this: HTMLCanvasElement,
  contextId: string
) {
  if (contextId === '2d') {
    return new MockCanvasRenderingContext2D(this) as unknown as CanvasRenderingContext2D
  }
  return null
} as typeof HTMLCanvasElement.prototype.getContext
