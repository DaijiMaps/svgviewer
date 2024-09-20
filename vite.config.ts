import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import { libInjectCss } from 'vite-plugin-lib-inject-css'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: {
        index: 'src/index.ts',
      },
      formats: ['es'],
      name: 'svgmapviewer',
      fileName: 'index',
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'xstate', '@xstate/react'],
    },
  },
  plugins: [
    react(),
    libInjectCss(),
    dts({ rollupTypes: true, tsconfigPath: './tsconfig.app.json' }),
  ],
})
