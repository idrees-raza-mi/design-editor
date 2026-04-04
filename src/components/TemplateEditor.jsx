import { useState, useRef, useCallback } from 'react'
import TopBar from './TopBar'
import BottomBar from './BottomBar'
import DimensionOverlay from './DimensionOverlay'
import DesignCanvas from './DesignCanvas'
import SavingOverlay from './SavingOverlay'
import SuccessOverlay from './SuccessOverlay'
import PropertiesPanel from './PropertiesPanel'
import TemplateFieldsDropdown from './TemplateFieldsDropdown'
import { loadTemplate } from '../utils/templateLoader'
import { getConfig } from '../config/editorConfig'
import { saveDesign, SAVE_STEPS_CONFIG } from '../utils/shopifyDesign'
import { addToCart } from '../hooks/useShopifyCart'

export default function TemplateEditor({ design, variantId, productTitle, editorTitle = 'Template Editor' }) {
  const [canvas, setCanvas] = useState(null)
  const [saving, setSaving] = useState(false)
  const [overlayVisible, setOverlayVisible] = useState(false)
  const [savingSteps, setSavingSteps] = useState([])
  const [saveError, setSaveError] = useState(null)
  const [editableObjects, setEditableObjects] = useState([])
  const [tooltipVisible, setTooltipVisible] = useState(false)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })
  const [successVisible, setSuccessVisible] = useState(false)
  const [savedThumbnailUrl, setSavedThumbnailUrl] = useState('')
  const [activeTab, setActiveTab] = useState('create')
  const [selectedSize, setSelectedSize] = useState(null)
  const saveFnRef = useRef(null)

  const currentSize = selectedSize || design.availableSizes?.find(s => s.label === design.sizeLabel) || design.availableSizes?.[0]
  const canvasWidth = currentSize?.width || design.canvasWidth
  const canvasHeight = currentSize?.height || design.canvasHeight

  // Wrap saveState so PropertiesPanel can call it as saveState(canvas)
  const saveState = useCallback((c) => saveFnRef.current?.(c), [])

  function markCompletion(fabricObj) {
    setEditableObjects(prev => prev.map(o =>
      o.fabricObj === fabricObj
        ? { ...o, completed: !!(fabricObj.text?.trim()) || fabricObj.__imageReplaced === true }
        : o
    ))
  }

  async function handleCanvasReady({ canvas: fc, saveState: save }) {
    setCanvas(fc)
    saveFnRef.current = save
    window.__fabricCanvas = fc

    // Show tooltip when user clicks a fixed (non-editable) element
    fc.on('mouse:down', (e) => {
      if (e.target && e.target.__permissions?.content === 'fixed') {
        setTooltipPos({ x: e.pointer.x, y: e.pointer.y })
        setTooltipVisible(true)
        setTimeout(() => setTooltipVisible(false), 2000)
      }
    })

    // Update completion state when text is typed directly on canvas
    fc.on('text:changed', (e) => {
      if (e.target) markCompletion(e.target)
    })

    // Update completion state when object is modified via PropertiesPanel
    fc.on('object:modified', (e) => {
      if (e.target) markCompletion(e.target)
    })

    if (design.templateJSON) {
      const { editableObjects: editables } = await loadTemplate(fc, design.templateJSON)

      const objs = editables.map((obj) => ({
        id: obj.id,
        type: obj.type === 'i-text' || obj.type === 'text' ? 'text' : obj.type,
        label: obj.label || obj.id || obj.type,
        required: obj.required || false,
        fabricObj: obj,
        completed: false
      }))
      setEditableObjects(objs)
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
          designType: 'template',
          variantId: getConfig().variantId,
          productTitle: getConfig().productTitle
        },
        updateStep
      )

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

  const completedCount = editableObjects.filter(o => o.completed).length

  return (
    <div className="editor-container">
      <TopBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        showBackButton={false}
        editorTitle={editorTitle}
      />

      <div className="editor-main">

        {/* Left panel — fields dropdown + edit controls */}
        <aside className="template-right-panel">
          <div className="template-notice" style={{ margin: '12px 12px 0' }}>
            Fixed elements cannot be moved or edited.
          </div>
          {editableObjects.length > 0 && (
            <div className="template-progress">
              {completedCount} / {editableObjects.length} fields completed
            </div>
          )}

          <TemplateFieldsDropdown
            editableObjects={editableObjects}
            canvas={canvas}
          />

          <PropertiesPanel
            canvas={canvas}
            saveState={saveState}
          />
        </aside>

        {/* Canvas */}
        <main className="canvas-area">
          <div className="canvas-wrapper">
            <DesignCanvas
              key={currentSize?.id || 'default'}
              width={canvasWidth}
              height={canvasHeight}
              svgClipPath={design.svgClipPath}
              backgroundColor="#ffffff"
              onCanvasReady={handleCanvasReady}
            />
            {canvas && (
              <DimensionOverlay
                canvasWidth={canvasWidth}
                canvasHeight={canvasHeight}
              />
            )}
            {tooltipVisible && (
              <div
                className="template-tooltip"
                style={{ left: tooltipPos.x + 10, top: tooltipPos.y + 10 }}
              >
                This element is part of the template design
              </div>
            )}
          </div>
        </main>


      </div>

      <BottomBar
        productName={design.name}
        price={selectedSize?.price || design.availableSizes?.[0]?.price || null}
        onProcess={handleProcess}
        saving={saving}
        design={{ ...design, sizeLabel: selectedSize?.label || design.sizeLabel }}
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
