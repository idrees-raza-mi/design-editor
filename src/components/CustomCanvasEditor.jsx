import { useState, useRef, useEffect } from 'react'
import TopBar from './TopBar'
import LeftPanel from './LeftPanel'
import BottomBar from './BottomBar'
import DimensionOverlay from './DimensionOverlay'
import DesignCanvas from './DesignCanvas'
import SavingOverlay from './SavingOverlay'
import SuccessOverlay from './SuccessOverlay'
import { getConfig } from '../config/editorConfig'
import { saveDesign, SAVE_STEPS_CONFIG } from '../utils/shopifyDesign'
import { addToCart } from '../hooks/useShopifyCart'
import { getPrintSizeLabel } from '../utils/exportDesign'

export default function CustomCanvasEditor({ design, variantId, productTitle }) {
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
  const [selectedText, setSelectedText] = useState(null)
  const [activeTab, setActiveTab] = useState('create')
  const undoRef = useRef(null)
  const saveFnRef = useRef(null)

  function handleCanvasReady({ canvas: fc, undo, redo, saveState }) {
    undoRef.current = () => undo(fc)
    saveFnRef.current = saveState
    setCanvas(fc)
    window.__fabricCanvas = fc

    // Listen for selection events
    fc.on('selection:created', handleSelectionChange)
    fc.on('selection:updated', handleSelectionChange)
    fc.on('selection:cleared', handleSelectionCleared)
  }

  function handleSelectionChange(e) {
    const selected = e.selected?.[0]
    if (selected?.type === 'i-text') {
      setSelectedText(selected)
      setLeftPanelView('text')
    } else if (selected?.type === 'image') {
      setLeftPanelView('upload')
    }
  }

  function handleSelectionCleared() {
    setSelectedText(null)
  }

  function handleUndoStateChange(u, r) {
    setCanUndo(u)
    setCanRedo(r)
  }

  function handleUndo() {
    undoRef.current?.()
  }

  function handleLeftPanelViewChange(view) {
    setLeftPanelView(view)
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
        setSelectedText(text)
      }
      setLeftPanelView('text')
    } else if (tool === 'upload') {
      setLeftPanelView('upload')
    }
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
        onBack={() => setLeftPanelView('menu')}
        canUndo={canUndo}
        onUndo={handleUndo}
        selectedObject={hasSelectedObject}
        onSave={() => {}}
        onZoom={() => {}}
        onEditMenu={() => {}}
      />

      <div className="editor-main">
        <LeftPanel
          view={leftPanelView}
          onViewChange={handleLeftPanelViewChange}
          canvas={canvas}
          saveState={(c) => saveFnRef.current?.(c)}
          selectedText={selectedText}
        />

        <main className="canvas-area">
          <div className="canvas-wrapper">
            <DesignCanvas
              width={design.canvasWidth}
              height={design.canvasHeight}
              svgClipPath={design.svgClipPath}
              backgroundColor={design.backgroundColor}
              onCanvasReady={handleCanvasReady}
              onUndoStateChange={handleUndoStateChange}
            />
            {canvas && (
              <DimensionOverlay 
                canvasWidth={design.canvasWidth} 
                canvasHeight={design.canvasHeight} 
              />
            )}
            {canUndo && (
              <button className="undo-button" onClick={handleUndo}>
                ↩
              </button>
            )}
          </div>
        </main>
      </div>

      <BottomBar
        productName={design.name}
        price="£89.99"
        onProcess={handleProcess}
        saving={saving}
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