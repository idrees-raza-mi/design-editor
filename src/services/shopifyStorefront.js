import { SHOPIFY_STORE_DOMAIN, SHOPIFY_STOREFRONT_TOKEN } from '../config/shopifyConfig'

function fieldsToObject(fields) {
  return fields.reduce((acc, field) => {
    acc[field.key] = field.value
    return acc
  }, {})
}

function storefrontFetch(query, variables) {
  return fetch('https://' + SHOPIFY_STORE_DOMAIN + '/api/2024-01/graphql.json', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_TOKEN
    },
    body: JSON.stringify({ query, variables })
  })
    .then(r => r.json())
    .then(r => {
      if (r.errors) throw new Error(r.errors[0].message)
      return r.data
    })
}

const METAOBJECT_QUERY = `
  query GetDesign($id: ID!) {
    metaobject(id: $id) {
      id
      type
      fields { key value }
    }
  }
`

export async function fetchCanvasDesign(id) {
  const data = await storefrontFetch(METAOBJECT_QUERY, { id })
  const fields = fieldsToObject(data.metaobject.fields)
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
  const data = await storefrontFetch(METAOBJECT_QUERY, { id })
  const fields = fieldsToObject(data.metaobject.fields)
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
