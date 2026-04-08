import { useState, useEffect } from 'react'
import { getConfig } from '../config/editorConfig'
import { fetchCanvasDesign, fetchTemplateDesign, fetchProductDesign } from '../services/shopifyStorefront'

export function useDesignLoader() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [design, setDesign] = useState(null)
  const [designType, setDesignType] = useState(null)

  function loadDesign() {
    setLoading(true)
    setError(null)

    Promise.resolve()
      .then(async () => {
        const { designId, designType, productHandle } = getConfig()

        // NEW flow — product metafield
        if (productHandle) {
          const design = await fetchProductDesign(productHandle)
          setDesign(design)
          setDesignType(design.designType)
          setLoading(false)
          return
        }

        // OLD flow — metaobject GID (backwards compatible)
        if (designId) {
          if (designType === 'canvas') {
            const design = await fetchCanvasDesign(designId)
            setDesign(design)
            setDesignType('canvas')
          } else {
            const design = await fetchTemplateDesign(designId)
            setDesign(design)
            setDesignType('template')
          }
          setLoading(false)
          return
        }

        setError('No product or design ID found in editor config.')
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }

  useEffect(() => {
    loadDesign()
  }, [])

  return { design, designType, loading, error, retry: loadDesign }
}
