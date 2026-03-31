import { useState } from 'react'
import MainToolMenu from './MainToolMenu'
import ImageUploadPanel from './ImageUploadPanel'
import TextEditorPanel from './TextEditorPanel'

export default function LeftPanel({ 
    view, 
    onViewChange, 
    canvas, 
    saveState, 
    selectedText,
    selectedImage 
}) {
  const [imageSelected, setImageSelected] = useState(false)

  function handleSelectTool(tool) {
    if (tool === 'text') {
      // Add text to canvas
      if (canvas) {
        const { fabric } = window
        const text = new fabric.IText('Your Text', {
          left: canvas.width / 2 - 50,
          top: canvas.height / 2,
          fontFamily: 'Arial',
          fontSize: 36,
          fill: '#000000'
        })
        canvas.add(text)
        canvas.setActiveObject(text)
        canvas.renderAll()
        saveState?.(canvas)
      }
      onViewChange('text')
    } else if (tool === 'upload') {
      onViewChange('upload')
    }
  }

  function handleBack() {
    setImageSelected(false)
    onViewChange('menu')
  }

  function handleImageSelect() {
    setImageSelected(true)
  }

  const renderContent = () => {
    switch (view) {
      case 'upload':
        return (
          <ImageUploadPanel 
            canvas={canvas} 
            saveState={saveState} 
            onBack={handleBack}
          />
        )
      case 'text':
        return (
          <TextEditorPanel 
            canvas={canvas} 
            selectedText={selectedText}
            onBack={handleBack}
            saveState={saveState}
          />
        )
      default:
        return (
          <MainToolMenu onSelectTool={handleSelectTool} />
        )
    }
  }

  return (
    <aside className="left-panel">
      {renderContent()}
    </aside>
  )
}