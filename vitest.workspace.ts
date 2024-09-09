import { defineWorkspace } from 'vitest/config'

export default defineWorkspace([
  {
    test: {
      name: 'unit',
      environment: 'node',
      include: ['src/lib/**/*.test.ts'],
      exclude: [
        'src/lib/box.test.ts',
        'src/lib/layout.test.ts',
        'src/lib/frame.test.ts',
        'src/lib/misc.test.ts',
        'src/lib/viewport.test.ts',
        'src/lib/zoom.test.ts',
      ],
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
