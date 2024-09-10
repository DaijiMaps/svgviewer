import { RefObject } from 'react'
import { ActorRefFrom, AnyActorRef, sendTo, setup } from 'xstate'
import { BoxBox as Box } from './box/prefixed'
import { syncScroll } from './scroll'
import { stepMachine } from './xstate-step'

export type DragInput = {
  parent: AnyActorRef
  ref: RefObject<HTMLDivElement>
}

export type DragContext = {
  parent: AnyActorRef
  ref: RefObject<HTMLDivElement>
}

type DragEventSync = {
  type: 'SYNC'
  pos: Box
}
type DragEventSlide = {
  type: 'SLIDE'
  P: Box
  Q: Box
}
type DragEventCancel = {
  type: 'CANCEL'
  pos: Box
}
type DragEventStepDone = {
  type: 'STEP.DONE'
  count: number
}

export type DragEvent =
  | DragEventSync
  | DragEventSlide
  | DragEventCancel
  | DragEventStepDone

export const dragMachine = setup({
  types: {
    input: {} as DragInput,
    context: {} as DragContext,
    events: {} as DragEvent,
  },
  actions: {
    syncScroll: (_, { e, pos }: { e: null | HTMLDivElement; pos: Box }): void =>
      syncScroll(e, pos),
    startStep: sendTo(
      ({ system }) => system.get('step1'),
      (_, { P, Q }: { P: Box; Q: Box }) => ({ type: 'STEP.START', P, Q })
    ),
    stopStep: sendTo(
      ({ system }) => system.get('step'),
      () => ({ type: 'STEP.STOP' })
    ),
    notifySlideDone: sendTo(
      ({ context }) => context.parent,
      () => ({ type: 'SLIDE.DRAG.SLIDED' })
    ),
  },
  actors: {
    step: stepMachine,
  },
}).createMachine({
  id: 'drag',
  initial: 'Idle',
  context: ({ input: { parent, ref } }) => ({
    parent,
    ref,
  }),
  invoke: [
    {
      src: 'step',
      systemId: 'step1',
      input: ({ context, self }) => ({
        parent: self,
        cb: (b: Box) => syncScroll(context.ref.current, b),
      }),
    },
  ],
  states: {
    Idle: {
      on: {
        SYNC: {
          actions: [
            {
              type: 'syncScroll',
              params: ({ context, event }) => ({
                e: context.ref.current,
                pos: event.pos,
              }),
            },
          ],
        },
        SLIDE: {
          actions: [
            {
              type: 'startStep',
              params: ({ event: { P, Q } }) => ({ P, Q }),
            },
          ],
          target: 'Busy',
        },
      },
    },
    Busy: {
      on: {
        SLIDE: {
          actions: {
            type: 'startStep',
            params: ({ event: { P, Q } }) => ({ P, Q }),
          },
        },
        'STEP.DONE': {
          actions: 'notifySlideDone',
          target: 'Idle',
        },
        CANCEL: {
          actions: [
            {
              type: 'syncScroll',
              params: ({ context, event }) => ({
                e: context.ref.current,
                pos: event.pos,
              }),
            },
            'stopStep',
          ],
          target: 'Idle',
        },
      },
    },
  },
})

export type DragActorRef = ActorRefFrom<typeof dragMachine>
