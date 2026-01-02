# Noridoc: src (Frontend)

Path: @/src/

### Overview

The React TypeScript frontend for Visi-Git. Uses React 19, Tailwind CSS v4, and Tauri IPC APIs to provide the desktop application's user interface for browsing changed image files and comparing versions with onion skin and pixel diff modes.

### How it fits into the larger codebase

The frontend is loaded by Tauri's webview from `@/index.html`. It communicates with the Rust backend (`@/src-tauri/`) exclusively through Tauri's `invoke()` IPC mechanism for Git operations, while using Tauri plugins directly for filesystem access and dialogs.

```
+----------------+     +----------------+     +----------------+
|  App.tsx       |---->|  useGitRepo    |---->|  Tauri IPC     |
|  (orchestrator)|     |  (state/logic) |     |  (backend)     |
+----------------+     +----------------+     +----------------+
        |
        +---> FolderPicker (dialog plugin)
        +---> FileList (display)
        +---> ImageComparer (display + interaction)
        |           +---> utils/pixelDiff (diff computation)
        +---> ErrorBoundary (error handling)
```

### Core Implementation

**Application Shell (`App.tsx`):**
- Renders the three-panel layout: header, sidebar, main content area
- Uses `useGitRepo` hook for all state and operations
- Conditionally renders welcome screen vs repository view

**State Management (`@/src/hooks/useGitRepo.ts`):**
- Single `useState` hook holds all application state
- Exposes actions: `openRepo`, `refreshFiles`, `selectFile`, `clearError`
- Handles the full lifecycle from folder selection through image loading

**Type Definitions (`types.ts`):**
- `AppState`: Complete application state shape
- `ChangedFile`: File path, filename, and status (modified/added/deleted)
- `ImageData`: Current and previous image sources as data URLs

**Styling:**
- Tailwind v4 via PostCSS (`@/postcss.config.js`)
- Base styles in `index.css` with `@import "tailwindcss"`
- Dark mode via `dark:` prefixed utility classes

### Things to Know

**Image Loading Strategy:** Current file contents are read directly from disk via `@tauri-apps/plugin-fs`. Previous (HEAD) version is fetched from the backend as base64, which runs `git show HEAD:<path>`. Both are converted to data URLs for display.

**Base64 Conversion:** The `arrayBufferToBase64` helper in `useGitRepo.ts` manually converts byte arrays to base64 using `String.fromCharCode` and `btoa`. This is necessary because `readFile` returns `Uint8Array`.

**MIME Type Detection:** The `getMimeType` helper maps file extensions to MIME types. Falls back to `application/octet-stream` for unknown extensions.

Created and maintained by Nori.
