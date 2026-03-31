import { useState, useEffect } from 'react'
import { TEXT_EFFECT_PRESETS, applyTextEffect } from '../utils/textEffects'
import { loadFont } from '../utils/fontLoader'
import TextEffectPicker from './TextEffectPicker'

const SIMPLE_FONTS = [
  'Arial',
  'Helvetica',
  'Times New Roman',
  'Georgia',
  'Verdana',
  'Trebuchet MS',
  'Courier New',
  'Comic Sans MS',
  'Tahoma',
  'Palatino Linotype',
  'Garamond',
  'Bookman',
  'Candara',
  'Segoe UI',
  'Calibri'
]

const GRAPHIC_FONTS = [
  'Fredoka One',
  'Pacifico',
  'Boogaloo',
  'Titan One',
  'Lilita One',
  'Righteous',
  'Baloo 2',
  'Permanent Marker',
  'Comic Neue',
  'Chewy',
  'Luckiest Guy',
  'Bangers',
  'Kaushan Script',
  'Lobster',
  'Sacramento',
  'Pinyon Script',
  'Dancing Script',
  'Great Vibes'
]

export default function TextEditorPanel({ canvas, selectedObject, isTextSelected, onBack, saveState, onDelete }) {
  const [text, setText] = useState('')
  const [fontFamily, setFontFamily] = useState('Arial')
  const [fontSize, setFontSize] = useState(36)
  const [charSpacing, setCharSpacing] = useState(0)
  const [fillColor, setFillColor] = useState('#000000')
  const [fontTab, setFontTab] = useState('simple')
  const [fontWeight, setFontWeight] = useState('normal')
  const [textAlign, setTextAlign] = useState('left')
  const [underline, setUnderline] = useState(false)
  const [posX, setPosX] = useState(0)
  const [posY, setPosY] = useState(0)

  useEffect(() => {
    GRAPHIC_FONTS.forEach((font) => loadFont(font))
  }, [])

  useEffect(() => {
    if (selectedObject && isTextSelected) {
      setText(selectedObject.text || '')
      setFontFamily(selectedObject.fontFamily || 'Arial')
      setFontSize(selectedObject.fontSize || 36)
      setCharSpacing(selectedObject.charSpacing || 0)
      setFillColor(typeof selectedObject.fill === 'string' ? selectedObject.fill : '#000000')
      setFontWeight(selectedObject.fontStyle || 'normal')
      setTextAlign(selectedObject.textAlign || 'left')
      setUnderline(!!selectedObject.underline)
      setPosX(Math.round(selectedObject.left || 0))
      setPosY(Math.round(selectedObject.top || 0))
    }
  }, [selectedObject, isTextSelected])

  function updateTextObject(updates) {
    if (!canvas || !selectedObject) return
    selectedObject.set(updates)
    canvas.renderAll()
    saveState?.(canvas)
  }

  function handleTextChange(newText) {
    setText(newText)
    updateTextObject({ text: newText })
  }

  function handleFontFamilyChange(family) {
    setFontFamily(family)
    updateTextObject({ fontFamily: family })
  }

  function handleFontSizeChange(size) {
    setFontSize(size)
    updateTextObject({ fontSize: size })
  }

  function handleCharSpacingChange(spacing) {
    setCharSpacing(spacing)
    updateTextObject({ charSpacing: spacing })
  }

  function handleFillColorChange(color) {
    setFillColor(color)
    updateTextObject({ fill: color })
  }

  function toggleBold() {
    const newWeight = fontWeight === 'bold' ? 'normal' : 'bold'
    setFontWeight(newWeight)
    updateTextObject({ fontWeight: newWeight })
  }

  function toggleItalic() {
    const newStyle = fontWeight === 'italic' ? 'normal' : 'italic'
    setFontWeight(newStyle)
    updateTextObject({ fontStyle: newStyle })
  }

  function toggleUnderline() {
    const newUnderline = !underline
    setUnderline(newUnderline)
    updateTextObject({ underline: newUnderline })
  }

  function handleAlignChange(align) {
    setTextAlign(align)
    updateTextObject({ textAlign: align })
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

  function handleTextEffectSelect(preset) {
    if (selectedObject && canvas) {
      applyTextEffect(selectedObject, preset, canvas)
      saveState?.(canvas)
    }
  }

  const fonts = fontTab === 'simple' ? SIMPLE_FONTS : GRAPHIC_FONTS

  const showEditor = isTextSelected && selectedObject

  return (
    <div className="panel-content text-editor-panel">
      {!showEditor ? (
        <div className="no-selection">
          <p>Select a text object on the canvas to edit</p>
        </div>
      ) : (
        <>
          <div className="text-input-section">
            <textarea
              className="text-input"
              value={text}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="Enter your text..."
            />
            <div className="text-style-icons">
              <button
                className={`style-icon ${fontWeight === 'bold' ? 'active' : ''}`}
                onClick={toggleBold}
                title="Bold"
              >
                <strong>B</strong>
              </button>
              <button
                className={`style-icon ${fontWeight === 'italic' ? 'active' : ''}`}
                onClick={toggleItalic}
                title="Italic"
              >
                <em>I</em>
              </button>
              <button
                className={`style-icon ${underline ? 'active' : ''}`}
                onClick={toggleUnderline}
                title="Underline"
              >
                <span style={{ textDecoration: 'underline' }}>U</span>
              </button>
              <button
                className={`style-icon ${textAlign === 'left' ? 'active' : ''}`}
                onClick={() => handleAlignChange('left')}
                title="Align Left"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="18" y2="18"/>
                </svg>
              </button>
              <button
                className={`style-icon ${textAlign === 'center' ? 'active' : ''}`}
                onClick={() => handleAlignChange('center')}
                title="Align Center"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="3" y1="6" x2="21" y2="6"/><line x1="6" y1="12" x2="18" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/>
                </svg>
              </button>
              <button
                className={`style-icon ${textAlign === 'right' ? 'active' : ''}`}
                onClick={() => handleAlignChange('right')}
                title="Align Right"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="3" y1="6" x2="21" y2="6"/><line x1="9" y1="12" x2="21" y2="12"/><line x1="6" y1="18" x2="21" y2="18"/>
                </svg>
              </button>
            </div>
          </div>

          <div className="font-tabs">
            <button
              className={`font-tab ${fontTab === 'simple' ? 'active' : ''}`}
              onClick={() => setFontTab('simple')}
            >
              Simple Fonts
            </button>
            <button
              className={`font-tab ${fontTab === 'graphic' ? 'active' : ''}`}
              onClick={() => setFontTab('graphic')}
            >
              Graphic Fonts
            </button>
          </div>

          <div className="control-row">
            <span className="control-label">Fonts</span>
            <select
              className="font-select"
              value={fontFamily}
              onChange={(e) => handleFontFamilyChange(e.target.value)}
            >
              {fonts.map((f) => (
                <option key={f} value={f} style={{ fontFamily: f }}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          {fontTab === 'graphic' && (
            <TextEffectPicker
              selectedObject={selectedObject}
              canvas={canvas}
              saveState={saveState}
            />
          )}

          <div className="control-row slider-row">
            <span className="control-label">Font size</span>
            <input
              type="range"
              min="8"
              max="200"
              value={fontSize}
              onChange={(e) => handleFontSizeChange(parseInt(e.target.value))}
              className="slider"
            />
            <span className="slider-value">{fontSize}</span>
          </div>

          <div className="control-row slider-row">
            <span className="control-label">Letter Spacing</span>
            <input
              type="range"
              min="-50"
              max="200"
              value={charSpacing}
              onChange={(e) => handleCharSpacingChange(parseInt(e.target.value))}
              className="slider"
            />
            <span className="slider-value">{charSpacing}</span>
          </div>

          <div className="control-row">
            <span className="control-label">Fill color</span>
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
            Delete Text
          </button>
        </>
      )}
    </div>
  )
}