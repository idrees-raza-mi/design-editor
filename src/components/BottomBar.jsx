import { getConfig } from '../config/editorConfig'

export default function BottomBar({ 
  thumbnailUrl, 
  productName,
  price = '£89.99',
  onProcess,
  saving = false 
}) {
  const config = getConfig()
  const displayName = productName || config.productTitle || 'Product'
  const truncatedName = displayName.length > 12 ? displayName.substring(0, 12) + '...' : displayName

  return (
    <footer className="bottom-bar">
      <div className="bottom-bar-left">
        <div className="product-thumbnail">
          {thumbnailUrl ? (
            <img src={thumbnailUrl} alt={displayName} />
          ) : (
            <div className="thumbnail-placeholder" />
          )}
          <span className="thumbnail-indicator" />
        </div>
        <span className="product-name">{truncatedName}</span>
      </div>

      <div className="bottom-bar-right">
        {price && <span className="price-label">{price}</span>}
        <button 
          className="process-button" 
          onClick={onProcess}
          disabled={saving}
        >
          {saving ? (
            <>
              <span className="btn-spinner" />
              Processing...
            </>
          ) : (
            'Process'
          )}
        </button>
      </div>
    </footer>
  )
}