export function applyObjectPermissions(fabricObject, permissions) {
  if (!permissions) return

  // --- CONTENT ---
  if (permissions.content === 'fixed') {
    fabricObject.selectable = false
    fabricObject.evented = false
    fabricObject.hasControls = false
    fabricObject.hasBorders = false
    fabricObject.lockMovementX = true
    fabricObject.lockMovementY = true
    fabricObject.lockScalingX = true
    fabricObject.lockScalingY = true
    fabricObject.lockRotation = true
    fabricObject.hoverCursor = 'default'
  } else if (permissions.content === 'replaceable') {
    fabricObject.selectable = true
    fabricObject.evented = true
    fabricObject.hasControls = false
    fabricObject.hasBorders = true
    fabricObject.lockMovementX = true
    fabricObject.lockMovementY = true
    fabricObject.lockScalingX = true
    fabricObject.lockScalingY = true
    fabricObject.lockRotation = true
    fabricObject.hoverCursor = 'pointer'
    fabricObject.set({
      borderColor: '#2196F3',
      borderDashArray: [6, 4],
      cornerColor: '#2196F3'
    })
  } else if (permissions.content === 'full_control') {
    fabricObject.selectable = true
    fabricObject.evented = true
    fabricObject.hasControls = true
    fabricObject.hasBorders = true
    fabricObject.hoverCursor = 'move'
    // fall through to apply position / size / rotation below
  }

  // --- POSITION (only applied if content !== 'fixed') ---
  if (permissions.content !== 'fixed') {
    if (permissions.position === 'locked') {
      fabricObject.lockMovementX = true
      fabricObject.lockMovementY = true
    } else if (permissions.position === 'dynamic') {
      fabricObject.lockMovementX = false
      fabricObject.lockMovementY = false
    }
  }

  // --- SIZE (only applied if content !== 'fixed') ---
  if (permissions.content !== 'fixed') {
    if (permissions.size === 'locked') {
      fabricObject.lockScalingX = true
      fabricObject.lockScalingY = true
    } else if (permissions.size === 'dynamic') {
      fabricObject.lockScalingX = false
      fabricObject.lockScalingY = false
    }
  }

  // --- ROTATION (only applied if content !== 'fixed') ---
  if (permissions.content !== 'fixed') {
    if (permissions.rotation === 'locked') {
      fabricObject.lockRotation = true
    } else if (permissions.rotation === 'dynamic') {
      fabricObject.lockRotation = false
    }
  }

  // --- DELETE ---
  if (permissions.delete === 'no') {
    fabricObject.__preventDelete = true
  }

  // --- FONT FLAGS (text elements only) ---
  if (permissions.font_family === 'locked') {
    fabricObject.__fontFamilyLocked = true
  }
  if (permissions.font_size === 'locked') {
    fabricObject.__fontSizeLocked = true
  }
  if (permissions.font_color === 'locked') {
    fabricObject.__fontColorLocked = true
  }

  // Store permissions on the object
  fabricObject.__permissions = permissions
}
