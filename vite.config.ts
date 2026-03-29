import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    chunkSizeWarningLimit: 1300,
    rollupOptions: {
      output: {
        manualChunks(id) {
          return id.includes('node_modules/phaser/') ? 'phaser' : undefined
        },
      },
    },
  },
})
