import { useState, useRef, useEffect } from 'react'
import { getConfig } from './config/editorConfig'
import { useDesignLoader } from './hooks/useDesignLoader'
import CustomCanvasEditor from './components/CustomCanvasEditor'
import TemplateEditor from './components/TemplateEditor'
import { preloadAllFonts } from './utils/fontLoader'
import './styles/main.css'

export default function App() {
  const { productTitle } = getConfig()
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)

  const { design, designType, loading, error, retry } = useDesignLoader()

  useEffect(() => {
    preloadAllFonts()
  }, [])

  useEffect(() => {
    if (design && designType) {
      console.log('Design loaded:', designType, design)
    }
  }, [design, designType])

  if (loading) {
    return (
      <div className="editor-root">
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Loading your design from Shopify...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="editor-root">
        <div className="error-overlay">
          <p>Could not load design: {error}</p>
          <button className="retry-btn" onClick={retry}>Retry</button>
        </div>
      </div>
    )
  }

  if (designType === 'canvas') {
    return (
      <CustomCanvasEditor
        design={design}
        variantId={getConfig().variantId}
        productTitle={getConfig().productTitle}
      />
    )
  }

  if (designType === 'template') {
    return (
      <TemplateEditor
        design={design}
        variantId={getConfig().variantId}
        productTitle={getConfig().productTitle}
      />
    )
  }

  return null
}
