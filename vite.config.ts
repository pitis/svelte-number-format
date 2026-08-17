import { defineConfig } from 'vitest/config'
import { sveltekit } from '@sveltejs/kit/vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

export default defineConfig(({ mode }) => ({
  plugins: mode === 'test' ? [svelte()] : [sveltekit()],

  ssr: {
    noExternal: ['sveltekit-superforms', 'formsnap']
  },

  test: {
    globals: true,
    projects: [
      {
        extends: true,
        test: {
          name: 'browser',
          include: ['src/**/*.{test,spec}.{js,ts}'],
          exclude: ['**/node_modules/**', '**/ssr.spec.ts'],
          environment: 'jsdom'
        }
      },
      {
        extends: true,
        test: {
          name: 'ssr',
          include: ['src/lib/ssr.spec.ts'],
          environment: 'node'
        }
      }
    ]
  },

  resolve:
    mode === 'test'
      ? {
          conditions: ['browser']
        }
      : undefined
}))
