import { useRef, useEffect, useState } from 'react'
import { useFabricCanvas } from '../hooks/useFabricCanvas'
import { applyClipPath } from '../utils/shapeClipPath'

export default function DesignCanvas({
  width = 500,
  height = 600,
  svgClipPath = null,
  backgroundColor = '#ffffff',
  onCanvasReady,
  onUndoStateChange
}) {
  const canvasElementRef = useRef(null)
  const { canvas, canvasRef, saveState, undo, redo, canUndo, canRedo } = useFabricCanvas(
    canvasElementRef,
    { width, height }
  )

  const [isEmpty, setIsEmpty] = useState(true)

  // Notify parent when undo/redo availability changes
  useEffect(() => {
    if (onUndoStateChange) onUndoStateChange(canUndo, canRedo)
  }, [canUndo, canRedo])

  useEffect(() => {
    if (!canvas) return

    canvas.setBackgroundColor(backgroundColor, canvas.renderAll.bind(canvas))

    if (svgClipPath) {
      applyClipPath(canvas, svgClipPath)
    }

    saveState(canvas)

    if (onCanvasReady) {
      onCanvasReady({ canvas, undo, redo, saveState })
    }

    function checkEmpty() {
      setIsEmpty(canvas.getObjects().length === 0)
    }

    canvas.on('object:added', checkEmpty)
    canvas.on('object:removed', checkEmpty)

    return () => {
      canvas.off('object:added', checkEmpty)
      canvas.off('object:removed', checkEmpty)
    }
  }, [canvas])

  return (
    <div className="canvas-wrapper" style={{ position: 'relative', width, height }}>
      <canvas ref={canvasRef} />

      {svgClipPath && (
        <div
          className="canvas-guide-overlay"
          style={{ width, height }}
          aria-hidden="true"
        />
      )}

      {isEmpty && (
        <div className="canvas-empty-hint" aria-hidden="true">
          Upload an image or add text to begin
        </div>
      )}
    </div>
  )
}
