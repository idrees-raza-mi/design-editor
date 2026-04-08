import { createRoot } from 'react-dom/client'
import App from './App'

function getConfigFromURL() {
  const params = new URLSearchParams(window.location.search)
  const productHandle = params.get('product')
  const designType = params.get('type') || 'template'
  const variantId = params.get('variant') || null
  const productTitle = params.get('title') || ''

  if (productHandle) {
    return {
      designId: null,
      designType,
      variantId,
      productTitle,
      productHandle,
    }
  }
  return null
}

function mount() {
  const container = document.getElementById('design-editor')
  if (!container) return

  const isAdminView = window.location.pathname === '/view'

  if (isAdminView) {
    import('./pages/AdminView').then(({ default: AdminView }) => {
      const root = createRoot(container)
      root.render(<AdminView />)
    })
  } else {
    // Set config from URL parameters
    const urlConfig = getConfigFromURL()
    if (urlConfig) {
      window.__EDITOR_CONFIG__ = urlConfig
    }

    const root = createRoot(container)
    root.render(<App />)
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mount)
} else {
  mount()
}
