import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-screen p-8 bg-red-50 dark:bg-red-900">
          <h1 className="text-2xl font-bold text-red-600 dark:text-red-200 mb-4">
            Something went wrong
          </h1>
          <pre className="text-sm text-red-500 dark:text-red-300 bg-white dark:bg-red-950 p-4 rounded-md max-w-lg overflow-auto">
            {this.state.error?.message}
          </pre>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Reload App
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
