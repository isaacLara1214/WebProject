import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

const getBasePath = () => {
  if (!process.env.GITHUB_ACTIONS) {
    return '/'
  }

  const repository = process.env.GITHUB_REPOSITORY?.split('/')[1]
  if (!repository || repository.endsWith('.github.io')) {
    return '/'
  }

  return `/${repository}/`
}

// https://vite.dev/config/
export default defineConfig({
  base: getBasePath(),
  plugins: [vue(), vueDevTools()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
