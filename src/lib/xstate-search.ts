import { ActorRefFrom, enqueueActions, setup, StateFrom } from 'xstate'
import { Info } from './config'
import { Vec } from './vec'

type Req = {
  p: Vec
  psvg: Vec
}

type Res = {
  p: Vec
  psvg: Vec
  info: Info
}

export interface SearchInput {
  startCb: (p: Vec, psvg: Vec) => void
  endCb: (p: Vec, psvg: Vec, info: Info) => void
}

export interface SearchContext {
  startCb: (p: Vec, psvg: Vec) => void
  endCb: (p: Vec, psvg: Vec, info: Info) => void
  req: null | Req
}

export type SearchEvent =
  | { type: 'SEARCH'; p: Vec; psvg: Vec }
  | { type: 'SEARCH.DONE'; p: Vec; psvg: Vec; info: Info }
  | { type: 'SEARCH.CANCEL' }

export const searchMachine = setup({
  types: {
    input: {} as SearchInput,
    context: {} as SearchContext,
    events: {} as SearchEvent,
  },
  actions: {
    start: enqueueActions(({ enqueue, context }, { req }: { req: Req }) => {
      enqueue.assign({
        req: () => req,
      })
      context.startCb(req.p, req.psvg)
    }),
    notify: enqueueActions(
      ({ context }, { res: { p, psvg, info } }: { res: Res }) => {
        if (context.req !== null) {
          context.endCb(p, psvg, info)
        }
      }
    ),
    done: enqueueActions(({ enqueue }) => {
      enqueue.assign({
        req: () => null,
      })
    }),
  },
}).createMachine({
  id: 'search',
  context: ({ input }) => {
    return { ...input, req: null }
  },
  initial: 'Idle',
  states: {
    Idle: {
      on: {
        SEARCH: {
          actions: [
            {
              type: 'start',
              params: ({ event: { p, psvg } }) => ({
                req: { p, psvg },
              }),
            },
          ],
          target: 'Searching',
        },
      },
    },
    Searching: {
      on: {
        'SEARCH.DONE': {
          actions: [
            {
              type: 'notify',
              params: ({ event: { p, psvg, info } }) => ({
                res: { p, psvg, info },
              }),
            },
          ],
          target: 'Done',
        },
        'SEARCH.CANCEL': {
          target: 'Done',
        },
      },
    },
    Done: {
      entry: 'done',
      always: 'Idle',
    },
  },
})

export type SearchMachine = typeof searchMachine

export type SearchState = StateFrom<typeof searchMachine>

export type SearchSend = (events: SearchEvent) => void

export type SearchRef = ActorRefFrom<typeof searchMachine>
