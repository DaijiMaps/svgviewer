import { ActorRefFrom, AnyActorRef, assign, sendTo, setup } from 'xstate'
import { Box } from './box'
import { isDefined, isNotNull } from './utils'
import { vecInterpolate } from './vec'
import { animationFrameLogic } from './xstate-animation-frame'

// XXX
// XXX
// XXX
const ALPHA = 0.4
const LIMIT = 10
const MAX_COUNT = 30
// XXX
// XXX
// XXX

export type StepInput = {
  parent: AnyActorRef
  cb: (p: Box) => void
  alpha?: number
  limit?: number
  maxCount?: number
}

export type StepContext = {
  parent: AnyActorRef
  cb: (p: Box) => void
  alpha: number
  limit: number
  maxCount: number
  P: null | Box
  Q: null | Box
  count: number
}

export type StepEventStart = { type: 'STEP.START'; P: Box; Q: Box }
export type StepEventTick = { type: 'TICK'; nsteps: number }
export type StepEventStop = { type: 'STEP.STOP' }

export type StepEvent = StepEventStart | StepEventTick | StepEventStop

export const stepMachine = setup({
  types: {
    input: {} as StepInput,
    context: {} as StepContext,
    events: {} as StepEvent,
  },
  guards: {
    isClose: ({ context: { P, Q, limit } }): boolean =>
      isNotNull(P) &&
      isNotNull(Q) &&
      isDefined(limit) &&
      // XXX
      // XXX
      // XXX
      //Math.pow(limit, 2) > qdist(P, Q)
      // XXX
      // XXX
      // XXX
      Math.abs(Q.x - P.x) <= 1 &&
      Math.abs(Q.y - P.y) <= 1,
    isOutcounted: ({ context: { count, maxCount } }): boolean =>
      count >= maxCount,
  },
  actions: {
    startStep: assign({
      P: (_, { P }: { P: Box; Q: Box }): null | Box => P,
      Q: (_, { Q }: { P: Box; Q: Box }): null | Box => Q,
      count: () => 0,
    }),
    // re-start - update only destination!!!
    restartStep: assign({
      Q: (_, { Q }: { Q: Box }): null | Box => Q,
      count: () => 0,
    }),
    nextStep: assign({
      P: ({ context: { P, Q, alpha } }): null | Box =>
        isNotNull(P) && isNotNull(Q) ? vecInterpolate(P, Q, alpha) : P,
      count: ({ context: { count } }) => count + 1,
    }),
    resetStep: assign({
      P: () => null,
      Q: () => null,
    }),
    callCbP: ({ context: { P, cb } }): void => {
      if (isNotNull(P) && isNotNull(cb)) {
        cb(P)
      }
    },
    callCbQ: ({ context: { Q, cb } }): void => {
      if (isNotNull(Q) && isNotNull(cb)) {
        cb(Q)
      }
    },
    sendStepDone: sendTo(
      ({ context }) => context.parent,
      ({ context }) => ({
        type: 'STEP.DONE',
        count: context.count,
      })
    ),
    startTick: sendTo(
      ({ system }) => system.get('tick1'),
      () => ({ type: 'START' })
    ),
    stopTick: sendTo(
      ({ system }) => system.get('tick1'),
      () => ({ type: 'STOP' })
    ),
  },
  actors: {
    tick: animationFrameLogic,
  },
}).createMachine({
  id: 'step',
  initial: 'idle',
  context: ({ input: { parent, cb, alpha, limit, maxCount } }) => ({
    parent,
    cb,
    alpha: isDefined(alpha) ? alpha : ALPHA,
    limit: isDefined(limit) ? limit : LIMIT,
    maxCount: isDefined(maxCount) ? maxCount : MAX_COUNT,
    P: null,
    Q: null,
    count: 0,
  }),
  invoke: [
    {
      src: 'tick',
      systemId: 'tick1',
    },
  ],
  states: {
    idle: {
      on: {
        'STEP.START': {
          actions: [
            {
              type: 'startStep',
              params: ({ event: { P, Q } }) => ({ P, Q }),
            },
            'startTick',
          ],
          target: 'arriving',
        },
      },
    },
    arriving: {
      on: {
        'STEP.START': {
          actions: {
            type: 'restartStep',
            params: ({ event: { Q } }) => ({ Q }),
          },
        },
        TICK: [
          {
            guard: 'isOutcounted',
            actions: 'callCbQ',
            target: 'outcounted',
          },
          {
            guard: 'isClose',
            actions: 'callCbQ',
            target: 'arrived',
          },
          {
            actions: ['nextStep', 'callCbP'],
          },
        ],
        'STEP.STOP': {
          target: 'stopped',
        },
      },
    },
    arrived: {
      always: 'done',
    },
    stopped: {
      always: 'done',
    },
    outcounted: {
      always: 'done',
    },
    done: {
      entry: ['stopTick', 'sendStepDone', 'resetStep'],
      always: 'idle',
    },
  },
})

export type StepActorRef = ActorRefFrom<typeof stepMachine>
