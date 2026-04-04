import { useState, useEffect, useRef } from 'react'

export default function TemplateFieldsDropdown({ editableObjects, canvas }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  const completed = editableObjects.filter(o => o.completed).length
  const total = editableObjects.length
  const required = editableObjects.filter(o => o.required).length
  const requiredDone = editableObjects.filter(o => o.required && o.completed).length

  // Close on outside click
  useEffect(() => {
    function onMouseDown(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [])

  function handleSelect(obj) {
    if (canvas && obj.fabricObj) {
      canvas.setActiveObject(obj.fabricObj)
      canvas.renderAll()
    }
    setOpen(false)
  }

  if (total === 0) return null

  const allDone = completed === total

  return (
    <div className="tfd-wrap" ref={ref}>
      <button
        className={`tfd-btn${allDone ? ' tfd-btn--done' : ''}`}
        onClick={() => setOpen(v => !v)}
      >
        <span className="tfd-btn-label">
          {total === 1 ? '1 Field' : `${total} Fields`}
        </span>
        <span className={`tfd-badge${allDone ? ' tfd-badge--done' : ''}`}>
          {completed}/{total}
        </span>
        {required > 0 && requiredDone < required && (
          <span className="tfd-required-badge">{required - requiredDone} required</span>
        )}
        <svg
          className={`tfd-chevron${open ? ' tfd-chevron--open' : ''}`}
          width="12" height="12" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2.5"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="tfd-menu">
          {editableObjects.map(obj => (
            <button
              key={obj.id}
              className={`tfd-item${obj.completed ? ' tfd-item--done' : ''}`}
              onClick={() => handleSelect(obj)}
            >
              <span className="tfd-item-icon">
                {obj.type === 'text' ? 'T' : '🖼'}
              </span>
              <span className="tfd-item-label">
                {obj.label || obj.id}
                {obj.required && (
                  <span className="tfd-required-star">*</span>
                )}
              </span>
              {obj.completed
                ? <span className="tfd-item-check">✓</span>
                : <span className="tfd-item-empty">○</span>
              }
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
