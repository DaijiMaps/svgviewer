import { RefObject } from 'react'
import { ActorRefFrom, AnyActorRef, sendTo, setup } from 'xstate'
import { BoxBox as Box } from './box/prefixed'
import { getScroll, syncScroll } from './scroll'
import { stepMachine } from './xstate-step'

export type ScrollInput = {
  parent: AnyActorRef
  ref: RefObject<HTMLDivElement>
}

export type ScrollContext = {
  parent: AnyActorRef
  ref: RefObject<HTMLDivElement>
}

type ScrollEventSync = {
  type: 'SYNC'
  pos: Box
}
type ScrollEventSlide = {
  type: 'SLIDE'
  P: Box
  Q: Box
}
type ScrollEventCancel = {
  type: 'CANCEL'
  pos: Box
}
type ScrollEventStepDone = {
  type: 'STEP.DONE'
  count: number
}

export type ScrollEvent =
  | ScrollEventSync
  | ScrollEventSlide
  | ScrollEventCancel
  | ScrollEventStepDone

export const scrollMachine = setup({
  types: {
    input: {} as ScrollInput,
    context: {} as ScrollContext,
    events: {} as ScrollEvent,
  },
  actions: {
    syncScroll: (
      _,
      { e, pos }: { e: null | HTMLDivElement; pos: Box }
    ): boolean => syncScroll(e, pos),
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
      () => ({ type: 'SCROLL.SLIDE.DONE' })
    ),
    notifyGetDone: sendTo(
      ({ context }) => context.parent,
      ({ context }) => ({
        type: 'SCROLL.GET.DONE',
        scroll: getScroll(context.ref.current),
      })
    ),
  },
  actors: {
    step: stepMachine,
  },
}).createMachine({
  id: 'scroll',
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
        GET: {
          actions: {
            type: 'notifyGetDone',
          },
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

export type ScrollActorRef = ActorRefFrom<typeof scrollMachine>
