import { createAlova } from 'alova'
import adapterFetch from 'alova/fetch'
import vueHook from 'alova/vue'
import { createAlovaMockAdapter } from '@alova/mock'
import mockGroups from './mock'

const isMock = import.meta.env.VITE_MOCK === 'true'

const mockAdapter = createAlovaMockAdapter(mockGroups, {
  enable: isMock,
  httpAdapter: adapterFetch(),
  delay: 300,
  matchMode: 'methodurl',
})

export const alovaInstance = createAlova({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  statesHook: vueHook,
  requestAdapter: isMock ? mockAdapter : adapterFetch(),
  cacheFor: null,
  beforeRequest: (method) => {
    const token = localStorage.getItem('token')
    const tokenName = localStorage.getItem('tokenName') || 'Authorization'
    if (token) {
      const headerValue = tokenName === 'Authorization' ? `Bearer ${token}` : token
      method.config.headers = {
        ...method.config.headers,
        [tokenName]: headerValue,
      }
    }
  },
  responded: {
    onSuccess: async (response) => {
      if (response.status >= 400) {
        if (response.status === 401) {
          localStorage.removeItem('token')
          localStorage.removeItem('tokenName')
          localStorage.removeItem('userInfo')
          window.location.hash = '#/login'
        }
        throw new Error(`Request failed: ${response.status}`)
      }
      const data = typeof response.json === 'function' ? await response.json() : response
      if (data.code !== undefined && data.code !== 200) {
        throw new Error(data.msg || `请求失败 (code: ${data.code})`)
      }
      return data
    },
  },
})
