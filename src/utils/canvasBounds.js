export function constrainToBounds(canvas) {
  canvas.on('object:moving', (e) => {
    const obj = e.target
    const bound = obj.getBoundingRect(true)

    if (bound.left < 0) obj.left -= bound.left
    if (bound.top < 0) obj.top -= bound.top
    if (bound.left + bound.width > canvas.width)
      obj.left = canvas.width - bound.width + (obj.left - bound.left)
    if (bound.top + bound.height > canvas.height)
      obj.top = canvas.height - bound.height + (obj.top - bound.top)
  })

  canvas.on('object:scaling', (e) => {
    const obj = e.target
    const bound = obj.getBoundingRect(true)

    if (
      bound.left < 0 ||
      bound.top < 0 ||
      bound.left + bound.width > canvas.width ||
      bound.top + bound.height > canvas.height
    ) {
      obj.left = obj._lastGoodLeft ?? obj.left
      obj.top = obj._lastGoodTop ?? obj.top
      obj.scaleX = obj._lastGoodScaleX ?? obj.scaleX
      obj.scaleY = obj._lastGoodScaleY ?? obj.scaleY
      obj.setCoords()
    } else {
      obj._lastGoodLeft = obj.left
      obj._lastGoodTop = obj.top
      obj._lastGoodScaleX = obj.scaleX
      obj._lastGoodScaleY = obj.scaleY
    }
  })

  canvas.on('object:modified', (e) => {
    const obj = e.target
    obj._lastGoodLeft = obj.left
    obj._lastGoodTop = obj.top
    obj._lastGoodScaleX = obj.scaleX
    obj._lastGoodScaleY = obj.scaleY
  })
}
