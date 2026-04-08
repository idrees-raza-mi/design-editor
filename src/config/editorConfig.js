export function getConfig() {
  const raw = window.__EDITOR_CONFIG__

  if (!raw) {
    throw new Error(
      '[DesignEditor] window.__EDITOR_CONFIG__ is not set. ' +
      'Shopify must set this before loading editor.js.'
    )
  }

  const productHandle = raw.productHandle || null

  if (!productHandle && !raw.designId) {
    throw new Error('[DesignEditor] __EDITOR_CONFIG__ requires either productHandle or designId')
  }
  if (!productHandle && !raw.designType) {
    throw new Error('[DesignEditor] __EDITOR_CONFIG__.designType is required when using designId')
  }

  return {
    designId: raw.designId || null,
    designType: raw.designType || null,
    variantId: raw.variantId ?? null,
    productTitle: raw.productTitle ?? '',
    productHandle,
  }
}
