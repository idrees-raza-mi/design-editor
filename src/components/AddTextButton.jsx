import { fabric } from 'fabric'
import { loadFont } from '../utils/fontLoader'
import { usePermissions } from '../context/PermissionsContext'
import LockedControl from './LockedControl'

export default function AddTextButton({ canvas, saveState }) {
  const { text } = usePermissions()
  const isDisabled = !text.enabled || !text.allow_add

  async function handleClick() {
    if (!canvas || isDisabled) return
    await loadFont('Montserrat')
    const textObj = new fabric.IText('Your Text Here', {
      left: canvas.width / 2,
      top: canvas.height / 2,
      fontFamily: 'Montserrat',
      fontSize: 36,
      fill: '#000000',
      originX: 'center',
      originY: 'center',
      editable: true
    })
    canvas.add(textObj)
    canvas.setActiveObject(textObj)
    textObj.enterEditing()
    textObj.selectAll()
    canvas.renderAll()
    saveState(canvas)
  }

  return (
    <div className="add-text-section">
      <LockedControl
        locked={isDisabled}
        tooltip="Text not available for this template"
      >
        <button
          className="add-text-btn"
          onClick={handleClick}
          disabled={!canvas}
        >
          + Add Text
        </button>
      </LockedControl>
    </div>
  )
}
