import { RefObject } from 'react'
import {
  ActorRefFrom,
  and,
  assign,
  not,
  or,
  raise,
  setup,
  StateFrom,
  stateIn,
} from 'xstate'
import {
  Animation,
  animationEndLayout,
  animationMove,
  animationZoom,
} from './animation'
import { boxCenter } from './box/prefixed'
import { Drag, dragMove, dragStart } from './drag'
import {
  expandLayoutCenter,
  Layout,
  LayoutConfig,
  makeLayout,
  moveLayout,
  recenterLayout,
} from './layout'
import {
  handleTouchEnd,
  handleTouchMove,
  handleTouchStart,
  isMultiTouch,
  isMultiTouchEnding,
  isNotMultiTouch,
  Touches,
} from './touch'
import { VecVec as Vec, vecScale, vecVec } from './vec/prefixed'
import { scrollMachine } from './xstate-scroll'

const DIST_LIMIT = 10

function keyToDir(key: string): Vec {
  return {
    x: key === 'h' ? 1 : key === 'l' ? -1 : 0,
    y: key === 'k' ? 1 : key === 'j' ? -1 : 0,
  }
}

function keyToZoom(key: string): number {
  return '=+iI'.indexOf(key) >= 0 ? 1 : '-_oO'.indexOf(key) >= 0 ? -1 : 0
}

//// PointerContext
//// PointerDOMEvent
//// _PointerEvent

export type PointerInput = {
  containerRef: RefObject<HTMLDivElement>
  layout: Layout
}

export type PointerContext = {
  containerRef: RefObject<HTMLDivElement>
  layout: Layout
  focus: Vec
  expand: number
  z: number
  zoom: number
  nextZoom: number
  touches: Touches
  drag: null | Drag
  animation: null | Animation
  debug: boolean
}

type PointerMiscEvent =
  | { type: 'LAYOUT'; config: LayoutConfig }
  | { type: 'RENDERED' }
  | { type: 'ANIMATION.MOVE' }
  | { type: 'ANIMATION.ZOOM' }
  | { type: 'ANIMATION.END' }
  | { type: 'ANIMATION.DONE' }
  | { type: 'DRAG' }
  | { type: 'DRAG.DONE' }
  | { type: 'DRAG.CANCEL' }
  | { type: 'TOUCH' }
  | { type: 'TOUCH.DONE' }
  | { type: 'TOUCH.START.DONE' }
  | { type: 'TOUCH.MOVE.DONE' }
  | { type: 'TOUCH.END.DONE' }
  | { type: 'SLIDE' }
  | { type: 'SLIDE.DONE' }
  | { type: 'SLIDE.DRAG.DONE' }
  | { type: 'SLIDE.DRAG.SLIDE' }
  | { type: 'SLIDE.DRAG.SLIDED' }
  | { type: 'EXPAND'; n?: number }
  | { type: 'EXPAND.DONE' }
  | { type: 'EXPAND.EXPANDED' }
  | { type: 'EXPAND.RENDERED' }
  | { type: 'UNEXPAND' }
  | { type: 'UNEXPAND.DONE' }
  | { type: 'UNEXPAND.UNEXPANDED' }
  | { type: 'UNEXPAND.RENDERED' }

export type PointerDOMEvent =
  | MouseEvent
  | WheelEvent
  | PointerEvent
  | TouchEvent
  | KeyboardEvent

type PointerEventCick = { type: 'CLICK'; ev: MouseEvent }
type PointerEventWheel = { type: 'WHEEL'; ev: WheelEvent }
type PointerEventKeyDown = { type: 'KEY.DOWN'; ev: KeyboardEvent }
type PointerEventKeyUp = { type: 'KEY.UP'; ev: KeyboardEvent }
type PointerEventPointerDown = { type: 'POINTER.DOWN'; ev: PointerEvent }
type PointerEventPointerMove = { type: 'POINTER.MOVE'; ev: PointerEvent }
type PointerEventPointerUp = { type: 'POINTER.UP'; ev: PointerEvent }
type PointerEventPointerCancel = { type: 'POINTER.CANCEL'; ev: PointerEvent }
type PointerEventTouchStart = { type: 'TOUCH.START'; ev: TouchEvent }
type PointerEventTouchMove = { type: 'TOUCH.MOVE'; ev: TouchEvent }
type PointerEventTouchEnd = { type: 'TOUCH.END'; ev: TouchEvent }
type PointerEventTouchCancel = { type: 'TOUCH.CANCEL'; ev: TouchEvent }

export type ReactPointerEvent =
  | PointerEventCick
  | PointerEventWheel
  | PointerEventPointerDown
  | PointerEventPointerMove
  | PointerEventPointerUp
  | PointerEventPointerCancel
  | PointerEventTouchStart
  | PointerEventTouchMove
  | PointerEventTouchEnd
  | PointerEventTouchCancel

export type PointerPointerEvent =
  | ReactPointerEvent
  | PointerEventKeyDown
  | PointerEventKeyUp

export type _PointerEvent = PointerMiscEvent | PointerPointerEvent

//// pointerMachine

export const pointerMachine = setup({
  types: {
    input: {} as PointerInput,
    context: {} as PointerContext,
    events: {} as _PointerEvent,
  },
  guards: {
    shouldDebug: (_, { ev }: { ev: KeyboardEvent }) => ev.key === 'd',
    shouldReset: (_, { ev }: { ev: KeyboardEvent }) => ev.key === 'r',
    shouldZoom: (_, { ev }: { ev: KeyboardEvent }) => keyToZoom(ev.key) !== 0,
    shouldExpand: (_, { ev }: { ev: KeyboardEvent }) => ev.key === 'e',
    shouldMove: (_, { ev }: { ev: KeyboardEvent }) =>
      'hjkl'.indexOf(ev.key) >= 0,
    isMultiTouch: ({ context: { touches } }) => isMultiTouch(touches),
    isNotMultiTouch: ({ context: { touches } }) => isNotMultiTouch(touches),
    isMultiTouchEnding: ({ context: { touches } }) =>
      isMultiTouchEnding(touches),
    isExpanded: ({ context }) => context.expand !== 1,
    isZooming: ({ context }) => context.touches.zoom !== null,
    idle: and([
      stateIn({ Pointer: 'Idle' }),
      stateIn({ Dragger: 'Inactive' }),
      stateIn({ Slider: { Handler: 'Inactive' } }),
      stateIn({ Animator: 'Inactive' }),
    ]),
    dragging: and([
      stateIn({ Pointer: 'Dragging' }),
      stateIn({ Dragger: { Active: 'Sliding' } }),
      stateIn({ Slider: { Handler: 'Inactive' } }),
      stateIn({ Animator: 'Inactive' }),
    ]),
    touching: and([
      stateIn({ Pointer: 'Touching' }),
      stateIn({ Dragger: 'Inactive' }),
      stateIn({ Slider: { Handler: 'Inactive' } }),
      stateIn({ Animator: 'Inactive' }),
    ]),
    sliding: and([
      stateIn({ Pointer: 'Dragging' }),
      stateIn({ Dragger: { Active: 'Sliding' } }),
      stateIn({ Slider: { Handler: 'Active' } }),
      stateIn({ Animator: 'Inactive' }),
    ]),
    slidingDragBusy: and([
      stateIn({ Pointer: 'Dragging' }),
      stateIn({ Dragger: { Active: 'Sliding' } }),
      stateIn({ Slider: { Handler: 'Active' } }),
      stateIn({ Slider: { Drag: 'Busy' } }),
      stateIn({ Animator: 'Inactive' }),
    ]),
  },
  actions: {
    layout: assign({
      layout: (_, { config }: { config: LayoutConfig }) => makeLayout(config),
    }),
    toggleDebug: assign({
      debug: ({ context }): boolean => !context.debug,
    }),
    syncScroll: ({ context: { layout }, system }): void => {
      system.get('scroll1').send({
        type: 'SYNC',
        pos: layout.container,
      })
    },
    slideScroll: ({ context: { layout, drag }, system }): void => {
      if (drag === null) {
        return
      }
      system.get('scroll1').send({
        type: 'SLIDE',
        P: layout.container,
        Q: drag.move,
      })
    },
    resetScroll: ({ context: { drag }, system }): void => {
      if (drag === null) {
        return
      }
      system.get('scroll1').send({
        type: 'SYNC',
        pos: drag.start,
      })
    },
    zoomKey: assign({
      z: (_, { ev }: { ev: KeyboardEvent }): number => keyToZoom(ev.key),
    }),
    zoomWheel: assign({
      z: (_, { ev }: { ev: WheelEvent }): number => (ev.deltaY < 0 ? 1 : -1),
    }),
    zoomTouches: assign({
      z: ({ context: { touches, z } }): number =>
        touches.zoom === null ? z : touches.zoom.dir,
      focus: ({ context: { focus, touches } }) =>
        touches.zoom === null ? focus : touches.zoom.p,
    }),
    startZoom: assign({
      animation: ({ context: { layout, focus, z } }): null | Animation =>
        animationZoom(layout, z, focus),
      z: () => 0,
      nextZoom: ({ context: { zoom, z } }): number => zoom + z,
    }),
    endZoom: assign({
      layout: ({ context: { layout, animation } }): Layout =>
        animation === null ? layout : animationEndLayout(layout, animation),
      zoom: ({ context: { nextZoom } }): number => nextZoom,
    }),
    recenterLayout: assign({
      layout: ({ context: { layout, drag } }): Layout =>
        drag === null ? layout : recenterLayout(layout, drag.start),
    }),
    resetLayout: assign({
      layout: ({ context: { layout } }): Layout => makeLayout(layout.config),
    }),
    expand: assign({
      layout: ({ context: { layout, expand } }, { n }: { n: number }): Layout =>
        expandLayoutCenter(layout, n / expand),
      expand: (_, { n }: { n: number }): number => n,
    }),
    focus: assign({
      focus: (_, { ev }: { ev: MouseEvent | PointerEvent }): Vec =>
        vecVec(ev.pageX, ev.pageY),
    }),
    startDrag: assign({
      drag: ({ context: { layout, focus } }): Drag =>
        dragStart(layout.container, focus),
    }),
    moveDrag: assign({
      drag: (
        { context: { drag } },
        { ev }: { ev: PointerEvent }
      ): null | Drag =>
        drag === null ? null : dragMove(drag, vecVec(ev.pageX, ev.pageY)),
    }),
    startMove: assign({
      animation: (
        { context: { drag, animation } },
        { ev, relative }: { ev: KeyboardEvent; relative: number }
      ): null | Animation =>
        drag === null
          ? animation
          : animationMove(drag, vecScale(keyToDir(ev.key), relative)),
    }),
    endMove: assign({
      layout: ({ context: { layout, drag } }): Layout =>
        drag === null ? layout : moveLayout(layout, drag.move),
      animation: () => null,
    }),
    startTouches: assign({
      touches: ({ context }, { ev }: { ev: TouchEvent }) =>
        handleTouchStart(context.touches, ev),
    }),
    moveTouches: assign({
      touches: ({ context }, { ev }: { ev: TouchEvent }) =>
        handleTouchMove(context.touches, ev, DIST_LIMIT),
    }),
    endTouches: assign({
      touches: ({ context }, { ev }: { ev: TouchEvent }) =>
        handleTouchEnd(context.touches, ev),
    }),
    resetTouches: assign({
      touches: () => ({
        vecs: new Map(),
        dists: [],
        zoom: null,
      }),
    }),
  },
  actors: {
    scroll: scrollMachine,
  },
}).createMachine({
  id: 'pointer',
  context: ({ input: { containerRef, layout } }) => ({
    containerRef,
    layout,
    focus: boxCenter(layout.body),
    expand: 1,
    z: 0,
    zoom: 0,
    nextZoom: 0,
    touches: {
      vecs: new Map(),
      dists: [],
      zoom: null,
    },
    drag: null,
    animation: null,
    debug: false,
  }),
  invoke: [
    {
      src: 'scroll',
      systemId: 'scroll1',
      input: ({ context, self }) => ({
        parent: self,
        ref: context.containerRef,
      }),
    },
  ],
  type: 'parallel',
  states: {
    Pointer: {
      initial: 'Idle',
      states: {
        Idle: {
          on: {
            LAYOUT: {
              actions: {
                type: 'layout',
                params: ({ event: { config } }) => ({ config }),
              },
            },
            'KEY.DOWN': [
              {
                guard: not('idle'),
                target: 'Idle',
              },
              {
                guard: {
                  type: 'shouldMove',
                  params: ({ event }) => ({ ev: event.ev }),
                },
                actions: [
                  'startDrag',
                  {
                    type: 'startMove',
                    params: ({ event }) => ({ ev: event.ev, relative: 500 }),
                  },
                ],
                target: 'Moving',
              },
            ],
            'KEY.UP': [
              {
                guard: {
                  type: 'shouldDebug',
                  params: ({ event }) => ({ ev: event.ev }),
                },
                actions: 'toggleDebug',
              },
              {
                guard: {
                  type: 'shouldReset',
                  params: ({ event }) => ({ ev: event.ev }),
                },
                actions: 'resetLayout',
              },
              {
                guard: {
                  type: 'shouldExpand',
                  params: ({ event }) => ({ ev: event.ev }),
                },
                target: 'Expanding',
              },
              {
                guard: not('idle'),
                target: 'Idle',
              },
              {
                guard: {
                  type: 'shouldZoom',
                  params: ({ event }) => ({ ev: event.ev }),
                },
                actions: [
                  {
                    type: 'zoomKey',
                    params: ({ event }) => ({ ev: event.ev }),
                  },
                  'startZoom',
                ],
                target: 'Zooming',
              },
            ],
            CLICK: {
              actions: {
                type: 'focus',
                params: ({ event }) => ({ ev: event.ev }),
              },
            },
            WHEEL: {
              guard: 'idle',
              actions: [
                { type: 'focus', params: ({ event }) => ({ ev: event.ev }) },
                {
                  type: 'zoomWheel',
                  params: ({ event }) => ({ ev: event.ev }),
                },
                'startZoom',
              ],
              target: 'Zooming',
            },
            'POINTER.DOWN': {
              actions: {
                type: 'focus',
                params: ({ event }) => ({ ev: event.ev }),
              },
            },
            DRAG: {
              guard: 'idle',
              target: 'Dragging',
            },
            TOUCH: {
              guard: 'idle',
              target: 'Touching',
            },
          },
        },
        Moving: {
          entry: raise({ type: 'ANIMATION.MOVE' }),
          on: {
            'ANIMATION.DONE': {
              target: 'Idle',
            },
          },
        },
        Zooming: {
          entry: raise({ type: 'ANIMATION.ZOOM' }),
          on: {
            'ANIMATION.DONE': {
              target: 'Idle',
            },
          },
        },
        Expanding: {
          initial: 'Checking',
          onDone: 'Idle',
          states: {
            Checking: {
              always: [
                {
                  guard: not('isExpanded'),
                  target: 'Expanding',
                },
                {
                  target: 'Unexpanding',
                },
              ],
            },
            Expanding: {
              entry: raise({ type: 'EXPAND' }),
              on: {
                'EXPAND.DONE': {
                  target: 'Done',
                },
              },
            },
            Unexpanding: {
              entry: raise({ type: 'UNEXPAND' }),
              on: {
                'UNEXPAND.DONE': {
                  target: 'Done',
                },
              },
            },
            Done: {
              type: 'final',
            },
          },
        },
        Dragging: {
          on: {
            TOUCH: { target: 'DraggingToTouching' },
            'DRAG.DONE': { target: 'Idle' },
          },
        },
        DraggingToTouching: {
          on: {
            'DRAG.DONE': {
              target: 'Touching',
            },
          },
        },
        Touching: {
          on: {
            'ANIMATION.ZOOM': { target: 'Zooming' },
            'TOUCH.DONE': { target: 'Idle' },
          },
        },
      },
    },
    Dragger: {
      initial: 'Inactive',
      states: {
        Inactive: {
          on: {
            DRAG: {
              guard: 'idle',
              target: 'Active',
            },
          },
        },
        Active: {
          initial: 'Expanding',
          onDone: 'Inactive',
          states: {
            Expanding: {
              entry: raise({ type: 'EXPAND', n: 3 }),
              on: {
                'EXPAND.DONE': {
                  target: 'Sliding',
                },
              },
            },
            Sliding: {
              entry: raise({ type: 'SLIDE' }),
              on: {
                'SLIDE.DONE': {
                  target: 'Unexpanding',
                },
              },
            },
            Unexpanding: {
              entry: raise({ type: 'UNEXPAND' }),
              on: {
                'UNEXPAND.DONE': {
                  target: 'Done',
                },
              },
            },
            Done: {
              type: 'final',
            },
          },
        },
      },
    },
    Slider: {
      type: 'parallel',
      states: {
        Handler: {
          initial: 'Inactive',
          states: {
            Inactive: {
              on: {
                SLIDE: {
                  guard: 'dragging',
                  target: 'Active',
                },
              },
            },
            Active: {
              entry: 'startDrag',
              on: {
                'POINTER.MOVE': {
                  guard: and(['sliding', 'isNotMultiTouch']),
                  actions: [
                    {
                      type: 'focus',
                      params: ({ event }) => ({ ev: event.ev }),
                    },
                    {
                      type: 'moveDrag',
                      params: ({ event }) => ({ ev: event.ev }),
                    },
                    'slideScroll',
                    raise({ type: 'SLIDE.DRAG.SLIDE' }),
                  ],
                },
                'SLIDE.DRAG.DONE': {
                  guard: not('slidingDragBusy'),
                  actions: 'endMove',
                  target: 'Active',
                },
                'POINTER.UP': [
                  {
                    guard: 'slidingDragBusy',
                    target: 'Waiting',
                  },
                  {
                    target: 'Done',
                  },
                ],
                'DRAG.CANCEL': [
                  {
                    guard: 'slidingDragBusy',
                    target: 'Waiting',
                  },
                  {
                    target: 'Done',
                  },
                ],
              },
            },
            Waiting: {
              on: {
                'SLIDE.DRAG.DONE': {
                  guard: not('slidingDragBusy'),
                  actions: 'endMove',
                  target: 'Done',
                },
              },
            },
            Done: {
              guard: not('slidingDragBusy'),
              entry: raise({ type: 'SLIDE.DONE' }),
              always: 'Inactive',
            },
          },
        },
        Drag: {
          initial: 'Idle',
          states: {
            Idle: {
              on: {
                'SLIDE.DRAG.SLIDE': {
                  target: 'Busy',
                },
              },
            },
            Busy: {
              on: {
                'SLIDE.DRAG.SLIDED': {
                  target: 'Done',
                },
              },
            },
            Done: {
              entry: raise({ type: 'SLIDE.DRAG.DONE' }),
              always: 'Idle',
            },
          },
        },
      },
    },
    Expander: {
      initial: 'Unexpanded',
      states: {
        Unexpanded: {
          on: {
            EXPAND: {
              actions: {
                type: 'expand',
                params: ({ context: { expand }, event: { n } }) => ({
                  n: n !== undefined ? n : expand === 1 ? 3 : 1,
                }),
              },
              target: 'Expanding',
            },
          },
        },
        Expanding: {
          tags: ['rendering'],
          on: {
            RENDERED: {
              target: 'ExpandRendering',
            },
          },
        },
        ExpandRendering: {
          tags: ['rendering'],
          on: {
            RENDERED: {
              actions: 'syncScroll',
              target: 'Expanded',
            },
          },
        },
        Expanded: {
          entry: raise({ type: 'EXPAND.DONE' }),
          on: {
            UNEXPAND: {
              target: 'Unexpanding',
            },
          },
        },
        Unexpanding: {
          tags: ['rendering'],
          on: {
            RENDERED: {
              actions: [
                'recenterLayout',
                'resetScroll',
                { type: 'expand', params: { n: 1 } },
              ],
              target: 'UnexpandRendering',
            },
          },
        },
        UnexpandRendering: {
          tags: ['rendering'],
          on: {
            RENDERED: {
              target: 'Done',
            },
          },
        },
        Done: {
          entry: raise({ type: 'UNEXPAND.DONE' }),
          always: 'Unexpanded',
        },
      },
    },
    Animator: {
      initial: 'Inactive',
      states: {
        Inactive: {
          on: {
            'ANIMATION.MOVE': {
              target: 'Moving',
            },
            'ANIMATION.ZOOM': {
              target: 'Zooming',
            },
          },
        },
        Moving: {
          on: {
            'ANIMATION.END': {
              actions: ['endZoom', 'recenterLayout', 'resetScroll'],
              target: 'Done',
            },
          },
        },
        Zooming: {
          on: {
            'ANIMATION.END': {
              actions: 'endZoom',
              target: 'Done',
            },
          },
        },
        Done: {
          entry: raise({ type: 'ANIMATION.DONE' }),
          always: 'Inactive',
        },
      },
    },
    PointerMonitor: {
      initial: 'Idle',
      states: {
        Idle: {
          on: {
            'POINTER.DOWN': {
              target: 'Busy',
            },
          },
        },
        Busy: {
          initial: 'Idle',
          onDone: 'Idle',
          states: {
            Idle: {
              on: {
                'POINTER.MOVE': {
                  target: 'Busy',
                },
                'POINTER.UP': {
                  actions: raise({ type: 'DRAG.DONE' }),
                  target: 'Done',
                },
              },
            },
            Busy: {
              entry: raise({ type: 'DRAG' }),
              on: {
                'POINTER.UP': {
                  target: 'Done',
                },
                'DRAG.CANCEL': {
                  target: 'Done',
                },
              },
            },
            Done: {
              entry: raise({ type: 'DRAG.DONE' }),
              type: 'final',
            },
          },
        },
      },
    },
    TouchHandler: {
      initial: 'Active',
      states: {
        Active: {
          on: {
            'TOUCH.START': {
              actions: {
                type: 'startTouches',
                params: ({ event }) => ({ ev: event.ev }),
              },
              target: 'StartDone',
            },
            'TOUCH.MOVE': {
              actions: {
                type: 'moveTouches',
                params: ({ event }) => ({ ev: event.ev }),
              },
              target: 'MoveDone',
            },
            'TOUCH.END': {
              actions: {
                type: 'endTouches',
                params: ({ event }) => ({ ev: event.ev }),
              },
              target: 'EndDone',
            },
          },
        },
        StartDone: {
          entry: raise({ type: 'TOUCH.START.DONE' }),
          always: 'Active',
        },
        MoveDone: {
          entry: raise({ type: 'TOUCH.MOVE.DONE' }),
          always: 'Active',
        },
        EndDone: {
          entry: raise({ type: 'TOUCH.END.DONE' }),
          always: 'Active',
        },
      },
    },
    TouchMonitor: {
      initial: 'Inactive',
      states: {
        Inactive: {
          on: {
            'TOUCH.MOVE.DONE': {
              guard: and([or(['idle', 'sliding']), 'isMultiTouch']),
              target: 'Active',
            },
          },
        },
        Active: {
          entry: raise({ type: 'TOUCH' }),
          on: {
            'TOUCH.MOVE.DONE': {
              guard: and(['touching', 'isZooming']),
              actions: ['zoomTouches', 'startZoom', 'resetTouches'],
              target: 'Zooming',
            },
            'TOUCH.END.DONE': {
              guard: and(['isMultiTouchEnding']),
              actions: 'resetTouches',
              target: 'Done',
            },
          },
        },
        Zooming: {
          entry: raise({ type: 'ANIMATION.ZOOM' }),
          on: {
            'ANIMATION.DONE': {
              target: 'Inactive',
            },
          },
        },
        Done: {
          entry: raise({ type: 'TOUCH.DONE' }),
          always: 'Inactive',
        },
      },
    },
  },
})

//// pointerMachine
//// PointerMachine
//// PointerState
//// PointerSend

export type PointerMachine = typeof pointerMachine

export type PointerState = StateFrom<typeof pointerMachine>

export type PointerSend = (events: _PointerEvent) => void

export type PointerRef = ActorRefFrom<typeof pointerMachine>
