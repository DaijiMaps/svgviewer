import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    name: 'node',
    environment: 'jsdom',
    browser: {
      provider: 'playwright',
      enabled: true,
      name: 'chromium',
    },
  },
})
