import { setup } from 'xstate'
import { Size } from './size'
import { Vec } from './vec'

type Input = {
  origin: Vec
  legLength: number
  size: Size
}
type Context = {
  origin: Vec
  legLength: number
  size: Size
}

type Events =
  | { type: 'OPEN' }
  | { type: 'OPEN.DONE' }
  | { type: 'CLOSE' }
  | { type: 'CLOSE.DONE' }

export const balloonMachine = setup({
  types: {
    input: {} as Input,
    context: {} as Context,
    events: {} as Events,
  },
}).createMachine({
  id: 'balloon',
  initial: 'Closed',
  context: ({ input }) => ({
    ...input,
  }),
  states: {
    Closed: {},
    Opening: {},
    Opened: {},
    // XXX show context only after balloon is opned
    // XXX (scaling text can be very slow)
    ContentShown: {},
    Closing: {},
  },
})
