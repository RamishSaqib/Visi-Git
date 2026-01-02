# Noridoc: utils

Path: @/src/utils/

### Overview

Utility functions for Visi-Git. Contains pure functions for image processing and comparison, independent of React components and Tauri.

### How it fits into the larger codebase

Utilities are imported by components that need specific functionality. Currently contains pixel diff computation used by `@/src/components/ImageComparer.tsx` for the Diff view mode.

```
ImageComparer.tsx
       |
       +-- computePixelDiff() --> DiffResult
```

### Core Implementation

**pixelDiff.ts:**
- `computePixelDiff(img1, img2, threshold)` - Compares two ImageData objects pixel by pixel
- Returns `DiffResult` containing: diff image, changed pixel count, total pixel count
- Changed pixels rendered in magenta (255, 0, 255)
- Unchanged pixels rendered in dimmed grayscale (50% brightness)
- Threshold parameter controls sensitivity (higher = more tolerant of small differences)

### Things to Know

**Threshold Calculation:** For each pixel, the average difference across RGB channels is computed. If this average exceeds the threshold, the pixel is considered "changed". The default threshold of 10 provides a good balance between noise reduction and change detection.

**Image Size Handling:** When comparing images of different sizes, the function uses the minimum dimensions to avoid index-out-of-bounds. The diff output matches these minimum dimensions.

**Grayscale Conversion:** Uses ITU-R BT.601 luma coefficients (0.299R + 0.587G + 0.114B) for perceptually accurate grayscale conversion.

Created and maintained by Nori.
