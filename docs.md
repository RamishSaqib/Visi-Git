# Noridoc: visi-git (Root)

Path: @/

### Overview

Visi-Git is a Tauri v2 desktop application that enables designers to visualize Git image changes using an onion skin slider. The application compares image files between the current working directory and the last committed version (HEAD), allowing visual inspection of modifications, additions, and deletions.

### How it fits into the larger codebase

This is the repository root containing the complete Tauri desktop application with two main subsystems:

```
+------------------+        Tauri IPC        +------------------+
|   React Frontend |<----------------------->|   Rust Backend   |
|    (@/src/)      |   invoke() / respond    |   (@/src-tauri/) |
+------------------+                         +------------------+
        |                                            |
        v                                            v
   WebView UI                                  Git CLI wrapper
   (Image comparison)                          (file operations)
```

The frontend handles all user interaction and image rendering while the backend performs Git operations and file I/O through system shell commands. Communication occurs via Tauri's `invoke()` IPC mechanism.

### Core Implementation

**Entry Points:**
- `index.html` - HTML shell that loads the React application
- `@/src/main.tsx` - React application bootstrap
- `@/src-tauri/src/main.rs` - Rust binary entry point

**Data Flow:**
1. User selects a folder via FolderPicker (uses `@tauri-apps/plugin-dialog`)
2. Frontend calls `validate_git_repo` command to verify it contains `.git`
3. Frontend calls `get_changed_files` to retrieve modified/added/deleted image files
4. User selects a file; frontend reads current version via `@tauri-apps/plugin-fs`
5. Frontend calls `get_file_at_head` to retrieve the HEAD version as base64
6. Both versions displayed in ImageComparer with opacity slider

**Build Configuration:**
- Vite serves the React dev server on port 1420
- Tauri proxies the webview to the Vite server in development
- Production bundles the React build into the native binary

### Things to Know

**Image Extension Filter:** Both frontend (`@/src/hooks/useGitRepo.ts`) and backend (`@/src-tauri/src/lib.rs`) contain the same list of supported image extensions: png, jpg, jpeg, gif, svg, webp, bmp, ico. The backend filters during `get_changed_files`; the frontend uses the list only for MIME type detection.

**Git Status Mapping:** The backend maps git status codes to three states:
| Git Code | Status |
|----------|--------|
| `M`, ` M`, `MM` | modified |
| `A`, ` A`, `AM`, `??` | added |
| `D`, ` D` | deleted |
| `R`, ` R` | modified (renamed) |

**Dark Mode:** Tailwind's `dark:` prefix classes are used throughout. The application respects the system color scheme preference.

Created and maintained by Nori.
