import { createRoot } from 'react-dom/client'
import App from './App'

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
    const root = createRoot(container)
    root.render(<App />)
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mount)
} else {
  mount()
}
