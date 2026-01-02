# Noridoc: src (Rust Source)

Path: @/src-tauri/src/

### Overview

Rust source files for the Tauri backend. Contains the application entry point and all Git-related business logic exposed as Tauri IPC commands.

### How it fits into the larger codebase

This is where all backend logic resides. The `lib.rs` file is the library crate that the binary (`main.rs`) depends on. The frontend (`@/src/`) invokes the commands defined here via Tauri's IPC mechanism.

### Core Implementation

**main.rs:**
- Binary entry point
- Hides console window on Windows in release mode
- Delegates to `visi_git_lib::run()`

**lib.rs - Data Structures:**
```rust
struct ChangedFile {
    path: String,      // Relative path from repo root
    filename: String,  // Just the file name
    status: String,    // "modified", "added", or "deleted"
}
```

**lib.rs - Core Functions:**

| Function | Purpose | Git Command |
|----------|---------|-------------|
| `validate_git_repo_impl` | Check if path is a git repo | (checks for `.git` dir) |
| `get_changed_files_impl` | List changed image files | `git status --porcelain` |
| `get_file_at_head_impl` | Get file content at HEAD | `git show HEAD:<path>` |

**lib.rs - Tauri Commands:**
- `validate_git_repo(path)` -> `Result<bool, String>`
- `get_changed_files(repo_path)` -> `Result<Vec<ChangedFile>, String>`
- `get_file_at_head(repo_path, file_path)` -> `Result<String, String>`

**lib.rs - run() function:**
- Initializes Tauri Builder
- Registers all three plugins (shell, dialog, fs)
- Registers the three IPC command handlers
- Opens DevTools in debug builds
- Starts the Tauri event loop

### Things to Know

**Image File Filtering:** The `is_image_file` helper checks if a path ends with a supported image extension. The constant `IMAGE_EXTENSIONS` lists: png, jpg, jpeg, gif, svg, webp, bmp, ico. Non-image files are filtered out by `get_changed_files_impl`.

**Git Status Parsing:** The function parses `git status --porcelain` output line by line. Each line has format `XY path` where XY is a two-character status code. The first two characters indicate staging/working tree status.

**Base64 Encoding:** `get_file_at_head_impl` returns file content as base64-encoded string using the `base64` crate's standard engine. The raw binary output from `git show` is encoded before returning.

**Error Handling:** All `*_impl` functions return `Result<T, String>` where errors are user-friendly messages. The Tauri commands pass these through directly to the frontend.

Created and maintained by Nori.
