import type { ApiDescriptor } from '@alova/wormhole'

export function formatApiName(
  api: ApiDescriptor,
  opts?: { stripPrefix?: string | RegExp },
): ApiDescriptor {
  let url = api.url
  if (opts?.stripPrefix) {
    url = url.replace(opts.stripPrefix, '')
  }
  const segments = url.split('/').filter(Boolean)
  let operationId = api.method.toLowerCase()
  segments.forEach((seg) => {
    // Strip invalid chars but keep - and _ as camelCase separators
    seg = seg.replace(/[^a-zA-Z0-9_{}_-]/g, '')
    if (!seg) return

    if (seg.startsWith('{') && seg.endsWith('}')) {
      seg = seg
        .slice(1, -1)
        .split(/[-_]/g)
        .filter(Boolean)
        .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
        .join('')
      operationId += 'By' + seg
    } else {
      seg
        .split(/[-_]/g)
        .filter(Boolean)
        .forEach((part) => {
          operationId += part.charAt(0).toUpperCase() + part.slice(1)
        })
    }
  })
  api.operationId = operationId
  return api
}

export function formatApiResponse(api: ApiDescriptor): ApiDescriptor {
  if (api.method === 'get') {
    if (!api.responses?.properties?.total) {
      api.responses = api.responses?.properties?.data
    }
  }
  return api
}
