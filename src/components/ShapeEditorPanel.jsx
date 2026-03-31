import { useState, useEffect } from 'react'

export default function ShapeEditorPanel({ canvas, selectedObject, isShapeSelected, onBack, saveState, onDelete }) {
  const [fillColor, setFillColor] = useState('#cccccc')
  const [strokeColor, setStrokeColor] = useState('#888888')
  const [strokeWidth, setStrokeWidth] = useState(2)
  const [opacity, setOpacity] = useState(100)
  const [isHollow, setIsHollow] = useState(false)
  const [posX, setPosX] = useState(0)
  const [posY, setPosY] = useState(0)

  useEffect(() => {
    if (selectedObject && isShapeSelected) {
      setFillColor(selectedObject.fill || '#cccccc')
      setStrokeColor(selectedObject.stroke || '#888888')
      setStrokeWidth(selectedObject.strokeWidth || 2)
      setOpacity(Math.round((selectedObject.opacity ?? 1) * 100))
      setIsHollow(selectedObject.fill === 'transparent' || selectedObject.fill === null)
      setPosX(Math.round(selectedObject.left || 0))
      setPosY(Math.round(selectedObject.top || 0))
    }
  }, [selectedObject, isShapeSelected])

  function updateShape(updates) {
    if (!canvas || !selectedObject) return
    selectedObject.set(updates)
    canvas.renderAll()
    saveState?.(canvas)
  }

  function handleFillColorChange(color) {
    setFillColor(color)
    updateShape({ fill: isHollow ? 'transparent' : color })
  }

  function handleStrokeChange(color) {
    setStrokeColor(color)
    updateShape({ stroke: color })
  }

  function handleStrokeWidthChange(width) {
    setStrokeWidth(width)
    updateShape({ strokeWidth: width })
  }

  function handleOpacityChange(val) {
    setOpacity(val)
    updateShape({ opacity: val / 100 })
  }

  function handleHollowToggle() {
    const newHollow = !isHollow
    setIsHollow(newHollow)
    if (newHollow) {
      updateShape({ fill: 'transparent' })
    } else {
      updateShape({ fill: fillColor })
    }
  }

  function handlePosChange(axis, val) {
    const num = Number(val)
    if (axis === 'x') {
      setPosX(num)
      selectedObject.set({ left: num })
    } else {
      setPosY(num)
      selectedObject.set({ top: num })
    }
    canvas.renderAll()
    saveState?.(canvas)
  }

  const showEditor = isShapeSelected && selectedObject

  return (
    <div className="panel-content shape-editor-panel">
      {!showEditor ? (
        <div className="no-selection">
          <p>Select a shape on the canvas to edit</p>
        </div>
      ) : (
        <>
          <div className="shape-edit-header">
            <button className="back-btn" onClick={onBack}>
              <span className="back-arrow">←</span> Back
            </button>
            <h3 className="edit-title">Edit Shape</h3>
          </div>

          <div className="control-row">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={isHollow}
                onChange={handleHollowToggle}
              />
              <span>Hollow (No Fill)</span>
            </label>
          </div>

          {!isHollow && (
            <div className="control-row">
              <span className="control-label">Fill Color</span>
              <div className="color-picker-row">
                <input
                  type="color"
                  value={fillColor}
                  onChange={(e) => handleFillColorChange(e.target.value)}
                  className="color-input"
                />
                <span className="color-value">{fillColor}</span>
              </div>
            </div>
          )}

          <div className="control-row slider-row">
            <span className="control-label">Opacity</span>
            <input
              type="range"
              min="0"
              max="100"
              value={opacity}
              onChange={(e) => handleOpacityChange(parseInt(e.target.value))}
              className="slider"
            />
            <span className="slider-value">{opacity}%</span>
          </div>

          <div className="control-row">
            <span className="control-label">Stroke Color</span>
            <div className="color-picker-row">
              <input
                type="color"
                value={strokeColor}
                onChange={(e) => handleStrokeChange(e.target.value)}
                className="color-input"
              />
              <span className="color-value">{strokeColor}</span>
            </div>
          </div>

          <div className="control-row slider-row">
            <span className="control-label">Stroke Width</span>
            <input
              type="range"
              min="0"
              max="20"
              value={strokeWidth}
              onChange={(e) => handleStrokeWidthChange(parseInt(e.target.value))}
              className="slider"
            />
            <span className="slider-value">{strokeWidth}</span>
          </div>

          <div className="control-row">
            <span className="control-label">Position</span>
          </div>
          <div className="position-inputs">
            <div className="pos-input">
              <label>X</label>
              <input
                type="number"
                value={posX}
                onChange={(e) => handlePosChange('x', e.target.value)}
              />
            </div>
            <div className="pos-input">
              <label>Y</label>
              <input
                type="number"
                value={posY}
                onChange={(e) => handlePosChange('y', e.target.value)}
              />
            </div>
          </div>

          <button 
            className="action-btn action-btn--danger"
            onClick={onDelete}
          >
            Delete Shape
          </button>
        </>
      )}
    </div>
  )
}