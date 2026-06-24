import { defineConfig } from '@alova/wormhole'

export default defineConfig({
  generator: [
    {
      input: 'openapi/ops.openapi.transformed.json',
      output: 'src/api',
      type: 'auto',
    },
  ],
})
