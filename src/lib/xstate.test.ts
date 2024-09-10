import { expect, test } from 'vitest'
import { assign, createActor, setup } from 'xstate'
import { isDefined } from './utils'

const m = setup({
  types: {
    context: {} as {
      a?: number
    },
  },
}).createMachine({
  id: 'a',
  initial: 'init',
  context: {},
  states: {
    init: {
      entry: [
        assign({ a: 0 }),
        assign({ a: 2 }),
        assign({
          a: ({ context }) =>
            isDefined(context.a) ? context.a * context.a : undefined,
        }),
      ],
    },
  },
})

test('xstate', () => {
  const a = createActor(m)
  a.start()
  const s1 = a.getSnapshot()

  expect(s1.context.a).toBe(4)
})
