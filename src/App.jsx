import { useState, useRef, useEffect } from 'react'
import { getConfig } from './config/editorConfig'
import { useDesignLoader } from './hooks/useDesignLoader'
import CustomCanvasEditor from './components/CustomCanvasEditor'
import TemplateEditor from './components/TemplateEditor'
import { PermissionsProvider } from './context/PermissionsContext'
import { preloadAllFonts } from './utils/fontLoader'
import './styles/main.css'

export default function App() {
  const { productTitle } = getConfig()
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)
  const [selectedVariantId, setSelectedVariantId] = useState(() => getConfig().variantId)

  const { design, designType, loading, error, retry } = useDesignLoader()

  useEffect(() => {
    preloadAllFonts()
  }, [])

  useEffect(() => {
    if (design && designType) {
      console.log('Design loaded:', designType, design)
    }
    if (design && !selectedVariantId && design.availableSizes?.[0]?.variantId) {
      setSelectedVariantId(design.availableSizes[0].variantId)
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

  const componentPermissions = designType === 'template'
    ? design?.templateJSON?.component_permissions ?? null
    : null

  if (designType === 'canvas') {
    return (
      <PermissionsProvider permissions={componentPermissions}>
        <CustomCanvasEditor
          design={design}
          variantId={selectedVariantId}
          productTitle={getConfig().productTitle}
          editorTitle="Design Editor"
          availableSizes={design?.availableSizes || []}
          selectedVariantId={selectedVariantId}
          onVariantChange={(variant) => setSelectedVariantId(variant.id)}
        />
      </PermissionsProvider>
    )
  }

  if (designType === 'template') {
    return (
      <PermissionsProvider permissions={componentPermissions}>
        <TemplateEditor
          design={design}
          variantId={selectedVariantId}
          productTitle={getConfig().productTitle}
          editorTitle="Template Editor"
          availableSizes={design?.availableSizes || []}
          selectedVariantId={selectedVariantId}
          onVariantChange={(variant) => setSelectedVariantId(variant.id)}
        />
      </PermissionsProvider>
    )
  }

  return null
}
