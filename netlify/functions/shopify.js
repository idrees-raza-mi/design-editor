exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  const { action, data } = JSON.parse(event.body || '{}')

  const STORE = process.env.SHOPIFY_STORE_URL
  const TOKEN = process.env.SHOPIFY_ADMIN_TOKEN
  const ENDPOINT = `https://${STORE}/admin/api/2024-01/graphql.json`

  const shopifyRequest = async (query, variables) => {
    const r = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': TOKEN
      },
      body: JSON.stringify({ query, variables })
    })
    const json = await r.json()
    if (json.errors) throw new Error(json.errors[0].message)
    return json.data
  }

  try {
    switch (action) {

      case 'stagedUpload': {
        const query = `
          mutation stagedUploadsCreate($input: [StagedUploadInput!]!) {
            stagedUploadsCreate(input: $input) {
              stagedTargets {
                url
                resourceUrl
                parameters { name value }
              }
              userErrors { field message }
            }
          }`
        const result = await shopifyRequest(query, {
          input: [{
            resource: 'FILE',
            filename: data.filename,
            mimeType: data.mimeType,
            fileSize: String(data.fileSize),
            httpMethod: 'POST'
          }]
        })
        return { statusCode: 200, headers, body: JSON.stringify(result.stagedUploadsCreate.stagedTargets[0]) }
      }

      case 'createFile': {
        const query = `
          mutation fileCreate($files: [FileCreateInput!]!) {
            fileCreate(files: $files) {
              files {
                ... on MediaImage {
                  id
                  image { url }
                  status
                }
                ... on GenericFile {
                  id
                  url
                  status
                }
              }
              userErrors { field message }
            }
          }`
        const result = await shopifyRequest(query, {
          files: [{
            originalSource: data.originalSource,
            contentType: data.contentType || 'IMAGE'
          }]
        })
        return { statusCode: 200, headers, body: JSON.stringify(result.fileCreate.files[0]) }
      }

      case 'saveMetaobject': {
        const query = `
          mutation metaobjectCreate($metaobject: MetaobjectCreateInput!) {
            metaobjectCreate(metaobject: $metaobject) {
              metaobject { id handle }
              userErrors { field message }
            }
          }`
        const fields = Object.entries(data.fields).map(([key, value]) => ({
          key,
          value: String(value)
        }))
        const result = await shopifyRequest(query, {
          metaobject: { type: data.type, fields }
        })
        if (result.metaobjectCreate.userErrors.length > 0) {
          throw new Error(result.metaobjectCreate.userErrors[0].message)
        }
        return { statusCode: 200, headers, body: JSON.stringify(result.metaobjectCreate.metaobject) }
      }

      case 'getMetaobject': {
        const query = `
          query GetMetaobject($id: ID!) {
            metaobject(id: $id) {
              id type
              fields { key value }
            }
          }`
        const result = await shopifyRequest(query, { id: data.id })
        return { statusCode: 200, headers, body: JSON.stringify(result.metaobject) }
      }

      default:
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Unknown action: ' + action }) }
    }
  } catch (err) {
    console.error('Shopify proxy error:', err)
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) }
  }
}
