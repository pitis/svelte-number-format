import { defineConfig } from 'vitest/config'
import { sveltekit } from '@sveltejs/kit/vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

export default defineConfig(({ mode }) => ({
  plugins: mode === 'test' ? [svelte({ hot: false })] : [sveltekit()],

  test: {
    include: ['src/**/*.{test,spec}.{js,ts}'],
    environment: 'jsdom',
    globals: true
  },

  resolve:
    mode === 'test'
      ? {
          conditions: ['browser']
        }
      : undefined
}))
