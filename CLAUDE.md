# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Visi-Git is a Tauri v2 desktop application for visualizing Git image diffs with an onion skin slider. It helps designers compare image changes between the current working directory and HEAD.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (React frontend + Tauri backend)
npm run tauri dev

# Run frontend tests (Vitest with jsdom)
npm test                    # Watch mode
npm run test:ui             # With Vitest UI
npx vitest run              # Single run
npx vitest run src/components/FileList.test.tsx  # Single test file

# Run Rust backend tests
cd src-tauri && cargo test

# Build for production
npm run tauri build

# Type check
npm run build               # Runs tsc && vite build
```

## Architecture

### Frontend (React + TypeScript + Tailwind v4)
- `src/App.tsx` - Main component with header, sidebar, and image comparison pane
- `src/hooks/useGitRepo.ts` - State management hook handling all git operations via Tauri IPC
- `src/components/ImageComparer.tsx` - Onion skin slider for overlaying old/new images
- `src/components/FileList.tsx` - Sidebar listing changed image files
- `src/components/FolderPicker.tsx` - Repository selection using Tauri dialog plugin
- `src/types.ts` - Shared TypeScript interfaces (`ChangedFile`, `ImageData`, `AppState`)

### Backend (Rust + Tauri v2)
- `src-tauri/src/lib.rs` - All backend logic:
  - `validate_git_repo` - Checks if path contains `.git` directory
  - `get_changed_files` - Runs `git status --porcelain`, filters for image extensions
  - `get_file_at_head` - Runs `git show HEAD:<path>` and returns base64-encoded content
  - Core logic is in `_impl` functions for testability; Tauri commands are thin wrappers
- `src-tauri/src/main.rs` - Entry point, calls `visi_git_lib::run()`

### Frontend-Backend Communication
Uses Tauri's `invoke()` for IPC. Frontend calls Rust commands via:
```typescript
import { invoke } from '@tauri-apps/api/core'
const isValid = await invoke<boolean>('validate_git_repo', { path: repoPath })
```

### Tauri Plugins Used
- `tauri-plugin-dialog` - Folder picker dialogs
- `tauri-plugin-fs` - Reading current file contents from disk
- `tauri-plugin-shell` - Shell command execution

## Testing Patterns

### Frontend Tests (Vitest + React Testing Library)
- Test files colocated: `*.test.tsx` next to component files
- Setup in `src/test/setup.ts` imports jest-dom matchers
- Config in `vitest.config.ts` with jsdom environment

### Backend Tests (Cargo)
- Tests in `src-tauri/src/lib.rs` using `#[cfg(test)]` module
- Uses `tempfile` crate to create isolated git repos for testing
- Pattern: create temp repo, make commits, assert behavior

## Key Implementation Details

- Only tracks image files: png, jpg, jpeg, gif, svg, webp, bmp, ico
- Supports file statuses: modified, added, deleted (from git status codes)
- Images loaded as base64 data URLs for display
- Dark mode support via Tailwind's `dark:` prefix classes
