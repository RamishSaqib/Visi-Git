export interface AppState {
  repoPath: string | null;
  isValidRepo: boolean;
  changedFiles: ChangedFile[];
  selectedFile: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface ChangedFile {
  path: string;
  status: string; // "modified", "added", or "deleted"
  filename: string;
}

export interface ImageData {
  currentSrc: string | null;
  previousSrc: string | null;
}

export interface CommitInfo {
  hash: string;
  short_hash: string;
  message: string;
  author: string;
  date: string;
}
