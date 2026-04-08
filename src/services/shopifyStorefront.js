import { callShopifyProxy } from '../utils/apiClient'

async function storefrontFetch(query, variables = {}) {
  const store = import.meta.env.VITE_SHOPIFY_STORE
  const token = import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN
  if (!store || !token) {
    throw new Error('Missing VITE_SHOPIFY_STORE or VITE_SHOPIFY_STOREFRONT_TOKEN env vars')
  }
  const response = await fetch(`https://${store}/api/2024-01/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': token
    },
    body: JSON.stringify({ query, variables })
  })
  const json = await response.json()
  if (json.errors) {
    throw new Error(json.errors[0].message)
  }
  return json.data
}

const MOCK_TEMPLATE_DESIGN = {
  templateJSON: {
    canvasWidth: 800,
    canvasHeight: 600,
    background: '#FFD700',
    objects: []
  }
}

function fieldsToObject(fields) {
  return fields.reduce((acc, f) => {
    acc[f.key] = f.value
    return acc
  }, {})
}

export async function fetchCanvasDesign(id) {
  const obj = await callShopifyProxy('getMetaobject', { id })
  const fields = fieldsToObject(obj.fields)
  return {
    name: fields.name,
    canvasWidth: parseInt(fields.canvas_width) || 500,
    canvasHeight: parseInt(fields.canvas_height) || 600,
    svgClipPath: fields.svg_clip_path || null,
    backgroundColor: fields.background_color || '#ffffff',
    sizeLabel: fields.size_label || '',
    category: fields.category || '',
    availableSizes: fields.available_sizes ? JSON.parse(fields.available_sizes) : [],
    printProfile: fields.print_profile || '',
    description: fields.description || ''
  }
}

export async function fetchTemplateDesign(id) {
  const obj = await callShopifyProxy('getMetaobject', { id })
  const fields = fieldsToObject(obj.fields)
  return {
    name: fields.name,
    canvasWidth: parseInt(fields.canvas_width) || 500,
    canvasHeight: parseInt(fields.canvas_height) || 600,
    svgClipPath: fields.svg_clip_path || null,
    templateJSON: fields.template_json ? JSON.parse(fields.template_json) : null,
    editableFields: fields.editable_fields ? JSON.parse(fields.editable_fields) : [],
    category: fields.category || '',
    availableSizes: fields.available_sizes ? JSON.parse(fields.available_sizes) : [],
    printProfile: fields.print_profile || '',
    description: fields.description || ''
  }
}

export async function fetchProductDesign(productHandle) {

  // If no product handle, fail
  if (!productHandle) {
    throw new Error('No product handle provided');
  }

  // Dev mock from hardcoded test product
  if (productHandle === 'test-product' || productHandle.startsWith('test-')) {
    return {
      name: 'Test Template Product',
      canvasWidth: 800,
      canvasHeight: 600,
      svgClipPath: null,
      backgroundColor: '#FFD700',
      designType: 'template',
      templateJSON: MOCK_TEMPLATE_DESIGN.templateJSON,
      editableFields: ['Your Name', 'Photo'],
      availableSizes: [],
      productHandle,
      productId: 'gid://shopify/Product/test'
    }
  }

  const PRODUCT_QUERY = `
    query fetchProductDesign($handle: String!) {
      product(handle: $handle) {
        id
        title
        handle
        templateJson: metafield(
          namespace: "custom"
          key: "template_json"
        ) { value }
        designType: metafield(
          namespace: "custom"
          key: "design_type"
        ) { value }
        editorVersion: metafield(
          namespace: "custom"
          key: "editor_version"
        ) { value }
        variants(first: 20) {
          edges {
            node {
              id
              title
              price { amount currencyCode }
            }
          }
        }
      }
    }
  `

  const data = await storefrontFetch(PRODUCT_QUERY, { handle: productHandle })

  if (!data.product) {
    throw new Error('Product not found: ' + productHandle)
  }

  const product = data.product

  if (!product.templateJson?.value) {
    throw new Error('No template data found on this product. Make sure custom.template_json metafield is set.')
  }

  let templateJSON
  try {
    templateJSON = JSON.parse(product.templateJson.value)
  } catch (e) {
    throw new Error('Template data is corrupted. Please re-publish from the dashboard.')
  }

  const designType = product.designType?.value || 'template'

  const availableSizes = product.variants.edges.map(e => ({
    id: e.node.id,
    label: e.node.title,
    price: e.node.price.amount,
    currency: e.node.price.currencyCode,
    variantId: e.node.id
  }))

  if (designType === 'template') {
    return {
      name: product.title,
      canvasWidth: templateJSON.canvasWidth || 800,
      canvasHeight: templateJSON.canvasHeight || 600,
      svgClipPath: templateJSON.svgClipPath || null,
      backgroundColor: templateJSON.background || '#ffffff',
      designType: 'template',
      templateJSON,
      editableFields: [],
      availableSizes,
      productHandle,
      productId: product.id
    }
  }

  if (designType === 'canvas') {
    return {
      name: product.title,
      canvasWidth: templateJSON.canvasWidth || 500,
      canvasHeight: templateJSON.canvasHeight || 600,
      svgClipPath: templateJSON.svgClipPath || null,
      backgroundColor: templateJSON.backgroundColor || '#ffffff',
      designType: 'canvas',
      templateJSON: null,
      editableFields: [],
      availableSizes,
      productHandle,
      productId: product.id
    }
  }

  throw new Error('Unknown design type: ' + designType)
}
