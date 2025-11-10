import adapter from '@sveltejs/adapter-auto'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://svelte.dev/docs/kit/integrations
  // for more information about preprocessors
  preprocess: vitePreprocess(),

  kit: {
    adapter: adapter({
      // default options are usually fine
      pages: 'build',
      assets: 'build',
      fallback: null
    }),
    paths: {
      base: process.env.GITHUB_ACTIONS ? '/svelte-number-format' : ''
    }
  }
}

export default config
