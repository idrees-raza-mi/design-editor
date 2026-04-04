import { applyObjectPermissions } from './applyObjectPermissions'

const DEFAULT_COMPONENT_PERMISSIONS = {
  text:       { enabled: true, allow_add: true },
  image:      { enabled: true, allow_add: true },
  shape:      { enabled: true, allow_add: true },
  background: { enabled: true }
}

export function loadTemplate(canvas, templateJSON) {
  if (templateJSON == null) {
    return Promise.reject(new Error('templateJSON is null or undefined'))
  }

  if (!templateJSON.version) {
    templateJSON = { ...templateJSON, version: '5.3.0' }
  }

  if (!templateJSON.component_permissions) {
    templateJSON = {
      ...templateJSON,
      component_permissions: { ...DEFAULT_COMPONENT_PERMISSIONS }
    }
  }

  const targetWidth = templateJSON.canvasWidth || 800
  const targetHeight = templateJSON.canvasHeight || 600

  canvas.setWidth(targetWidth)
  canvas.setHeight(targetHeight)

  const sourceObjects = Array.isArray(templateJSON.objects) ? templateJSON.objects : []

  return new Promise((resolve) => {
    canvas.loadFromJSON(templateJSON, () => {
      canvas.getObjects().forEach((fabricObject) => {
        const sourceObj = sourceObjects.find((o) => o.id === fabricObject.id)
        const permissions = sourceObj?.permissions || null

        // The admin tool always exports positions as the visual centre point
        // but writes originX:'left', originY:'top'. Correct both axes so
        // every object renders where the admin designed it.
        //   - text/i-text:  centre horizontally, top-anchored vertically
        //   - image/shapes: centre on both axes
        const TEXT_TYPES = ['text', 'i-text']
        const SHAPE_TYPES = ['rect', 'circle', 'triangle', 'ellipse', 'polygon', 'polyline', 'path', 'line', 'group']
        if (TEXT_TYPES.includes(fabricObject.type)) {
          fabricObject.set({ originX: 'center' })
        } else if (fabricObject.type === 'image' || SHAPE_TYPES.includes(fabricObject.type)) {
          fabricObject.set({ originX: 'center', originY: 'center' })
        }

        if (permissions) {
          applyObjectPermissions(fabricObject, permissions)
        }

        fabricObject.__permissions = permissions
        fabricObject.__elementType = sourceObj?.element_type || null

        // Sync Fabric's internal coordinate cache after mutating properties
        fabricObject.setCoords()
      })

      canvas.renderAll()

      const editableObjects = canvas.getObjects().filter(
        (o) => o.__permissions?.content !== 'fixed'
      )

      resolve({
        componentPermissions: templateJSON.component_permissions,
        editableObjects,
        canvasWidth: targetWidth,
        canvasHeight: targetHeight
      })
    })
  })
}

export function getEditableObjects(canvas) {
  return canvas.getObjects().filter(
    (obj) => obj.__permissions?.content !== 'fixed'
  )
}

export function getObjectById(canvas, id) {
  return canvas.getObjects().find((obj) => obj.id === id) || null
}
