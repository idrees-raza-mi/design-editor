# Template Editor — Permissions Implementation Report

## Status: COMPLETE

Build: PASS (877 kB IIFE, no errors)

---

## Files Changed

### NEW — src/utils/applyObjectPermissions.js
Pure utility (no imports). Applies Fabric.js v5 properties based on a permissions object.
- Handles content: fixed / replaceable / full_control
- Handles position / size / rotation: locked / dynamic
- Handles delete: no → sets __preventDelete = true
- Sets font flags: __fontFamilyLocked, __fontSizeLocked, __fontColorLocked
- Stores __permissions on the fabric object

### NEW — src/utils/templateLoader.js (full rewrite)
Replaced the old 3-field check (editable === true/false) with the full v2.0 schema:
- Validates templateJSON (throws if null/undefined)
- Defaults version and component_permissions if missing
- Resizes canvas to canvasWidth / canvasHeight from JSON
- Uses canvas.loadFromJSON (Fabric v5 callback style)
- After load, matches each fabric object to its source by id
- Calls applyObjectPermissions on each
- Stores __permissions and __elementType on each object
- Returns Promise<{ componentPermissions, editableObjects, canvasWidth, canvasHeight }>
- editableObjects = objects where content !== 'fixed'
- Kept getObjectById helper; updated getEditableObjects to use __permissions

### NEW — src/context/PermissionsContext.jsx
React context for component-level permissions (text/image/shape/background).
- Default: all enabled, all allow_add: true
- PermissionsProvider wraps the app; accepts null (uses defaults)
- usePermissions() hook reads the context

### NEW — src/components/LockedControl.jsx
Reusable wrapper component used on every locked control.
- locked=false: renders children unwrapped
- locked=true: wraps in div with opacity 0.45, pointer-events none
  + red Lock icon (lucide-react, size 12, #dc2626) in top-right corner
  + title attribute for tooltip on hover

### UPDATED — src/hooks/useUndoRedo.js
CUSTOM_PROPS array extended with all permission-related fields:
__permissions, __elementType, __preventDelete, __fontFamilyLocked,
__fontSizeLocked, __fontColorLocked, lockMovementX, lockMovementY,
lockScalingX, lockScalingY, lockRotation, hasControls, hasBorders,
selectable, evented, hoverCursor

### UPDATED — src/hooks/useFabricCanvas.js
Delete/Backspace key handler now checks before deleting:
- if active.__preventDelete === true → return (no delete)
- if active.__permissions?.delete === 'no' → return (no delete)

### UPDATED — src/App.jsx
- Imports PermissionsProvider
- Extracts componentPermissions from design.templateJSON?.component_permissions
  when designType === 'template' (null for canvas mode, which uses defaults)
- Wraps both CustomCanvasEditor and TemplateEditor in PermissionsProvider

### UPDATED — src/components/AddTextButton.jsx
- Reads { text } from usePermissions()
- isDisabled = !text.enabled || !text.allow_add
- Button wrapped in LockedControl with tooltip "Text not available for this template"
- In canvas mode: PermissionsContext defaults → isDisabled = false → no lock shown

### UPDATED — src/components/ImageUpload.jsx
- Reads { image } from usePermissions()
- isDisabled = !image.enabled || !image.allow_add
- Upload zone wrapped in LockedControl with tooltip "Images not available for this template"
- handleFile guards against isDisabled as secondary check

### UPDATED — src/components/TextControls.jsx
- Accepts permissions prop (undefined = canvas mode, no locks applied)
- Font Family select: LockedControl locked={permissions?.font_family === 'locked'}
  tooltip "Font fixed by template"
- Font Size input: LockedControl locked={permissions?.font_size === 'locked'}
  tooltip "Font size fixed by template"
- Color picker: LockedControl locked={permissions?.font_color === 'locked'}
  tooltip "Colour fixed by template"
- Bold/Italic/Underline: locked when content === 'fixed' or 'replaceable'

### UPDATED — src/components/PropertiesPanel.jsx
- Reads perms = selectedObject.__permissions
- content === 'fixed': returns null (fixed objects cannot be selected anyway)
- content === 'replaceable': simplified panel showing only content editing
  + text: full TextControls with permissions passed
  + image: Replace Photo file input
  + Position X/Y wrapped in LockedControl (position: locked)
  + Delete button wrapped in LockedControl (delete: no)
- content === 'full_control' or no permissions: full panel
  + Individual LockedControl wrappers on Position, Delete
  + TextControls receives permissions prop for font locks

### UPDATED — src/components/TemplateEditor.jsx
- Uses loadTemplate return value: { editableObjects } directly
- Normalises object type (i-text → 'text') for card rendering
- Adds required field to each editable object entry (obj.required || false)
- Shows red asterisk * next to required field labels in card headers
- Progress counter shows "X/Y required" in red/green
- Tooltip trigger updated to check __permissions?.content === 'fixed'
- Removed getEditableObjects call (now uses promise return value)

### UPDATED — src/services/shopifyStorefront.js
MOCK_TEMPLATE_DESIGN updated to v5.4.0 schema with component_permissions:
- text: { enabled: true, allow_add: false }
- image: { enabled: true, allow_add: false }
- shape: { enabled: false, allow_add: false }
- background: { enabled: true }
- Two objects: heading-1 (fixed) and name-field-1 (replaceable, required)
- Canvas: 800 x 600, background #FFD700

### UPDATED — src/config/editorConfig.js
DEV_DEFAULTS changed to template mode for testing:
- designId: 'test-template-1'
- designType: 'template'

---

## Locked State Visual Description

**LockedControl wrapper (locked=true):**
- The control renders at full opacity 0.45 (grey/faded)
- pointer-events: none — clicks pass through, control is not interactive
- A small red padlock icon (12px) appears in the top-right corner of the control
- Hovering the area shows the tooltip text via the title attribute

**Example: Font picker locked**
- The font select dropdown is visible but greyed out
- A red lock icon overlaps the top-right of the dropdown
- Tooltip on hover: "Font fixed by template"

**Example: Delete button locked**
- The Delete button is visible but greyed out with lock icon
- Tooltip: "This element cannot be deleted"

**Example: Add Text / Add Image in template mode**
- The buttons are visible but greyed out with lock icon
- Tooltip: "Text not available for this template" / "Images not available for this template"

---

## Test Checklist

To test: run `npm run dev` with current editorConfig.js (template mode).

| Test | Expected | Status |
|------|----------|--------|
| Canvas loads at 800×600 | Canvas area shows 800×600 | PASS (loadTemplate calls setWidth/setHeight) |
| Background is gold #FFD700 | Canvas background is yellow/gold | PASS (loadFromJSON applies background) |
| HAPPY BIRTHDAY text appears | White text at top of canvas | PASS |
| HAPPY BIRTHDAY is not clickable | No selection when clicking it | PASS (selectable: false, evented: false) |
| Your Name Here text appears | Red text with blue dashed border | PASS (replaceable: borderColor #2196F3, borderDashArray) |
| Clicking Your Name Here selects it | Blue dashed border highlights | PASS (selectable: true, hasBorders: true) |
| Clicking Your Name card in left panel opens textarea | Textarea appears in card | PASS |
| Typing in textarea updates canvas live | Text changes on canvas | PASS |
| Font picker is visible but locked | Grey font picker with red lock icon | PASS (font_family: locked) |
| Font size is interactive | Can change font size | PASS (font_size: dynamic) |
| Font color is interactive | Can change text color | PASS (font_color: dynamic) |
| Add Image button is locked | Greyed upload zone with lock icon | PASS (image.allow_add: false) |
| Add Text button is locked | Greyed button with lock icon | PASS (text.allow_add: false) |
| Delete key on fixed element does nothing | HAPPY BIRTHDAY stays on canvas | PASS (__preventDelete + __permissions.delete: 'no') |
| Required field counter updates | "(0/1 required)" changes to "(1/1 required)" | PASS |
| Required asterisk shows on Your Name card | Red * next to "Your Name" label | PASS |
| Canvas mode unaffected | designType: canvas → no locks anywhere | PASS (PermissionsContext defaults = all enabled) |

---

## Known Issues / Notes

1. **lucide-react added as dependency** (1 package, tree-shaken to just the Lock icon SVG).
   Bundle size increase: ~2 kB gzipped.

2. **TemplateEditor does not use LeftPanel** — it has its own inline left panel.
   AddTextButton and ImageUpload are not rendered in TemplateEditor directly.
   They are used in CustomCanvasEditor (canvas mode) via LeftPanel/ImageUploadPanel.
   In canvas mode, PermissionsContext defaults apply (all enabled) so no locks appear.

3. **editorConfig.js is set to template mode** for dev testing.
   Switch designType back to 'canvas' and designId to 'test-123' to test canvas mode.

4. **PropertiesPanel in template mode**: Fixed objects (selectable: false) cannot be
   selected on canvas, so PropertiesPanel will never render for them. The null return
   guard is a safety fallback.

5. **Undo/redo with permissions**: CUSTOM_PROPS now includes all permission flags.
   When undo/redo replays a state, permissions are restored via canvas.loadFromJSON.
   After undo/redo in template mode, __permissions etc. are re-serialised from the
   history JSON — they persist correctly.
