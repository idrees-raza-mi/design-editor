export function getConfig() {
  const raw = window.__EDITOR_CONFIG__

  if (!raw) {
    throw new Error(
      '[DesignEditor] window.__EDITOR_CONFIG__ is not set. ' +
      'Shopify must set this before loading editor.js.'
    )
  }

  if (!raw.designId) throw new Error('[DesignEditor] __EDITOR_CONFIG__.designId is required')
  if (!raw.designType) throw new Error('[DesignEditor] __EDITOR_CONFIG__.designType is required')

  return {
    designId: raw.designId,
    designType: raw.designType,
    variantId: raw.variantId ?? null,
    productTitle: raw.productTitle ?? ''
  }
}
