import { useState, useRef, useEffect } from 'react'
import TopBar from './TopBar'
import LeftPanel from './LeftPanel'
import BottomBar from './BottomBar'
import DimensionOverlay from './DimensionOverlay'
import DesignCanvas from './DesignCanvas'
import CanvasBackgroundControls from './CanvasBackgroundControls'
import SavingOverlay from './SavingOverlay'
import SuccessOverlay from './SuccessOverlay'
import { getConfig } from '../config/editorConfig'
import { saveDesign, SAVE_STEPS_CONFIG } from '../utils/shopifyDesign'
import { addToCart } from '../hooks/useShopifyCart'

export default function CustomCanvasEditor({ design, variantId, productTitle, editorTitle = 'Design Editor' }) {
  const [canvas, setCanvas] = useState(null)
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)
  const [saving, setSaving] = useState(false)
  const [overlayVisible, setOverlayVisible] = useState(false)
  const [savingSteps, setSavingSteps] = useState([])
  const [saveError, setSaveError] = useState(null)
  const [successVisible, setSuccessVisible] = useState(false)
  const [savedThumbnailUrl, setSavedThumbnailUrl] = useState('')
  const [leftPanelView, setLeftPanelView] = useState('menu')
  const [activeTab, setActiveTab] = useState('activeTab')
  const [selectedObject, setSelectedObject] = useState(null)
  const [zoomLevel, setZoomLevel] = useState(100)
  const [selectedSize, setSelectedSize] = useState(null)
  const [previousView, setPreviousView] = useState(null)
  const undoRef = useRef(null)
  const saveFnRef = useRef(null)

  const currentSize = selectedSize || design.availableSizes?.find(s => s.label === design.sizeLabel) || design.availableSizes?.[0]
  const canvasWidth = currentSize?.width || design.canvasWidth
  const canvasHeight = currentSize?.height || design.canvasHeight

  function handleCanvasReady({ canvas: fc, undo, redo, saveState }) {
    undoRef.current = () => undo(fc)
    fc.redoRef = () => redo(fc)
    saveFnRef.current = saveState
    setCanvas(fc)
    window.__fabricCanvas = fc
  }

  function handleUndoStateChange(u, r) {
    setCanUndo(u)
    setCanRedo(r)
  }

  function handleUndo() {
    undoRef.current?.()
  }

  function handleRedo() {
    if (canvas && canvas.redoRef) {
      canvas.redoRef()
    }
  }

  function handleLeftPanelViewChange(view) {
    if (leftPanelView !== 'menu' && view === 'menu') {
      setPreviousView(leftPanelView)
    }
    setLeftPanelView(view)
  }

  function handleBack() {
    if (previousView) {
      setLeftPanelView(previousView)
      setPreviousView(null)
    } else {
      setLeftPanelView('menu')
    }
  }

  function handleToolSelect(tool) {
    if (tool === 'text') {
      if (canvas) {
        const { fabric } = window
        const text = new fabric.IText('Your Text', {
          left: canvas.width / 2 - 50,
          top: canvas.height / 2,
          fontFamily: 'Arial',
          fontSize: 36,
          fill: '#000000'
        })
        canvas.add(text)
        canvas.setActiveObject(text)
        canvas.renderAll()
        saveFnRef.current?.(canvas)
      }
      setLeftPanelView('text')
    } else if (tool === 'upload') {
      setLeftPanelView('upload')
    }
  }

  function handleZoom(delta) {
    if (!canvas) return
    if (delta === 0) {
      setZoomLevel(100)
      canvas.setZoom(1)
      canvas.renderAll()
      return
    }
    const newZoom = Math.max(25, Math.min(200, zoomLevel + delta))
    setZoomLevel(newZoom)
    const zoom = newZoom / 100
    canvas.setZoom(zoom)
    canvas.renderAll()
  }

  function handleSave() {
    saveFnRef.current?.(canvas)
  }

  function handleResetCanvas() {
    if (!canvas) return
    canvas.clear()
    canvas.backgroundColor = design.backgroundColor || '#ffffff'
    canvas.renderAll()
    setZoomLevel(100)
    canvas.setZoom(1)
    saveFnRef.current?.(canvas)
    setLeftPanelView('menu')
  }

  async function handleProcess() {
    if (!canvas) return
    
    setOverlayVisible(true)
    setSavingSteps(SAVE_STEPS_CONFIG.map(s => ({ ...s, status: 'pending' })))
    setSaveError(null)
    setSaving(true)

    const updateStep = (stepId, status) => {
      setSavingSteps(prev => prev.map(s => s.id === stepId ? { ...s, status } : s))
    }

    try {
      const { designId, thumbnailUrl, printFileUrl } = await saveDesign(
        canvas,
        {
          sourceDesignId: getConfig().designId,
          designType: 'canvas',
          variantId: getConfig().variantId,
          productTitle: getConfig().productTitle
        },
        updateStep
      )
      
      setSaving(true)
      try {
        await addToCart(designId, thumbnailUrl, printFileUrl)
        setOverlayVisible(false)
        setSavedThumbnailUrl(thumbnailUrl)
        setSuccessVisible(true)
      } catch (cartErr) {
        setSaveError('Cart error: ' + cartErr.message)
      } finally {
        setSaving(false)
      }
    } catch (err) {
      setSaveError(err.message)
      setSaving(false)
    }
  }

  const isDev = typeof window !== 'undefined' && window.location.hostname === 'localhost'
  const hasSelectedObject = canvas && canvas.getActiveObject()

  return (
    <div className="editor-container">
      <TopBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        showBackButton={leftPanelView !== 'menu'}
        onBack={handleBack}
        canUndo={canUndo}
        onUndo={handleUndo}
        canRedo={canRedo}
        onRedo={handleRedo}
        selectedObject={hasSelectedObject}
        onSave={handleSave}
        onZoom={handleZoom}
        zoomLevel={zoomLevel}
        editorTitle={editorTitle}
      />

      <div className="editor-main">
        <LeftPanel
          view={leftPanelView}
          onViewChange={handleLeftPanelViewChange}
          canvas={canvas}
          saveState={(c) => saveFnRef.current?.(c)}
        />

        <CanvasBackgroundControls canvas={canvas} saveState={(c) => saveFnRef.current?.(c)} defaultColor={design.backgroundColor} />

        <main className="canvas-area">
          <div className="canvas-wrapper">
            {canUndo && (
              <div className="canvas-undo-redo">
                <button 
                  className="canvas-undo-btn" 
                  onClick={handleUndo}
                  title="Undo (Ctrl+Z)"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/>
                  </svg>
                </button>
                <button 
                  className="canvas-redo-btn" 
                  onClick={handleRedo}
                  disabled={!canRedo}
                  title="Redo (Ctrl+Y)"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"/>
                  </svg>
                </button>
              </div>
            )}
            <DesignCanvas
              key={currentSize?.id || 'default'}
              width={canvasWidth}
              height={canvasHeight}
              svgClipPath={design.svgClipPath}
              backgroundColor={design.backgroundColor}
              onCanvasReady={handleCanvasReady}
              onUndoStateChange={handleUndoStateChange}
            />
            {canvas && (
              <DimensionOverlay 
                canvasWidth={canvasWidth} 
                canvasHeight={canvasHeight}
              />
            )}
            <button className="canvas-reset-btn" onClick={handleResetCanvas} title="Reset Canvas">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                <path d="M3 3v5h5"/>
              </svg>
            </button>
          </div>
        </main>
      </div>

      <BottomBar
        productName={design.name}
        price={selectedSize?.price || design.availableSizes?.[0]?.price || null}
        onProcess={handleProcess}
        saving={saving}
        design={{...design, sizeLabel: selectedSize?.label || design.sizeLabel}}
        onSizeChange={setSelectedSize}
      />

      <SavingOverlay
        visible={overlayVisible}
        steps={savingSteps}
        error={saveError}
        onRetry={handleProcess}
        onClose={() => setOverlayVisible(false)}
      />

      <SuccessOverlay
        visible={successVisible}
        thumbnailUrl={savedThumbnailUrl}
        productTitle={getConfig().productTitle}
        onViewCart={() => window.location.href = '/cart'}
        onContinue={() => setSuccessVisible(false)}
      />
    </div>
  )
}