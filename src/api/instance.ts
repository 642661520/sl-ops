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
  responded: {
    onSuccess: async (response) => {
      if (response.status >= 400) {
        throw new Error(`Request failed: ${response.status}`)
      }
      const data = await response.json()
      return data
    },
  },
})
