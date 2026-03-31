import { useRef, useState, useCallback, useEffect } from 'react'

const HISTORY_LIMIT = 30
const CUSTOM_PROPS = ['id', 'editable', 'clipPath', 'lockMovementX', 'lockMovementY']

export function useUndoRedo() {
  const historyRef = useRef([])
  const [currentIndex, setCurrentIndex] = useState(-1)
  const currentIndexRef = useRef(-1)
  const canvasRef = useRef(null)

  // Keep ref in sync with state so callbacks always see the latest value
  function updateIndex(next) {
    currentIndexRef.current = next
    setCurrentIndex(next)
  }

  const saveState = useCallback((canvas) => {
    canvasRef.current = canvas
    const next = currentIndexRef.current + 1
    historyRef.current = historyRef.current.slice(0, next)
    historyRef.current.push(canvas.toJSON(CUSTOM_PROPS))

    if (historyRef.current.length > HISTORY_LIMIT) {
      historyRef.current.shift()
      updateIndex(historyRef.current.length - 1)
    } else {
      updateIndex(historyRef.current.length - 1)
    }
  }, [])

  const undo = useCallback((canvas) => {
    const c = canvas || canvasRef.current
    if (!c || currentIndexRef.current <= 0) return
    const next = currentIndexRef.current - 1
    updateIndex(next)
    c.loadFromJSON(historyRef.current[next], () => c.renderAll())
  }, [])

  const redo = useCallback((canvas) => {
    const c = canvas || canvasRef.current
    if (!c || currentIndexRef.current >= historyRef.current.length - 1) return
    const next = currentIndexRef.current + 1
    updateIndex(next)
    c.loadFromJSON(historyRef.current[next], () => c.renderAll())
  }, [])

  useEffect(() => {
    function onKeyDown(e) {
      const tag = e.target.tagName.toLowerCase()
      if (tag === 'input' || tag === 'textarea') return

      const isMac = navigator.platform.toUpperCase().includes('MAC')
      const ctrl = isMac ? e.metaKey : e.ctrlKey

      if (ctrl && !e.shiftKey && e.key === 'z') {
        e.preventDefault()
        undo()
      } else if (ctrl && (e.key === 'y' || (isMac && e.shiftKey && e.key === 'z'))) {
        e.preventDefault()
        redo()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [undo, redo])

  const canUndo = currentIndex > 0
  const canRedo = currentIndex < historyRef.current.length - 1

  return { saveState, undo, redo, canUndo, canRedo }
}
