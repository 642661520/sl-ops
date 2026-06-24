import pluginVue from 'eslint-plugin-vue'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import oxlint from 'eslint-plugin-oxlint'

export default defineConfigWithVueTs(
  {
    name: 'app/files-to-lint',
    files: ['**/*.{ts,mts,tsx,vue}'],
  },

  {
    name: 'app/files-to-ignore',
    ignores: [
      '**/dist/**',
      '**/dist-ssr/**',
      '**/coverage/**',
      '**/*.d.ts',
      'src/auto-imports.d.ts',
      'src/components.d.ts',
      'alova.shared.ts',
      'eslint.config.ts',
    ],
  },

  ...pluginVue.configs['flat/essential'],
  vueTsConfigs.recommended,

  {
    name: 'app/custom-rules',
    rules: {
      // Vue
      'vue/block-order': ['error', { order: ['template', 'script', 'style'] }],
      'vue/component-name-in-template-casing': ['error', 'kebab-case'],
      'vue/attribute-hyphenation': ['error', 'always'],
      'vue/html-self-closing': ['error', { html: { void: 'always', normal: 'never' } }],
      'vue/no-v-html': 'warn',
      'vue/require-default-prop': 'off',
      'vue/multi-word-component-names': 'warn',
      'vue/no-unused-refs': 'warn',

      // TS
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
    },
  },

  {
    name: 'app/views-override',
    files: ['src/views/**/*.vue'],
    rules: {
      'vue/multi-word-component-names': 'off',
    },
  },

  oxlint.configs['flat/recommended'],
)
