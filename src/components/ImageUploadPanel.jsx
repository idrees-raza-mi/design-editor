import { useState, useRef } from 'react'
import { fabric } from 'fabric'

const RECENT_KEY = 'editor_recent_uploads'
const MAX_RECENT = 5

function getRecentUploads() {
  try {
    const data = localStorage.getItem(RECENT_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function saveRecentUpload(dataUrl) {
  try {
    const recent = getRecentUploads()
    const newRecent = [
      { dataUrl, timestamp: Date.now() },
      ...recent.filter(r => r.dataUrl !== dataUrl)
    ].slice(0, MAX_RECENT)
    localStorage.setItem(RECENT_KEY, JSON.stringify(newRecent))
  } catch {}
}

export default function ImageUploadPanel({ canvas, saveState, onBack }) {
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [agreed, setAgreed] = useState(true)
  const inputRef = useRef(null)
  const recentUploads = getRecentUploads()

  function handleFile(file) {
    if (!canvas || !file) return
    if (!file.type.startsWith('image/')) return

    setLoading(true)
    const url = URL.createObjectURL(file)
    
    // Save to recent
    saveRecentUpload(url)

    fabric.Image.fromURL(
      url,
      (img) => {
        const scale = Math.min(
          (canvas.width - 40) / img.width,
          (canvas.height - 40) / img.height
        )
        img.set({ scaleX: scale, scaleY: scale, left: 20, top: 20 })
        canvas.add(img)
        canvas.setActiveObject(img)
        canvas.renderAll()
        saveState?.(canvas)
        setLoading(false)
      },
      { crossOrigin: 'anonymous' }
    )
  }

  function onDrop(e) {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files[0])
  }

  function onDragOver(e) {
    e.preventDefault()
    setDragging(true)
  }

  function onDragLeave() {
    setDragging(false)
  }

  function onChange(e) {
    handleFile(e.target.files[0])
    e.target.value = ''
  }

  function handleRecentClick(dataUrl) {
    if (!canvas) return
    fabric.Image.fromURL(
      dataUrl,
      (img) => {
        const scale = Math.min(
          (canvas.width - 40) / img.width,
          (canvas.height - 40) / img.height
        )
        img.set({ scaleX: scale, scaleY: scale, left: 20, top: 20 })
        canvas.add(img)
        canvas.setActiveObject(img)
        canvas.renderAll()
        saveState?.(canvas)
      },
      { crossOrigin: 'anonymous' }
    )
  }

  return (
    <div className="panel-content image-upload-panel">
      <div className="upload-zone-wrapper">
        <div
          className={`upload-zone ${dragging ? 'upload-zone--active' : ''}`}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onClick={() => inputRef.current?.click()}
        >
          {loading ? (
            <div className="upload-spinner" />
          ) : (
            <>
              <div className="upload-icon-large">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="1.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>
              <span className="upload-text">Drag and drop file here</span>
              <div className="upload-or">
                <span>OR</span>
              </div>
              <button className="browse-button">Browse File</button>
            </>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/svg,image/jpeg,image/jpg,image/png"
          style={{ display: 'none' }}
          onChange={onChange}
        />
      </div>

      <div className="upload-info">
        <span className="upload-info-text">Accepted File Types (Max size: 40 MB)</span>
        <div className="file-types">
          <span className="file-type-badge">SVG</span>
          <span className="file-type-badge">JPEG</span>
          <span className="file-type-badge">JPG</span>
          <span className="file-type-badge">PNG</span>
        </div>
      </div>

      <label className="terms-checkbox">
        <input 
          type="checkbox" 
          checked={agreed} 
          onChange={(e) => setAgreed(e.target.checked)}
        />
        <span>I Agree <a href="#terms">Terms and Conditions.</a></span>
      </label>

      {recentUploads.length > 0 && (
        <div className="recent-uploads">
          <span className="recent-title">Recent uploaded</span>
          <div className="recent-grid">
            {recentUploads.slice(0, 3).map((item, idx) => (
              <img
                key={idx}
                src={item.dataUrl}
                alt="Recent upload"
                className="recent-thumbnail"
                onClick={() => handleRecentClick(item.dataUrl)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}