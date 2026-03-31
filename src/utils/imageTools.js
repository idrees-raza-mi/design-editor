import { fabric } from 'fabric'

export function applyFilter(canvas, fabricImage, filterName) {
  fabricImage.filters = []
  switch (filterName) {
    case 'grayscale':
      fabricImage.filters.push(new fabric.Image.filters.Grayscale())
      break
    case 'sepia':
      fabricImage.filters.push(new fabric.Image.filters.Sepia())
      break
    case 'invert':
      fabricImage.filters.push(new fabric.Image.filters.Invert())
      break
    case 'brightness':
      fabricImage.filters.push(new fabric.Image.filters.Brightness({ brightness: 0.15 }))
      break
    case 'contrast':
      fabricImage.filters.push(new fabric.Image.filters.Contrast({ contrast: 0.15 }))
      break
    case 'none':
    default:
      break
  }
  fabricImage.applyFilters()
  canvas.renderAll()
}

export async function removeBackground(canvas, fabricImage, onStart, onDone, onError) {
  try {
    onStart()
    const src = fabricImage.getSrc()

    // Fetch src as blob regardless of whether it is a blob URL or data URL
    const response = await fetch(src)
    const inputBlob = await response.blob()

    // Dynamic import via CDN keeps WASM models out of the main IIFE bundle.
    // /* @vite-ignore */ prevents Vite from trying to bundle this at build time.
    const { removeBackground: removeBg } = await import(
      /* @vite-ignore */
      'https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.7.0/dist/browser/index.mjs'
    )
    const resultBlob = await removeBg(inputBlob)

    const newUrl = URL.createObjectURL(resultBlob)
    fabricImage.setSrc(
      newUrl,
      () => {
        canvas.renderAll()
        onDone()
      },
      { crossOrigin: 'anonymous' }
    )
  } catch (err) {
    onError(err)
  }
}

export function setOpacity(canvas, fabricImage, value) {
  fabricImage.set('opacity', value / 100)
  canvas.renderAll()
}

export function isLowResolution(fabricImage) {
  const el = fabricImage.getElement()
  return el.naturalWidth < 800 || el.naturalHeight < 800
}
