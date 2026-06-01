import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import ErrorBoundary from './components/ErrorBoundary'
import { installDevErrorOverlay } from './components/devErrorOverlay'

// Dev-only overlay to surface runtime errors that might otherwise be hidden
if (import.meta.env.DEV) {
  try {
    installDevErrorOverlay()
  } catch (e) {
    // ignore overlay failures in dev
    // eslint-disable-next-line no-console
    console.warn('Failed to install dev error overlay', e)
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
