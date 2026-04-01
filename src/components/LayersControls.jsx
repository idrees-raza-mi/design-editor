import { useState } from 'react'

export default function LayersControls({ canvas, onLayersChange }) {
  const [showLayers, setShowLayers] = useState(false)
  const [layers, setLayers] = useState([])

  function refreshLayers() {
    if (!canvas) return
    const objects = canvas.getObjects().map((obj, idx) => ({
      id: obj.id || `layer-${idx}`,
      name: obj.type === 'i-text' ? 'Text' : obj.type === 'image' ? 'Image' : obj.type === 'rect' ? 'Rectangle' : obj.type === 'circle' ? 'Circle' : obj.type === 'path' ? 'Shape' : `Object ${idx + 1}`,
      visible: obj.visible !== false,
      locked: obj.selectable === false,
      type: obj.type,
      object: obj
    })).reverse()
    setLayers(objects)
  }

  function toggleLayersPanel() {
    if (!showLayers) {
      refreshLayers()
    }
    setShowLayers(!showLayers)
  }

  function handleLayerSelect(layer) {
    if (!canvas) return
    canvas.setActiveObject(layer.object)
    canvas.renderAll()
  }

  function handleLayerVisibility(layer, e) {
    e.stopPropagation()
    layer.object.set('visible', !layer.visible)
    canvas.renderAll()
    refreshLayers()
  }

  function handleLayerLock(layer, e) {
    e.stopPropagation()
    const newLocked = !layer.locked
    layer.object.set({
      selectable: !newLocked,
      evented: !newLocked
    })
    canvas.renderAll()
    refreshLayers()
    onLayersChange?.()
  }

  function handleLayerDelete(layer, e) {
    e.stopPropagation()
    canvas.remove(layer.object)
    canvas.renderAll()
    refreshLayers()
    onLayersChange?.()
  }

  function handleMoveLayer(layer, direction, e) {
    e.stopPropagation()
    const objects = canvas.getObjects()
    const currentIdx = objects.indexOf(layer.object)
    if (direction === 'up' && currentIdx < objects.length - 1) {
      canvas.bringForward(layer.object)
    } else if (direction === 'down' && currentIdx > 0) {
      canvas.sendBackwards(layer.object)
    }
    canvas.renderAll()
    refreshLayers()
    onLayersChange?.()
  }

  return (
    <div className="canvas-layers-controls">
      <button 
        className="canvas-bg-btn canvas-layers-btn"
        onClick={toggleLayersPanel}
        title="Layers"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="12 2 2 7 12 12 22 7 12 2"/>
          <polyline points="2 17 12 22 22 17"/>
          <polyline points="2 12 12 17 22 12"/>
        </svg>
      </button>
      
      {showLayers && (
        <div className="canvas-layers-popup">
          <div className="canvas-layers-header">
            <span>Layers</span>
            <button className="canvas-layers-close" onClick={() => setShowLayers(false)}>×</button>
          </div>
          
          {layers.length === 0 ? (
            <div className="canvas-layers-empty">No objects on canvas</div>
          ) : (
            <div className="canvas-layers-list">
              {layers.map((layer, idx) => (
                <div 
                  key={layer.id} 
                  className="canvas-layer-item"
                  onClick={() => handleLayerSelect(layer)}
                >
                  <div className="canvas-layer-icon">
                    {layer.type === 'i-text' && 'T'}
                    {layer.type === 'image' && '🖼'}
                    {(layer.type === 'rect' || layer.type === 'circle') && '□'}
                    {layer.type === 'path' && '✎'}
                  </div>
                  <span className="canvas-layer-name">{layer.name}</span>
                  <div className="canvas-layer-actions">
                    <button 
                      className={`canvas-layer-action ${!layer.visible ? 'inactive' : ''}`}
                      onClick={(e) => handleLayerVisibility(layer, e)}
                      title={layer.visible ? 'Hide' : 'Show'}
                    >
                      {layer.visible ? '👁' : '👁‍🗨'}
                    </button>
                    <button 
                      className={`canvas-layer-action ${layer.locked ? 'active' : ''}`}
                      onClick={(e) => handleLayerLock(layer, e)}
                      title={layer.locked ? 'Unlock' : 'Lock'}
                    >
                      {layer.locked ? '🔒' : '🔓'}
                    </button>
                    <button 
                      className="canvas-layer-action"
                      onClick={(e) => handleMoveLayer(layer, 'up', e)}
                      title="Move Up"
                    >
                      ↑
                    </button>
                    <button 
                      className="canvas-layer-action"
                      onClick={(e) => handleMoveLayer(layer, 'down', e)}
                      title="Move Down"
                    >
                      ↓
                    </button>
                    <button 
                      className="canvas-layer-action delete"
                      onClick={(e) => handleLayerDelete(layer, e)}
                      title="Delete"
                    >
                      🗑
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
