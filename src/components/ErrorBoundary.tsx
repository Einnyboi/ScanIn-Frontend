import React from 'react'

type Props = {
  children: React.ReactNode
}

type State = {
  hasError: boolean
  error?: Error | null
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Log to console (could integrate with analytics)
    // eslint-disable-next-line no-console
    console.error('Uncaught error in React tree:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-xl p-6 bg-white border rounded shadow">
            <h2 className="text-lg font-semibold text-red-600">Application Error</h2>
            <p className="mt-2 text-sm text-gray-700">Terjadi error saat menampilkan halaman.</p>
            <pre className="mt-4 whitespace-pre-wrap text-xs text-gray-600">{String(this.state.error)}</pre>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
