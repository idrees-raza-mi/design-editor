import { WARP_PRESETS } from '../utils/textWarp'

const WARP_SVG_MAP = {
  'straight': '/dist/text-wrapper/text_none.51477bc3.svg',
  'wave': '/dist/text-wrapper/text_wave.b3afb8bb.svg',
  'squeeze': '/dist/text-wrapper/text_bridge.15794d61.svg',
  'bridge-down': '/dist/text-wrapper/text_bridgedown.708d351c.svg',
  'pinch': '/dist/text-wrapper/text_pinch.84790266.svg',
  'bulge': '/dist/text-wrapper/text_bulge.0db8f144.svg',
  'arch-up-small': '/dist/text-wrapper/text_arch.22ee4c54.svg',
  'bridge-up': '/dist/text-wrapper/text_roof.6afee986.svg',
  'arch-down': '/dist/text-wrapper/text_archdown.64e2561f.svg',
  'arc-up-large': '/dist/text-wrapper/text_arcdown.e3908c6b.svg',
  'flag': '/dist/text-wrapper/text_sloperight.8bd3cf11.svg',
  'perspective-left': '/dist/text-wrapper/text_slopeleft.b0815dd4.svg',
  'arch-steep': '/dist/text-wrapper/text_rooft.5a2fe42c.svg',
  'diamond': '/dist/text-wrapper/text_wedgebl.aae2c7e3.svg',
  'pinch-top': '/dist/text-wrapper/text_wedgebr.757a9124.svg',
  'pinch-bottom': '/dist/text-wrapper/text_wedgebr.757a9124.svg',
  'bulge-horizontal': '/dist/text-wrapper/text_bulge.0db8f144.svg',
  'lens': '/dist/text-wrapper/text_uppercircle.58ea09c8.svg',
  'circle': '/dist/text-wrapper/text_circle.5dda2a2a.svg',
}

export default function WarpPreviewIcon({ warpId, label, isActive, onClick }) {
  const svgSrc = WARP_SVG_MAP[warpId] || WARP_SVG_MAP['straight']

  return (
    <div
      className={'warp-card' + (isActive ? ' active' : '')}
      onClick={onClick}
      title={label}
    >
      <img 
        src={svgSrc} 
        alt={label}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          padding: '4px'
        }}
      />
    </div>
  )
}