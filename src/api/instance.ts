import { createAlova } from 'alova'
import adapterFetch from 'alova/fetch'
import vueHook from 'alova/vue'

export const alovaInstance = createAlova({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  statesHook: vueHook,
  requestAdapter: adapterFetch(),
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
