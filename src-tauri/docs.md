# Noridoc: src-tauri (Backend)

Path: @/src-tauri/

### Overview

The Rust Tauri v2 backend for Visi-Git. Handles Git repository operations by shelling out to the `git` command-line tool and exposing the results to the frontend via Tauri's IPC command system.

### How it fits into the larger codebase

The backend is the native binary that hosts the webview containing the React frontend (`@/src/`). It receives IPC calls from the frontend and performs privileged operations (file system access, shell command execution) that the webview cannot do directly.

```
Frontend (React)                       Backend (Rust)
     |                                      |
     |-- invoke('validate_git_repo') ------>|-- check .git exists
     |                                      |
     |-- invoke('get_changed_files') ------>|-- git status --porcelain
     |                                      |
     |-- invoke('get_file_at_head') ------->|-- git show HEAD:<path>
     |                                      |
     |<-- base64 encoded content -----------|
```

### Core Implementation

**Build System:**
- `Cargo.toml`: Rust package configuration with Tauri v2 and plugin dependencies
- `build.rs`: Standard Tauri build script that generates native bindings
- `tauri.conf.json`: Tauri application configuration (window size, plugins, bundling)

**Application Entry:**
- `src/main.rs`: Binary entry point, calls `visi_git_lib::run()`
- `src/lib.rs`: Library crate with all business logic and Tauri command handlers

**Tauri Plugins Used:**
- `tauri-plugin-dialog`: Folder picker dialogs (used by frontend)
- `tauri-plugin-fs`: File reading (used by frontend)
- `tauri-plugin-shell`: Shell command execution capability

### Things to Know

**Testability Pattern:** Core logic is implemented in `*_impl` functions that are pure Rust (no Tauri dependencies). The Tauri commands are thin wrappers that call the `*_impl` functions. This allows testing the logic without Tauri runtime.

**Debug DevTools:** In debug builds (`#[cfg(debug_assertions)]`), the setup hook automatically opens Chrome DevTools for the main window.

**Windows Subsystem:** The main.rs includes `#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]` to hide the console window in release builds on Windows.

Created and maintained by Nori.
