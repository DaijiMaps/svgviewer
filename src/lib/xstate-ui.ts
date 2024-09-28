import {
  ActorRefFrom,
  assign,
  enqueueActions,
  not,
  or,
  raise,
  setup,
  StateFrom,
} from 'xstate'
import { Info } from './config'
import { Dir } from './dir'
import {
  OpenClose,
  openCloseClose,
  openCloseClosed,
  openCloseIsVisible,
  openCloseOpen,
  openCloseOpened,
  openCloseReset,
} from './open-close'
import { Vec } from './vec'

export interface UiInput {
  closeDoneCbs: (() => void)[]
}

export interface UiContext {
  canceling: boolean
  closeDoneCbs: (() => void)[]
  detail: null | {
    p: Vec
    dir: Dir
    info: Info
  }
  header: OpenClose
  footer: OpenClose
  shadow: OpenClose
  balloon: OpenClose
}

export type UiModeEvent =
  | { type: 'OPEN' }
  | { type: 'CANCEL' }
  | { type: 'FLOOR' }
  | { type: 'MENU' }
  | { type: 'DETAIL'; p: Vec; psvg: Vec; dir: Dir; info: Info }
  | { type: 'HELP' }

export type UiPartEvent =
  | { type: 'SHADOW.ANIMATION.END' }
  | { type: 'BALLOON.ANIMATION.END' }

export type UiInternalEvent = { type: 'DONE' }

export type UiEvent = UiModeEvent | UiPartEvent | UiInternalEvent

export const uiMachine = setup({
  types: {
    input: {} as UiInput,
    context: {} as UiContext,
    events: {} as UiEvent,
  },
  guards: {
    isBalloonVisible: ({ context: { balloon } }) => openCloseIsVisible(balloon),
    isShadowVisible: ({ context: { shadow } }) => openCloseIsVisible(shadow),
    isDetailVisible: or(['isBalloonVisible', 'isShadowVisible']),
  },
  actions: {
    startCancel: enqueueActions(({ enqueue }) => {
      enqueue.assign({
        canceling: () => true,
      })
    }),
    endCancel: enqueueActions(({ enqueue, context: { closeDoneCbs } }) => {
      closeDoneCbs.forEach((cb) => cb())
      enqueue.assign({
        canceling: () => false,
      })
    }),
    detail: assign({
      detail: (_, { p, dir, info }: { p: Vec; dir: Dir; info: Info }) => ({
        p: p,
        dir: dir,
        info: info,
      }),
    }),
    detailDone: assign({
      detail: () => null,
    }),
    openBalloon: assign({
      balloon: ({ context }) => {
        const x = openCloseOpen(context.balloon)
        return x === null ? context.balloon : x
      },
    }),
    closeBalloon: assign({
      balloon: ({ context }) => {
        const x = openCloseClose(context.balloon)
        return x === null ? context.balloon : x
      },
    }),
    handleBalloon: assign({
      balloon: ({ context: { balloon } }) => {
        const op = balloon.open ? openCloseOpened : openCloseClosed
        const x = op(balloon)
        return x === null ? balloon : x
      },
    }),
    openShadow: assign({
      shadow: ({ context }) => {
        const x = openCloseOpen(context.shadow)
        return x === null ? context.shadow : x
      },
    }),
    closeShadow: assign({
      shadow: ({ context }) => {
        const x = openCloseClose(context.shadow)
        return x === null ? context.shadow : x
      },
    }),
    handleShadow: assign({
      shadow: ({ context: { shadow } }) => {
        const op = shadow.open ? openCloseOpened : openCloseClosed
        const x = op(shadow)
        return x === null ? shadow : x
      },
    }),
  },
}).createMachine({
  type: 'parallel',
  id: 'ui',
  context: ({ input }) => ({
    ...input,
    canceling: false,
    detail: null,
    header: openCloseReset(true),
    footer: openCloseReset(true),
    shadow: openCloseReset(false),
    balloon: openCloseReset(false),
  }),
  states: {
    Ui: {
      initial: 'Idle',
      states: {
        Idle: {
          on: {
            FLOOR: {
              target: 'Floor',
            },
            MENU: {
              target: 'Menu',
            },
            DETAIL: {
              actions: [
                {
                  type: 'detail',
                  params: ({ event: { p, dir, info } }) => ({
                    p,
                    dir,
                    info: info,
                  }),
                },
              ],
              target: 'Detail',
            },
            HELP: {
              target: 'Help',
            },
          },
        },
        Floor: {},
        Menu: {},
        Detail: {
          initial: 'Waiting',
          onDone: 'Idle',
          states: {
            Waiting: {
              on: {
                OPEN: {
                  target: 'Opening',
                },
                CANCEL: {
                  target: 'Closed',
                },
              },
            },
            Opening: {
              entry: ['openBalloon', 'openShadow'],
              on: {
                DONE: [
                  { guard: not('isShadowVisible') },
                  { guard: not('isBalloonVisible') },
                  { target: 'Opened' },
                ],
              },
            },
            Opened: {
              on: {
                CANCEL: {
                  actions: 'startCancel',
                  target: 'Closing',
                },
              },
            },
            Closing: {
              entry: ['closeBalloon', 'closeShadow'],
              on: {
                DONE: [
                  { guard: 'isShadowVisible' },
                  { guard: 'isBalloonVisible' },
                  {
                    actions: 'endCancel',
                    target: 'Closed',
                  },
                ],
              },
            },
            Closed: {
              entry: ['detailDone'],
              type: 'final',
            },
          },
        },
        Help: {},
      },
    },
    Handler: {
      on: {
        'BALLOON.ANIMATION.END': {
          actions: ['handleBalloon', raise({ type: 'DONE' })],
        },
        'SHADOW.ANIMATION.END': {
          actions: ['handleShadow', raise({ type: 'DONE' })],
        },
      },
    },
  },
})

export type UiMachine = typeof uiMachine

export type UiState = StateFrom<typeof uiMachine>

export type UiSend = (events: UiEvent) => void

export type UiRef = ActorRefFrom<typeof uiMachine>
