export const TEXT_EFFECT_PRESETS = [
  {
    id: 'outline-only',
    label: 'Outline',
    styles: {
      fill: 'transparent',
      stroke: '#222222',
      strokeWidth: 2,
      paintFirst: 'stroke',
      shadow: null
    }
  },
  {
    id: 'gold-script',
    label: 'Gold',
    styles: {
      fill: {
        type: 'linear',
        coords: { x1: 0, y1: 0, x2: 0, y2: 80 },
        colorStops: [
          { offset: 0, color: '#FFD700' },
          { offset: 0.5, color: '#FFA500' },
          { offset: 1, color: '#FFD700' }
        ]
      },
      stroke: '#4a2800',
      strokeWidth: 6,
      paintFirst: 'stroke',
      shadow: '2px 2px 3px rgba(0,0,0,0.4)'
    }
  },
  {
    id: 'yellow-black',
    label: 'Bold',
    styles: {
      fill: '#FFD700',
      stroke: '#000000',
      strokeWidth: 12,
      paintFirst: 'stroke',
      shadow: null
    }
  },
  {
    id: 'blue-flat',
    label: 'Flat',
    styles: {
      fill: '#5BB8F5',
      stroke: null,
      strokeWidth: 0,
      shadow: null
    }
  },
  {
    id: 'yellow-3d',
    label: '3D Block',
    styles: {
      fill: '#FFD700',
      stroke: '#1565C0',
      strokeWidth: 10,
      paintFirst: 'stroke',
      shadow: {
        color: '#0D3B7A',
        blur: 0,
        offsetX: 6,
        offsetY: 6
      }
    }
  },
  {
    id: 'pink-outline',
    label: 'Pink',
    styles: {
      fill: 'transparent',
      stroke: '#E91E8C',
      strokeWidth: 1.5,
      paintFirst: 'stroke',
      shadow: null
    }
  },
  {
    id: 'green-bubble',
    label: 'Bubble',
    styles: {
      fill: {
        type: 'linear',
        coords: { x1: 0, y1: 0, x2: 0, y2: 80 },
        colorStops: [
          { offset: 0, color: '#8BC34A' },
          { offset: 0.5, color: '#4CAF50' },
          { offset: 1, color: '#2E7D32' }
        ]
      },
      stroke: '#1B5E20',
      strokeWidth: 8,
      paintFirst: 'stroke',
      shadow: {
        color: '#1B5E20',
        blur: 0,
        offsetX: 5,
        offsetY: 5
      }
    }
  }
]

export function applyTextEffect(fabricTextObject, preset, canvas) {
  if (!fabricTextObject || !preset) return

  const { styles } = preset

  if (styles.fill && typeof styles.fill === 'object') {
    const gradient = new fabric.Gradient({
      type: styles.fill.type,
      gradientUnits: 'pixels',
      coords: styles.fill.coords,
      colorStops: styles.fill.colorStops
    })
    fabricTextObject.set('fill', gradient)
  } else {
    fabricTextObject.set('fill', styles.fill)
  }

  fabricTextObject.set({
    stroke: styles.stroke || null,
    strokeWidth: styles.strokeWidth || 0,
    paintFirst: styles.paintFirst || 'fill'
  })

  if (styles.shadow) {
    fabricTextObject.set('shadow', new fabric.Shadow(styles.shadow))
  } else {
    fabricTextObject.set('shadow', null)
  }

  if (canvas) {
    canvas.renderAll()
  }
}