import { Lock } from 'lucide-react'

export default function LockedControl({ locked, tooltip, children }) {
  if (!locked) {
    return children
  }

  return (
    <div
      style={{
        position: 'relative',
        opacity: 0.45,
        pointerEvents: 'none',
        cursor: 'not-allowed'
      }}
      title={tooltip}
    >
      {children}
      <span
        style={{
          position: 'absolute',
          top: 2,
          right: 2,
          lineHeight: 1,
          pointerEvents: 'none'
        }}
      >
        <Lock size={12} color="#dc2626" style={{ flexShrink: 0 }} />
      </span>
    </div>
  )
}
