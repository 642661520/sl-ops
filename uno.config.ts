import { defineConfig, presetWind4, presetAttributify, presetIcons } from 'unocss'

export default defineConfig({
  presets: [
    presetWind4(),
    presetAttributify(),
    presetIcons({
      extraProperties: {
        display: 'inline-block',
        'vertical-align': 'middle',
      },
    }),
  ],
  shortcuts: [
    ['flex-center', 'flex items-center justify-center'],
    ['flex-between', 'flex items-center justify-between'],
    ['page-container', 'p-6'],
  ],
  theme: {
    colors: {
      primary: {
        DEFAULT: '#4f46e5',
        hover: '#4338ca',
        pressed: '#3730a3',
      },
    },
  },
})
