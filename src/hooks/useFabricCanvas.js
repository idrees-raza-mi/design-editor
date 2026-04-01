import { useEffect, useRef, useState } from 'react'
import { fabric } from 'fabric'
import { useUndoRedo } from './useUndoRedo'

export function useFabricCanvas(canvasElementRef, { width, height } = {}) {
  const [canvas, setCanvas] = useState(null)
  const { saveState, undo, redo, canUndo, canRedo } = useUndoRedo()
  const fabricRef = useRef(null)

  useEffect(() => {
    if (!canvasElementRef.current) return

    const fc = new fabric.Canvas(canvasElementRef.current, {
      width: width ?? 600,
      height: height ?? 500,
      backgroundColor: '#ffffff',
      selection: true,
      preserveObjectStacking: true
    })

    fabricRef.current = fc

    function onKeyDown(e) {
      const tag = e.target.tagName.toLowerCase()
      if (tag === 'input' || tag === 'textarea') return
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const active = fc.getActiveObject()
        if (!active) return
        if (active.type === 'activeSelection') {
          active.forEachObject((obj) => fc.remove(obj))
          fc.discardActiveObject()
        } else {
          fc.remove(active)
        }
        fc.renderAll()
        saveState(fc)
      }
    }

    window.addEventListener('keydown', onKeyDown)

    fc.on('object:added', () => saveState(fc))
    fc.on('object:modified', () => saveState(fc))

    setCanvas(fc)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      fc.dispose()
    }
  }, [])

  return { canvas, canvasRef: canvasElementRef, saveState, undo, redo, canUndo, canRedo }
}
