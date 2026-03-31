export default function MainToolMenu({ onSelectTool }) {
  return (
    <div className="panel-content main-tool-menu">
      <h2 className="panel-title">Create Your Design</h2>

      <div 
        className="tool-card" 
        onClick={() => onSelectTool('upload')}
      >
        <div className="tool-card-icon upload-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
            <path d="M14 14l4-4" />
          </svg>
        </div>
        <div className="tool-card-content">
          <span className="tool-card-title">Upload design</span>
          <span className="tool-card-subtitle">Browse or import</span>
        </div>
      </div>

      <div 
        className="tool-card" 
        onClick={() => onSelectTool('text')}
      >
        <div className="tool-card-icon text-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M4 7V4h16v3" />
            <path d="M9 20h6" />
            <path d="M12 4v16" />
          </svg>
        </div>
        <div className="tool-card-content">
          <span className="tool-card-title">Add Text</span>
          <span className="tool-card-subtitle">Add your text here</span>
        </div>
      </div>
    </div>
  )
}