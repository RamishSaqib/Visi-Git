# Noridoc: hooks

Path: @/src/hooks/

### Overview

Custom React hooks for Visi-Git. Contains `useGitRepo`, the central state management hook that orchestrates all Git-related operations and holds the complete application state.

### How it fits into the larger codebase

The `useGitRepo` hook is the single source of truth for application state. It is consumed by `@/src/App.tsx` and its return values are passed down to child components. The hook bridges the React UI with the Tauri backend via IPC.

```
useGitRepo
    |
    +-- invoke('validate_git_repo') --> Rust backend
    +-- invoke('get_changed_files') --> Rust backend
    +-- invoke('get_file_at_head')  --> Rust backend
    +-- open() --> @tauri-apps/plugin-dialog
    +-- readFile() --> @tauri-apps/plugin-fs
```

### Core Implementation

**State Shape (`UseGitRepoState`):**
- `repoPath`: Currently opened repository path or null
- `isValidRepo`: Whether the path contains a `.git` directory
- `changedFiles`: Array of `ChangedFile` objects
- `selectedFile`: Path of currently selected file or null
- `isLoading`: Loading state for async operations
- `error`: Error message string or null
- `imageData`: Object with `currentSrc` and `previousSrc` data URLs

**Actions:**
- `openRepo()`: Opens folder dialog, validates repo, loads changed files
- `refreshFiles()`: Reloads changed files for current repo
- `selectFile(path)`: Loads both versions of the selected image
- `clearError()`: Clears the error state

**Image Loading in `selectFile`:**
1. For non-deleted files: reads current version from disk via `readFile`
2. For non-added files: fetches HEAD version via `get_file_at_head` command
3. Converts both to base64 data URLs with appropriate MIME types

### Things to Know

**Error Handling Pattern:** Each action wraps its async logic in try-catch. Errors are caught and stored in state via `setState({ error: ... })` rather than thrown. The UI displays errors via a toast component in App.tsx.

**State Update Pattern:** Uses functional `setState` updates (`prev => ({ ...prev, ... })`) to ensure consistency when multiple state properties change together.

**Deleted vs Added Logic:** The `selectFile` function checks `file.status` to determine which versions to load. Deleted files skip current version (doesn't exist on disk). Added files skip previous version (doesn't exist in HEAD).

Created and maintained by Nori.
