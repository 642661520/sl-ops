import fs from 'fs'

export function formatTag(openapiPath, tags) {
  const raw = fs.readFileSync(openapiPath, 'utf8')
  const doc = JSON.parse(raw)

  const rename = (name) => (name in tags ? tags[name] : name)

  if (Array.isArray(doc.tags)) {
    const seenTop = new Set()
    doc.tags = doc.tags
      .map((t) => ({ ...t, name: rename(t.name) }))
      .filter((t) => {
        if (seenTop.has(t.name)) return false
        seenTop.add(t.name)
        return true
      })
  }

  const paths = doc.paths || {}
  for (const p of Object.keys(paths)) {
    const item = paths[p] || {}
    for (const method of Object.keys(item)) {
      const op = item[method]
      if (!op) continue
      if (Array.isArray(op.tags)) {
        const seen = new Set()
        op.tags = op.tags
          .map((n) => rename(n))
          .filter((n) => {
            if (seen.has(n)) return false
            seen.add(n)
            return true
          })
      }
    }
  }

  fs.writeFileSync(openapiPath, JSON.stringify(doc, null, 2))
}

export function removeAuthHeaders(openapiPath, names = ['Authorization', 'clientid']) {
  const raw = fs.readFileSync(openapiPath, 'utf8')
  const doc = JSON.parse(raw)
  const paths = doc.paths || {}
  for (const p of Object.keys(paths)) {
    const item = paths[p]
    for (const method of Object.keys(item)) {
      const op = item[method]
      if (!op || !Array.isArray(op.parameters)) continue
      op.parameters = op.parameters.filter(
        (param) => !(param && param.in === 'header' && names.includes(param.name)),
      )
    }
  }
  fs.writeFileSync(openapiPath, JSON.stringify(doc, null, 2))
}

// 拍平 allOf + discriminator 引用，避免 wormhole 合并 allOf 产生空对象
// baseRefName: 基类 schema 名称
// 用法：flattenAllOf(specPath, 'ElementGeometryType')
export function flattenAllOf(openapiPath, baseRefName) {
  const raw = fs.readFileSync(openapiPath, 'utf8')
  const doc = JSON.parse(raw)
  const schemas = doc.components?.schemas
  if (!schemas || !schemas[baseRefName]) return false

  const base = schemas[baseRefName]
  const baseProps = base.properties || {}
  const baseRequired = base.required || []

  const needsFlatten = (name) =>
    schemas[name]?.allOf?.some((s) => s.$ref?.endsWith(`/${baseRefName}`))

  const refs = Object.keys(schemas).filter(needsFlatten)
  if (refs.length === 0) return false

  for (const name of refs) {
    const other = schemas[name].allOf.find((s) => !s.$ref?.endsWith(`/${baseRefName}`)) || {}
    const merged = {
      type: 'object',
      properties: { ...baseProps, ...(other.properties || {}) },
    }
    const required = [...baseRequired, ...(other.required || [])]
    if (required.length) merged.required = required

    for (const key of ['description', 'deprecated', 'example', 'title']) {
      if (schemas[name][key] != null) merged[key] = schemas[name][key]
    }

    delete schemas[name].allOf
    Object.assign(schemas[name], merged)
  }

  delete schemas[baseRefName]
  fs.writeFileSync(openapiPath, JSON.stringify(doc, null, 2))
  return true
}
