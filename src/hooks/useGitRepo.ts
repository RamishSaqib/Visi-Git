import { useState, useCallback } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { open } from '@tauri-apps/plugin-dialog'
import { readFile } from '@tauri-apps/plugin-fs'
import type { ChangedFile, ImageData } from '../types'

interface UseGitRepoState {
  repoPath: string | null
  isValidRepo: boolean
  changedFiles: ChangedFile[]
  selectedFile: string | null
  isLoading: boolean
  error: string | null
  imageData: ImageData
}

interface UseGitRepoReturn extends UseGitRepoState {
  openRepo: () => Promise<void>
  refreshFiles: () => Promise<void>
  selectFile: (path: string) => Promise<void>
  clearError: () => void
}

export function useGitRepo(): UseGitRepoReturn {
  const [state, setState] = useState<UseGitRepoState>({
    repoPath: null,
    isValidRepo: false,
    changedFiles: [],
    selectedFile: null,
    isLoading: false,
    error: null,
    imageData: { currentSrc: null, previousSrc: null },
  })

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }))
  }, [])

  const openRepo = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }))

      // Open folder picker dialog
      const selected = await open({
        directory: true,
        multiple: false,
        title: 'Select Git Repository',
      })

      if (!selected) {
        setState((prev) => ({ ...prev, isLoading: false }))
        return
      }

      const repoPath = selected as string

      // Validate it's a git repo
      const isValid = await invoke<boolean>('validate_git_repo', { path: repoPath })

      if (!isValid) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: 'Selected folder is not a Git repository',
          repoPath: null,
          isValidRepo: false,
          changedFiles: [],
        }))
        return
      }

      // Get changed files
      const files = await invoke<ChangedFile[]>('get_changed_files', { repoPath })

      setState((prev) => ({
        ...prev,
        repoPath,
        isValidRepo: true,
        changedFiles: files,
        selectedFile: null,
        isLoading: false,
        imageData: { currentSrc: null, previousSrc: null },
      }))
    } catch (err) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: `Failed to open repository: ${err}`,
      }))
    }
  }, [])

  const refreshFiles = useCallback(async () => {
    if (!state.repoPath) return

    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }))

      const files = await invoke<ChangedFile[]>('get_changed_files', {
        repoPath: state.repoPath,
      })

      setState((prev) => ({
        ...prev,
        changedFiles: files,
        isLoading: false,
      }))
    } catch (err) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: `Failed to refresh files: ${err}`,
      }))
    }
  }, [state.repoPath])

  const selectFile = useCallback(
    async (filePath: string) => {
      if (!state.repoPath) return

      try {
        setState((prev) => ({ ...prev, selectedFile: filePath, isLoading: true }))

        const file = state.changedFiles.find((f) => f.path === filePath)
        if (!file) {
          setState((prev) => ({ ...prev, isLoading: false }))
          return
        }

        let currentSrc: string | null = null
        let previousSrc: string | null = null

        // Get current version (from disk) for non-deleted files
        if (file.status !== 'deleted') {
          try {
            const fullPath = `${state.repoPath}/${filePath}`
            const fileData = await readFile(fullPath)
            const mimeType = getMimeType(filePath)
            currentSrc = `data:${mimeType};base64,${arrayBufferToBase64(fileData)}`
          } catch {
            // File might not exist on disk
          }
        }

        // Get previous version (from HEAD) for non-added files
        if (file.status !== 'added') {
          try {
            const base64Data = await invoke<string>('get_file_at_head', {
              repoPath: state.repoPath,
              filePath,
            })
            const mimeType = getMimeType(filePath)
            previousSrc = `data:${mimeType};base64,${base64Data}`
          } catch {
            // File might not exist at HEAD
          }
        }

        setState((prev) => ({
          ...prev,
          imageData: { currentSrc, previousSrc },
          isLoading: false,
        }))
      } catch (err) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: `Failed to load image: ${err}`,
        }))
      }
    },
    [state.repoPath, state.changedFiles]
  )

  return {
    ...state,
    openRepo,
    refreshFiles,
    selectFile,
    clearError,
  }
}

// Helper to convert ArrayBuffer to base64
function arrayBufferToBase64(buffer: Uint8Array): string {
  let binary = ''
  for (let i = 0; i < buffer.length; i++) {
    binary += String.fromCharCode(buffer[i])
  }
  return btoa(binary)
}

// Helper to get MIME type from file extension
function getMimeType(filePath: string): string {
  const ext = filePath.toLowerCase().split('.').pop()
  switch (ext) {
    case 'png':
      return 'image/png'
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg'
    case 'gif':
      return 'image/gif'
    case 'svg':
      return 'image/svg+xml'
    case 'webp':
      return 'image/webp'
    case 'bmp':
      return 'image/bmp'
    case 'ico':
      return 'image/x-icon'
    default:
      return 'application/octet-stream'
  }
}
