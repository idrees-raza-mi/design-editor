export function getProxyBase() {
  if (typeof window === 'undefined') return ''
  if (window.location.hostname === 'localhost') return 'http://localhost:3000/editor/api/shopify'
  return '/editor/api/shopify'
}

export async function callShopifyProxy(action, data) {
  const url = getProxyBase()
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, data })
  })
  const text = await response.text()
  if (!text) {
    throw new Error(`Proxy returned empty response (HTTP ${response.status}) for ${url}`)
  }
  let json
  try {
    json = JSON.parse(text)
  } catch {
    throw new Error(`Proxy returned non-JSON (HTTP ${response.status}): ${text.slice(0, 200)}`)
  }
  if (!response.ok || (json && json.error)) {
    throw new Error((json && json.error) || 'Proxy request failed')
  }
  if (json === null) {
    throw new Error('Design not found in Shopify — check the metaobject ID and Admin token permissions')
  }
  return json
}
