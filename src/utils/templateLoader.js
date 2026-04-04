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

        // The admin tool always exports text positions as the visual centre
        // point but writes originX:'left'. Correct this so text renders
        // centred as designed, regardless of what the JSON says.
        const TEXT_TYPES = ['text', 'i-text']
        if (TEXT_TYPES.includes(fabricObject.type)) {
          fabricObject.set({ originX: 'center' })
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
