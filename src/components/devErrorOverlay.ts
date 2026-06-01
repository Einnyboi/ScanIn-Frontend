function ensureOverlayRoot() {
  let root = document.getElementById('dev-error-overlay')
  if (!root) {
    root = document.createElement('div')
    root.id = 'dev-error-overlay'
    document.body.appendChild(root)
  }
  return root
}

function renderOverlay(message: string, stack?: string) {
  const root = ensureOverlayRoot()
  root.style.position = 'fixed'
  root.style.zIndex = '999999'
  root.style.left = '12px'
  root.style.top = '12px'
  root.style.maxWidth = 'calc(100% - 24px)'
  root.style.padding = '12px 16px'
  root.style.background = 'rgba(192, 38, 48, 0.95)'
  root.style.color = 'white'
  root.style.fontFamily = 'monospace'
  root.style.fontSize = '13px'
  root.style.borderRadius = '6px'
  root.style.boxShadow = '0 6px 24px rgba(0,0,0,0.4)'
  root.innerText = message + (stack ? '\n\n' + stack : '')
}

function clearOverlay() {
  const root = document.getElementById('dev-error-overlay')
  if (root && root.parentNode) root.parentNode.removeChild(root)
}

export function installDevErrorOverlay() {
  if (typeof window === 'undefined') return

  // Show uncaught exceptions
  window.addEventListener('error', (ev) => {
    try {
      const msg = ev.message || String(ev.error || 'Unknown error')
      const stack = (ev.error && ev.error.stack) || `${ev.filename}:${ev.lineno}:${ev.colno}`
      renderOverlay(msg, stack)
    } catch (e) {
      // ignore
    }
  })

  window.addEventListener('unhandledrejection', (ev) => {
    try {
      const reason = (ev.reason && (ev.reason.message || JSON.stringify(ev.reason))) || String(ev.reason)
      const stack = ev.reason && ev.reason.stack ? ev.reason.stack : undefined
      renderOverlay(`Unhandled Rejection: ${reason}`, stack)
    } catch (e) {
      // ignore
    }
  })

  // Remove overlay on navigation / hot reload
  if ((import.meta as any).hot) {
    ;(import.meta as any).hot.accept(() => clearOverlay())
  }
}

export function clearDevErrorOverlay() {
  clearOverlay()
}
