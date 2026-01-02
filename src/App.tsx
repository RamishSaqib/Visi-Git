import { useGitRepo } from './hooks/useGitRepo'
import FileList from './components/FileList'
import ImageComparer from './components/ImageComparer'
import FolderPicker from './components/FolderPicker'
import ErrorBoundary from './components/ErrorBoundary'
import CommitSelector from './components/CommitSelector'

function App() {
  const {
    repoPath,
    changedFiles,
    selectedFile,
    isLoading,
    error,
    imageData,
    commits,
    baseCommit,
    compareCommit,
    openRepo,
    refreshFiles,
    selectFile,
    clearError,
    selectBaseCommit,
    selectCompareCommit,
  } = useGitRepo()

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        {/* Header */}
        <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">
              Visi-Git
            </h1>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Visual Git for Designers
            </span>
          </div>
          <div className="flex items-center gap-2">
            <FolderPicker
              onOpen={openRepo}
              repoPath={repoPath}
              isLoading={isLoading}
            />
            {repoPath && (
              <button
                onClick={refreshFiles}
                disabled={isLoading}
                className="px-3 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Refresh
              </button>
            )}
          </div>
        </header>

        {/* Error Toast */}
        {error && (
          <div className="mx-4 mt-4 p-3 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-md flex items-center justify-between">
            <span className="text-red-700 dark:text-red-200 text-sm">{error}</span>
            <button
              onClick={clearError}
              className="text-red-500 hover:text-red-700 dark:text-red-300 dark:hover:text-red-100"
            >
              ×
            </button>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 flex overflow-hidden">
          {!repoPath ? (
            // Welcome screen
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="max-w-md">
                <h2 className="text-2xl font-bold mb-4">Welcome to Visi-Git</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Open a Git repository to see changed images and compare
                  versions with the onion skin slider.
                </p>
                <button
                  onClick={openRepo}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Open Repository
                </button>
              </div>
            </div>
          ) : (
            // Repository view
            <>
              {/* File List Sidebar */}
              <aside className="w-64 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-y-auto">
                {/* Commit Selectors */}
                <div className="p-3 border-b border-gray-200 dark:border-gray-700 space-y-3">
                  <CommitSelector
                    commits={commits}
                    selectedCommit={baseCommit}
                    onSelect={selectBaseCommit}
                    label="Base (Before)"
                  />
                  <CommitSelector
                    commits={commits}
                    selectedCommit={compareCommit}
                    onSelect={selectCompareCommit}
                    label="Compare (After)"
                  />
                </div>

                <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="font-medium text-sm text-gray-600 dark:text-gray-300">
                    Changed Images
                    {changedFiles.length > 0 && (
                      <span className="ml-2 text-gray-400">({changedFiles.length})</span>
                    )}
                  </h2>
                </div>
                <FileList
                  files={changedFiles}
                  selectedFile={selectedFile}
                  onSelect={selectFile}
                  isLoading={isLoading}
                />
              </aside>

              {/* Image Comparer */}
              <section className="flex-1 overflow-hidden bg-gray-50 dark:bg-gray-950">
                <ImageComparer
                  currentSrc={imageData.currentSrc}
                  previousSrc={imageData.previousSrc}
                />
              </section>
            </>
          )}
        </main>

        {/* Footer */}
        <footer className="p-2 text-center text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          Visi-Git v0.1.0 • Visual Git for Designers
        </footer>
      </div>
    </ErrorBoundary>
  )
}

export default App
