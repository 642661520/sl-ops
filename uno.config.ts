import { defineConfig, presetWind4, presetAttributify } from 'unocss'

export default defineConfig({
  presets: [presetWind4(), presetAttributify()],
  shortcuts: [
    ['flex-center', 'flex items-center justify-center'],
    ['flex-between', 'flex items-center justify-between'],
  ],
  theme: {
    colors: {
      primary: {
        DEFAULT: 'var(--color-primary)',
        hover: 'var(--color-primary-hover)',
        pressed: 'var(--color-primary-pressed)',
      },
    },
  },
})
