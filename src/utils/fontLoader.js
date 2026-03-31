export const FONT_LIST = [
  'Playfair Display', 'Great Vibes', 'Montserrat', 'Bebas Neue', 'Pacifico',
  'Dancing Script', 'Oswald', 'Lobster', 'Raleway', 'Cinzel',
  'Sacramento', 'Abril Fatface', 'Josefin Sans', 'Satisfy', 'Righteous',
  'Kaushan Script', 'Permanent Marker', 'Rock Salt', 'Pinyon Script', 'Allura'
]

const loadedFonts = new Set()

export function loadFont(fontName) {
  if (loadedFonts.has(fontName)) return Promise.resolve()

  return new Promise((resolve) => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/ /g, '+')}:wght@400;700&display=swap`
    link.onload = () => {
      loadedFonts.add(fontName)
      resolve()
    }
    link.onerror = () => {
      // Resolve anyway so callers aren't blocked by network failures
      loadedFonts.add(fontName)
      resolve()
    }
    document.head.appendChild(link)
  })
}

export function preloadAllFonts() {
  FONT_LIST.forEach((font) => loadFont(font))
}
