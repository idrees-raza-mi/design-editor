import opentype from 'opentype.js'
import Warp from 'warpjs'

const FONT_FILE_MAP = {
  'Playfair Display':  '/fonts/PlayfairDisplay-Regular.woff2',
  'Great Vibes':       '/fonts/GreatVibes-Regular.woff2',
  'Montserrat':        '/fonts/Montserrat-Regular.woff2',
  'Bebas Neue':        '/fonts/BebasNeue-Regular.woff2',
  'Pacifico':          '/fonts/Pacifico-Regular.woff2',
  'Dancing Script':    '/fonts/DancingScript-Regular.woff2',
  'Oswald':            '/fonts/Oswald-Regular.woff2',
  'Lobster':           '/fonts/Lobster-Regular.woff2',
  'Raleway':           '/fonts/Raleway-Regular.woff2',
  'Cinzel':            '/fonts/Cinzel-Regular.woff2',
  'Sacramento':        '/fonts/Sacramento-Regular.woff2',
  'Abril Fatface':     '/fonts/AbrilFatface-Regular.woff2',
  'Josefin Sans':      '/fonts/JosefinSans-Regular.woff2',
  'Satisfy':           '/fonts/Satisfy-Regular.woff2',
  'Righteous':         '/fonts/Righteous-Regular.woff2',
}

const _opentypeFontCache = new Map()

export async function loadOpentypeFont(fontPath) {
  if (_opentypeFontCache.has(fontPath)) {
    return _opentypeFontCache.get(fontPath)
  }
  const font = await opentype.load(fontPath)
  _opentypeFontCache.set(fontPath, font)
  return font
}

const WARP_PRESETS = [
  {
    id: 'straight',
    label: 'Straight',
    transform: (width, height, strength) => ([x, y]) => [x, y]
  },
  {
    id: 'wave',
    label: 'Wave',
    transform: (width, height, strength) => ([x, y]) => {
      const s = strength * height * 0.4
      return [x, y + s * Math.sin((x / width) * Math.PI * 2)]
    }
  },
  {
    id: 'squeeze',
    label: 'Squeeze',
    transform: (width, height, strength) => ([x, y]) => {
      const s = strength * 0.5
      const normalized = (x / width) - 0.5
      const scale = 1 - s * (1 - Math.abs(normalized) * 2)
      const midY = height / 2
      return [x, midY + (y - midY) * scale]
    }
  },
  {
    id: 'bridge-down',
    label: 'Bridge Down',
    transform: (width, height, strength) => ([x, y]) => {
      const s = strength * height * 0.6
      const normalized = (x / width - 0.5) * 2
      return [x, y + s * (normalized * normalized)]
    }
  },
  {
    id: 'pinch',
    label: 'Pinch',
    transform: (width, height, strength) => ([x, y]) => {
      const s = strength * 0.6
      const normalized = Math.abs(x / width - 0.5) * 2
      const midY = height / 2
      return [x, midY + (y - midY) * (1 - s * (1 - normalized))]
    }
  },
  {
    id: 'bulge',
    label: 'Bulge',
    transform: (width, height, strength) => ([x, y]) => {
      const s = strength * 0.6
      const normalized = 1 - Math.abs(x / width - 0.5) * 2
      const midY = height / 2
      return [x, midY + (y - midY) * (1 + s * normalized)]
    }
  },
  {
    id: 'arch-up-small',
    label: 'Arch Up Small',
    transform: (width, height, strength) => ([x, y]) => {
      const s = strength * height * 0.5
      return [x, y - s * Math.cos((x / width - 0.5) * Math.PI)]
    }
  },
  {
    id: 'bridge-up',
    label: 'Bridge Up',
    transform: (width, height, strength) => ([x, y]) => {
      const s = strength * height * 0.6
      const normalized = (x / width - 0.5) * 2
      return [x, y - s * (1 - normalized * normalized)]
    }
  },
  {
    id: 'arch-down',
    label: 'Arch Down',
    transform: (width, height, strength) => ([x, y]) => {
      const s = strength * height * 0.5
      return [x, y + s * Math.cos((x / width - 0.5) * Math.PI)]
    }
  },
  {
    id: 'arc-up-large',
    label: 'Arc Up',
    transform: (width, height, strength) => ([x, y]) => {
      const s = strength * height * 0.8
      const angle = ((x / width) - 0.5) * Math.PI
      return [x, y - s * Math.cos(angle) * (1 - Math.abs(angle) / Math.PI)]
    }
  },
  {
    id: 'flag',
    label: 'Flag',
    transform: (width, height, strength) => ([x, y]) => {
      const s = strength * height * 0.35
      return [
        x,
        y + s * Math.sin((x / width) * Math.PI * 1.5) * (y / height)
      ]
    }
  },
  {
    id: 'perspective-left',
    label: 'Perspective',
    transform: (width, height, strength) => ([x, y]) => {
      const s = strength * 0.5
      const scale = 1 - s * (1 - x / width)
      const midY = height / 2
      return [x, midY + (y - midY) * scale]
    }
  },
  {
    id: 'arch-steep',
    label: 'Arch Steep',
    transform: (width, height, strength) => ([x, y]) => {
      const s = strength * height * 1.0
      return [x, y - s * Math.sin((x / width) * Math.PI)]
    }
  },
  {
    id: 'diamond',
    label: 'Diamond',
    transform: (width, height, strength) => ([x, y]) => {
      const s = strength * height * 0.5
      const nx = (x / width - 0.5) * 2
      const ny = (y / height - 0.5) * 2
      return [
        x + s * ny * nx,
        y + s * nx * nx * Math.sign(ny)
      ]
    }
  },
  {
    id: 'pinch-top',
    label: 'Pinch Top',
    transform: (width, height, strength) => ([x, y]) => {
      const s = strength * 0.6
      const yRatio = y / height
      const nx = x / width - 0.5
      return [
        x + s * width * nx * (1 - yRatio) * 0.5,
        y
      ]
    }
  },
  {
    id: 'pinch-bottom',
    label: 'Pinch Bottom',
    transform: (width, height, strength) => ([x, y]) => {
      const s = strength * 0.6
      const yRatio = y / height
      const nx = x / width - 0.5
      return [
        x + s * width * nx * yRatio * 0.5,
        y
      ]
    }
  },
  {
    id: 'bulge-horizontal',
    label: 'Bulge Horizontal',
    transform: (width, height, strength) => ([x, y]) => {
      const s = strength * height * 0.4
      const nx = (x / width - 0.5) * 2
      return [
        x,
        y + s * (1 - nx * nx) * Math.sign(y - height / 2) * 0.5
      ]
    }
  },
  {
    id: 'lens',
    label: 'Lens',
    transform: (width, height, strength) => ([x, y]) => {
      const s = strength * height * 0.5
      const nx = (x / width - 0.5) * 2
      const curve = 1 - nx * nx
      const midY = height / 2
      return [x, midY + (y - midY) * (1 + s / height * curve)]
    }
  },
  {
    id: 'circle',
    label: 'Circle',
    transform: (width, height, strength) => ([x, y]) => {
      const s = Math.max(strength, 0.01)
      const radius = width / (2 * Math.PI) * (2 - s * 0.5)
      const angle = (x / width - 0.5) * Math.PI * 2 * s
      const yOffset = y - height / 2
      return [
        width / 2 + (radius + yOffset) * Math.sin(angle),
        height / 2 - (radius + yOffset) * Math.cos(angle) + radius
      ]
    }
  }
]

export async function applyWarpToText(
  canvas,
  fabricTextObj,
  warpId,
  strength,
  saveState
) {
  if (warpId === 'straight') {
    const source = fabricTextObj._warpSource
    if (source) {
      const restored = new fabric.IText(source.text, {
        left: source.left,
        top: source.top,
        fontFamily: source.fontFamily,
        fontSize: source.fontSize,
        fill: source.fill,
        fontWeight: source.fontWeight || 'normal',
        fontStyle: source.fontStyle || 'normal',
        originX: 'center',
        originY: 'center',
      })
      canvas.remove(fabricTextObj)
      canvas.add(restored)
      canvas.setActiveObject(restored)
      canvas.renderAll()
      saveState(canvas)
    }
    return
  }

  const isWarpedPath = fabricTextObj._isWarpedText === true
  const source = isWarpedPath
    ? fabricTextObj._warpSource
    : {
        text: fabricTextObj.text,
        fontFamily: fabricTextObj.fontFamily,
        fontSize: fabricTextObj.fontSize,
        fill: fabricTextObj.fill,
        fontWeight: fabricTextObj.fontWeight || 'normal',
        fontStyle: fabricTextObj.fontStyle || 'normal',
        left: fabricTextObj.left,
        top: fabricTextObj.top,
      }

  if (!source.text || source.text.trim() === '') {
    throw new Error('Please add some text before applying effects.')
  }

  const fontPath = FONT_FILE_MAP[source.fontFamily]
    || FONT_FILE_MAP['Montserrat']
  
  let opentypeFont
  try {
    opentypeFont = await loadOpentypeFont(fontPath)
  } catch (err) {
    throw new Error('Could not load font. Try selecting a different font first.')
  }

  const opPath = opentypeFont.getPath(
    source.text, 0, source.fontSize, source.fontSize
  )
  const bbox = opPath.getBoundingBox()
  const pathWidth = Math.max(bbox.x2 - bbox.x1, 1)
  const pathHeight = Math.max(bbox.y2 - bbox.y1, 1)
  const svgPathStr = opPath.toPathData(2)

  const svgNS = 'http://www.w3.org/2000/svg'
  const svgEl = document.createElementNS(svgNS, 'svg')
  svgEl.setAttribute('width', pathWidth)
  svgEl.setAttribute('height', pathHeight)
  svgEl.style.cssText = 'position:absolute;left:-9999px;top:-9999px;'
  const pathEl = document.createElementNS(svgNS, 'path')
  pathEl.setAttribute('d', svgPathStr)
  svgEl.appendChild(pathEl)
  document.body.appendChild(svgEl)

  const preset = WARP_PRESETS.find(p => p.id === warpId)
  if (!preset) {
    document.body.removeChild(svgEl)
    throw new Error('Unknown warp effect: ' + warpId)
  }
  const warpInstance = new Warp(svgEl)
  warpInstance.interpolate(4)
  const transformFn = preset.transform(pathWidth, pathHeight, strength)
  warpInstance.transform(transformFn)

  const warpedPathData = pathEl.getAttribute('d')
  document.body.removeChild(svgEl)

  const fabricPath = new fabric.Path(warpedPathData, {
    fill: source.fill,
    left: source.left || canvas.width / 2,
    top: source.top || canvas.height / 2,
    originX: 'center',
    originY: 'center',
    selectable: true,
    evented: true,
  })

  fabricPath._isWarpedText = true
  fabricPath._warpSource = {
    text: source.text,
    fontFamily: source.fontFamily,
    fontSize: source.fontSize,
    fill: source.fill,
    fontWeight: source.fontWeight,
    fontStyle: source.fontStyle,
    left: source.left,
    top: source.top,
    warpId,
    strength,
  }

  canvas.remove(fabricTextObj)
  canvas.add(fabricPath)
  canvas.setActiveObject(fabricPath)
  canvas.renderAll()
  saveState(canvas)
}

export { WARP_PRESETS, FONT_FILE_MAP }