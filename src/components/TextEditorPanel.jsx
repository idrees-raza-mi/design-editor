import { useState, useEffect } from 'react'

const SIMPLE_FONTS = [
  'Arial',
  'Helvetica',
  'Times New Roman',
  'Georgia',
  'Verdana',
  'Trebuchet MS',
  'Courier New',
  'Comic Sans MS'
]

const GRAPHIC_FONTS = [
  'Pacifico',
  'Dancing Script',
  'Great Vibes',
  'Satisfy',
  'Kaushan Script',
  'Permanent Marker',
  'Rock Salt',
  'Abril Fatface'
]

export default function TextEditorPanel({ canvas, selectedText, onBack, saveState }) {
  const [text, setText] = useState('')
  const [fontFamily, setFontFamily] = useState('Arial')
  const [fontSize, setFontSize] = useState(36)
  const [charSpacing, setCharSpacing] = useState(0)
  const [fillColor, setFillColor] = useState('#000000')
  const [fontTab, setFontTab] = useState('simple')
  const [fontWeight, setFontWeight] = useState('normal')
  const [textAlign, setTextAlign] = useState('left')

  useEffect(() => {
    if (selectedText) {
      setText(selectedText.text || '')
      setFontFamily(selectedText.fontFamily || 'Arial')
      setFontSize(selectedText.fontSize || 36)
      setCharSpacing(selectedText.charSpacing || 0)
      setFillColor(selectedText.fill || '#000000')
      setFontWeight(selectedText.fontWeight || 'normal')
      setTextAlign(selectedText.textAlign || 'left')
    }
  }, [selectedText])

  function updateTextObject(updates) {
    if (!canvas || !selectedText) return
    selectedText.set(updates)
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

  function toggleItalic() {
    const newWeight = fontWeight === 'italic' ? 'normal' : 'italic'
    setFontWeight(newWeight)
    updateTextObject({ fontStyle: newWeight })
  }

  function handleAlignChange(align) {
    setTextAlign(align)
    updateTextObject({ textAlign: align })
  }

  const fonts = fontTab === 'simple' ? SIMPLE_FONTS : GRAPHIC_FONTS

  return (
    <div className="panel-content text-editor-panel">
      <div className="text-input-section">
        <textarea
          className="text-input"
          value={text}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder="Enter your text..."
        />
        <div className="text-style-icons">
          <button 
            className={`style-icon ${fontWeight === 'italic' ? 'active' : ''}`}
            onClick={toggleItalic}
            title="Italic"
          >
            I
          </button>
          <button 
            className={`style-icon ${textAlign === 'left' ? 'active' : ''}`}
            onClick={() => handleAlignChange('left')}
            title="Align Left"
          >
            ≡
          </button>
          <button 
            className={`style-icon ${textAlign === 'center' ? 'active' : ''}`}
            onClick={() => handleAlignChange('center')}
            title="Align Center"
          >
            ≡
          </button>
          <button 
            className={`style-icon ${textAlign === 'right' ? 'active' : ''}`}
            onClick={() => handleAlignChange('right')}
            title="Align Right"
          >
            ≡
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
        <span className="control-value" style={{ fontFamily }}>{fontFamily}</span>
      </div>

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
        <span className="control-label">Border color</span>
        <div className="color-picker-row">
          <span className="border-width">0px</span>
          <input
            type="color"
            value="#000000"
            className="color-input"
          />
        </div>
      </div>

      <div className="control-row">
        <span className="control-label">Effects</span>
        <span className="control-value">Plain Text</span>
      </div>
    </div>
  )
}