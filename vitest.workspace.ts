import { defineWorkspace } from 'vitest/config'

export default defineWorkspace([
  {
    test: {
      name: 'unit',
      environment: 'node',
      include: ['src/lib/**/*.test.ts'],
    },
  },
  {
    test: {
      name: 'browser',
      include: ['src/**/*.{test,spec}.ts'],
      browser: {
        enabled: true,
        name: 'chromium',
        provider: 'playwright',
        providerOptions: {},
      },
    },
  },
])
