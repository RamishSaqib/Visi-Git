# Noridoc: components

Path: @/src/components/

### Overview

React components for Visi-Git's user interface. Contains presentational components for file listing and image comparison, plus utility components for folder selection and error handling.

### How it fits into the larger codebase

All components are composed by `@/src/App.tsx`. They receive state and callbacks from the `useGitRepo` hook and render the UI accordingly. Components do not directly invoke Tauri commands - that responsibility belongs to the hook.

```
App.tsx
   |
   +-- ErrorBoundary (wraps entire app)
   |       |
   |       +-- Header
   |       |     +-- FolderPicker
   |       |     +-- Refresh button
   |       |
   |       +-- Main
   |             +-- FileList (sidebar)
   |             +-- ImageComparer (main area)
```

### Core Implementation

**FileList** - Displays changed image files in a vertical list
- Shows status indicator (M/A/D) with color coding
- Highlights selected file with blue background
- Handles loading and empty states

**ImageComparer** - The core image comparison component
- Supports two view modes: Onion Skin (opacity blend) and Diff (pixel comparison)
- Onion Skin: Overlays old (HEAD) and new (working) versions with opacity slider
- Diff: Highlights changed pixels in magenta, unchanged in grayscale
- Range slider controls opacity (Onion) or sensitivity threshold (Diff)
- Special states for new files (no previous) and deleted files (no current)
- Shows "Select an image to compare" when nothing selected

**FolderPicker** - Repository selection button
- Triggers `onOpen` callback when clicked
- Displays current repository path
- Shows loading state

**ErrorBoundary** - Class component for React error boundary
- Catches render errors in child tree
- Displays error message with reload button
- Uses `getDerivedStateFromError` lifecycle method

### Things to Know

**Status Indicator Colors:**
| Status | Letter | Background |
|--------|--------|------------|
| modified | M | yellow |
| added | A | green |
| deleted | D | red |
| unknown | ? | gray |

**View Mode Toggle:** ImageComparer provides a radio button toggle to switch between Onion Skin and Diff modes. The toggle only appears when both current and previous images exist.

**Onion Skin Implementation:** ImageComparer positions both images absolutely within a relative container. The old image is the base layer (full opacity), the new image overlays it with controlled opacity via inline style. The slider range is 0-100, representing the percentage of the new image visible.

**Diff Mode Implementation:** Uses the `computePixelDiff` utility from `@/src/utils/pixelDiff.ts`. Loads both images into temporary canvases, computes per-pixel differences, and renders the result to a visible canvas. The sensitivity slider (0-50) controls the threshold for considering a pixel "changed".

**Deleted File Display:** Deleted files show the previous version with a grayscale filter (`grayscale` class) to visually indicate the file no longer exists.

Created and maintained by Nori.
