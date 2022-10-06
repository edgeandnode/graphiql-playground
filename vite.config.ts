import react from '@vitejs/plugin-react'
import * as path from 'node:path'
import autoExternal from 'rollup-plugin-auto-external'
import { BuildOptions, defineConfig } from 'vite'

const libraryBuildOptions: BuildOptions = {
  lib: {
    entry: path.resolve(__dirname, 'src', 'index.tsx'),
    name: 'GraphiQLPlayground',
    formats: ['es', 'cjs'],
    fileName: (format) => `index.${format === 'cjs' ? 'cjs' : 'mjs'}`,
  },
  rollupOptions: {
    external: ['react/jsx-runtime', 'theme-ui/jsx-runtime', '@emotion/react/jsx-runtime'],
    plugins: [autoExternal()],
  },
}

const demoBuildOptions: BuildOptions = {
  chunkSizeWarningLimit: 1000,
}

export default defineConfig({
  plugins: [react()],
  build: process.env.BUILD_DEMO ? demoBuildOptions : libraryBuildOptions,
  esbuild: {
    jsx: 'automatic',
    logOverride: {
      // https://github.com/vitejs/vite/issues/8644
      'this-is-undefined-in-esm': 'silent',
    },
  },
})
