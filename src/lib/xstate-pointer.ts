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
  animationEndLayout,
  animationMoveLayout2,
  animationZoomLayout,
} from './animation'
import { boxCenter } from './box'
import { dragMove, dragStart } from './drag'
import {
  expandLayoutCenter,
  Layout,
  LayoutAnimation,
  LayoutConfig,
  LayoutDrag,
  makeLayout,
  moveLayout,
  recenterLayout,
} from './layout'
import {
  handleTouchEnd,
  handleTouchMove,
  handleTouchStart,
  Touches,
} from './touch'
import { scale, vec, Vec } from './vec'
import { dragMachine } from './xstate-drag'

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
  zoom: number
  touches: Touches
  drag: null | LayoutDrag
  animation: null | LayoutAnimation
  debug: boolean
}

type PointerMiscEvent =
  | { type: 'LAYOUT'; config: LayoutConfig }
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
  | { type: 'REFLECT' }
  | { type: 'REFLECT.DONE' }
  | { type: 'REFLECT.REFLECTED' }
  | { type: 'REFLECT.RENDERED' }

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
    isSingleTouchStarting: (_, { ev }: { ev: TouchEvent }) =>
      ev.changedTouches.length === 1,
    isMultiTouchStarting: (_, { ev }: { ev: TouchEvent }) =>
      ev.changedTouches.length === 2,
    isMultiTouchEnding: ({ context }) => context.touches.vecs.size === 0,
    isMultiTouch: ({ context }) => {
      if (context.touches.vecs.size < 2) {
        return false
      }
      const [ps, qs] = context.touches.vecs.values()
      return (
        ps !== undefined &&
        ps.length !== 0 &&
        qs !== undefined &&
        qs.length !== 0
      )
    },
    isNotMultiTouch: ({ context }) => context.touches.vecs.size < 2,
    isZooming: ({ context }) => {
      return context.touches.zoom !== null
    },
    idle: and([
      stateIn({ pointer: 'idle' }),
      stateIn({ dragger: 'inactive' }),
      stateIn({ slider: { handler: 'inactive' } }),
      stateIn({ animator: 'inactive' }),
    ]),
    dragging: and([
      stateIn({ pointer: 'dragging' }),
      stateIn({ dragger: { active: 'sliding' } }),
      stateIn({ slider: { handler: 'inactive' } }),
      stateIn({ animator: 'inactive' }),
    ]),
    touching: and([
      stateIn({ pointer: 'touching' }),
      stateIn({ dragger: 'inactive' }),
      stateIn({ slider: { handler: 'inactive' } }),
      stateIn({ animator: 'inactive' }),
    ]),
    sliding: and([
      stateIn({ pointer: 'dragging' }),
      stateIn({ dragger: { active: 'sliding' } }),
      stateIn({ slider: { handler: 'active' } }),
      stateIn({ animator: 'inactive' }),
    ]),
    slidingDragBusy: and([
      stateIn({ pointer: 'dragging' }),
      stateIn({ dragger: { active: 'sliding' } }),
      stateIn({ slider: { handler: 'active' } }),
      stateIn({ slider: { drag: 'busy' } }),
      stateIn({ animator: 'inactive' }),
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
      system.get('drag1').send({
        type: 'SYNC',
        pos: layout.container,
      })
    },
    slideScroll: ({ context: { layout, drag }, system }): void => {
      if (drag === null) {
        return
      }
      system.get('drag1').send({
        type: 'SLIDE',
        P: layout.container,
        Q: drag.move,
      })
    },
    resetScroll: ({ context: { drag }, system }): void => {
      if (drag === null) {
        return
      }
      system.get('drag1').send({
        type: 'SYNC',
        pos: drag.start,
      })
    },
    zoomKey: assign({
      animation: (
        { context: { layout, focus, zoom } },
        { ev }: { ev: KeyboardEvent }
      ): null | LayoutAnimation =>
        animationZoomLayout(layout, zoom, keyToZoom(ev.key), focus),
    }),
    zoomWheel: assign({
      animation: (
        { context: { layout, focus, zoom } },
        { ev }: { ev: WheelEvent }
      ): null | LayoutAnimation =>
        animationZoomLayout(layout, zoom, ev.deltaY < 0 ? 1 : -1, focus),
    }),
    zoomTouches: assign({
      animation: ({
        context: { animation, layout, zoom, touches },
      }): null | LayoutAnimation =>
        touches.zoom === null
          ? animation
          : animationZoomLayout(layout, zoom, touches.zoom.dir, touches.zoom.p),
      focus: ({ context: { focus, touches } }) =>
        touches.zoom === null ? focus : touches.zoom.p,
    }),
    zoomEnd: assign({
      layout: ({ context: { layout, animation } }): Layout =>
        animation === null ? layout : animationEndLayout(layout, animation),
      zoom: ({ context: { animation, zoom } }): number =>
        animation === null || animation.zoom === null
          ? zoom
          : zoom + animation.zoom.zoom,
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
        vec(ev.pageX, ev.pageY),
    }),
    dragStart: assign({
      drag: ({ context: { layout, focus } }): LayoutDrag =>
        dragStart(layout, focus),
    }),
    dragMove: assign({
      drag: (
        { context: { drag } },
        { ev }: { ev: PointerEvent }
      ): null | LayoutDrag =>
        drag === null ? null : dragMove(drag, ev.pageX, ev.pageY),
    }),
    animationMoveLayout: assign({
      animation: (
        { context: { drag, animation } },
        { ev, relative }: { ev: KeyboardEvent; relative: number }
      ): null | LayoutAnimation =>
        drag === null
          ? animation
          : animationMoveLayout2(drag, scale(keyToDir(ev.key), relative)),
    }),
    dragEnd: assign({
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
    drag: dragMachine,
  },
}).createMachine({
  id: 'pointer',
  context: ({ input: { containerRef, layout } }) => ({
    containerRef,
    layout,
    focus: boxCenter(layout.body),
    expand: 1,
    zoom: 0,
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
      src: 'drag',
      systemId: 'drag1',
      input: ({ context, self }) => ({
        parent: self,
        ref: context.containerRef,
      }),
    },
  ],
  type: 'parallel',
  states: {
    config: {
      initial: 'idle',
      states: {
        idle: {
          on: {
            LAYOUT: {
              actions: {
                type: 'layout',
                params: ({ event: { config } }) => ({ config }),
              },
            },
          },
        },
      },
    },
    pointer: {
      initial: 'idle',
      states: {
        idle: {
          on: {
            'KEY.DOWN': [
              {
                guard: not('idle'),
                target: 'idle',
              },
              {
                guard: {
                  type: 'shouldMove',
                  params: ({ event }) => ({ ev: event.ev }),
                },
                actions: [
                  'dragStart',
                  {
                    type: 'animationMoveLayout',
                    params: ({ event }) => ({ ev: event.ev, relative: 500 }),
                  },
                ],
                target: 'moving',
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
                target: 'expanding',
              },
              {
                guard: not('idle'),
                target: 'idle',
              },
              {
                guard: {
                  type: 'shouldZoom',
                  params: ({ event }) => ({ ev: event.ev }),
                },
                actions: {
                  type: 'zoomKey',
                  params: ({ event }) => ({ ev: event.ev }),
                },
                target: 'zooming',
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
              ],
              target: 'zooming',
            },
            'POINTER.DOWN': {
              actions: {
                type: 'focus',
                params: ({ event }) => ({ ev: event.ev }),
              },
            },
            DRAG: {
              guard: 'idle',
              target: 'dragging',
            },
            TOUCH: {
              guard: 'idle',
              target: 'touching',
            },
          },
        },
        moving: {
          entry: raise({ type: 'ANIMATION.MOVE' }),
          on: {
            'ANIMATION.DONE': {
              target: 'idle',
            },
          },
        },
        zooming: {
          entry: raise({ type: 'ANIMATION.ZOOM' }),
          on: {
            'ANIMATION.DONE': {
              target: 'idle',
            },
          },
        },
        expanding: {
          entry: raise({ type: 'EXPAND' }),
          on: {
            'EXPAND.DONE': {
              target: 'idle',
            },
          },
        },
        dragging: {
          on: {
            TOUCH: { target: 'draggingToTouching' },
            'DRAG.DONE': { target: 'idle' },
          },
        },
        draggingToTouching: {
          on: {
            'DRAG.DONE': {
              target: 'touching',
            },
          },
        },
        touching: {
          on: {
            'ANIMATION.ZOOM': { target: 'zooming' },
            'TOUCH.DONE': { target: 'idle' },
          },
        },
      },
    },
    dragger: {
      initial: 'inactive',
      states: {
        inactive: {
          on: {
            DRAG: {
              guard: 'idle',
              target: 'active',
            },
          },
        },
        active: {
          initial: 'expanding',
          onDone: 'inactive',
          states: {
            expanding: {
              entry: raise({ type: 'EXPAND', n: 3 }),
              on: {
                'EXPAND.DONE': {
                  target: 'sliding',
                },
              },
            },
            sliding: {
              entry: raise({ type: 'SLIDE' }),
              on: {
                'SLIDE.DONE': {
                  target: 'reflecting',
                },
              },
            },
            reflecting: {
              entry: raise({ type: 'REFLECT' }),
              on: {
                'REFLECT.DONE': {
                  target: 'done',
                },
              },
            },
            done: {
              type: 'final',
            },
          },
        },
      },
    },
    slider: {
      type: 'parallel',
      states: {
        handler: {
          initial: 'inactive',
          states: {
            inactive: {
              on: {
                SLIDE: {
                  guard: 'dragging',
                  target: 'active',
                },
              },
            },
            active: {
              entry: 'dragStart',
              on: {
                'POINTER.MOVE': [
                  {
                    guard: and(['sliding', 'isNotMultiTouch']),
                    actions: [
                      {
                        type: 'focus',
                        params: ({ event }) => ({ ev: event.ev }),
                      },
                      {
                        type: 'dragMove',
                        params: ({ event }) => ({ ev: event.ev }),
                      },
                      'slideScroll',
                      raise({ type: 'SLIDE.DRAG.SLIDE' }),
                    ],
                  },
                ],
                'SLIDE.DRAG.DONE': {
                  guard: not('slidingDragBusy'),
                  actions: 'dragEnd',
                  target: 'active',
                },
                'POINTER.UP': [
                  {
                    guard: 'slidingDragBusy',
                    target: 'waiting',
                  },
                  {
                    target: 'done',
                  },
                ],
                'DRAG.CANCEL': [
                  {
                    guard: 'slidingDragBusy',
                    target: 'waiting',
                  },
                  {
                    target: 'done',
                  },
                ],
              },
            },
            waiting: {
              on: {
                'SLIDE.DRAG.DONE': {
                  guard: not('slidingDragBusy'),
                  actions: 'dragEnd',
                  target: 'done',
                },
              },
            },
            done: {
              guard: not('slidingDragBusy'),
              entry: raise({ type: 'SLIDE.DONE' }),
              always: 'inactive',
            },
          },
        },
        drag: {
          initial: 'idle',
          states: {
            idle: {
              on: {
                'SLIDE.DRAG.SLIDE': {
                  target: 'busy',
                },
              },
            },
            busy: {
              on: {
                'SLIDE.DRAG.SLIDED': {
                  target: 'done',
                },
              },
            },
            done: {
              entry: raise({ type: 'SLIDE.DRAG.DONE' }),
              always: 'idle',
            },
          },
        },
      },
    },
    expander: {
      initial: 'unexpanded',
      states: {
        unexpanded: {
          on: {
            EXPAND: {
              actions: {
                type: 'expand',
                params: ({ context: { expand }, event: { n } }) => ({
                  n: n !== undefined ? n : expand === 1 ? 3 : 1,
                }),
              },
              target: 'expanding',
            },
          },
        },
        expanding: {
          on: {
            'EXPAND.EXPANDED': {
              target: 'expanded',
            },
          },
        },
        expanded: {
          on: {
            'EXPAND.RENDERED': {
              actions: ['syncScroll'],
              target: 'done',
            },
          },
        },
        done: {
          entry: raise({ type: 'EXPAND.DONE' }),
          always: 'unexpanded',
        },
      },
    },
    reflector: {
      initial: 'expanded',
      states: {
        expanded: {
          on: {
            REFLECT: {
              target: 'reflecting',
            },
          },
        },
        reflecting: {
          on: {
            'REFLECT.REFLECTED': {
              actions: [
                'recenterLayout',
                'resetScroll',
                { type: 'expand', params: { n: 1 } },
              ],
              target: 'reflected',
            },
          },
        },
        reflected: {
          on: {
            'REFLECT.RENDERED': {
              target: 'done',
            },
          },
        },
        done: {
          entry: raise({ type: 'REFLECT.DONE' }),
          always: 'expanded',
        },
      },
    },
    animator: {
      initial: 'inactive',
      states: {
        inactive: {
          on: {
            'ANIMATION.MOVE': {
              target: 'moving',
            },
            'ANIMATION.ZOOM': {
              target: 'zooming',
            },
          },
        },
        moving: {
          on: {
            'ANIMATION.END': {
              actions: ['zoomEnd', 'recenterLayout', 'resetScroll'],
              target: 'done',
            },
          },
        },
        zooming: {
          on: {
            'ANIMATION.END': {
              actions: ['zoomEnd'],
              target: 'done',
            },
          },
        },
        done: {
          entry: raise({ type: 'ANIMATION.DONE' }),
          always: 'inactive',
        },
      },
    },
    pointerMonitor: {
      initial: 'idle',
      states: {
        idle: {
          on: {
            'POINTER.DOWN': {
              target: 'busy',
            },
          },
        },
        busy: {
          initial: 'idle',
          onDone: 'idle',
          states: {
            idle: {
              on: {
                'POINTER.MOVE': {
                  target: 'busy',
                },
                'POINTER.UP': {
                  actions: raise({ type: 'DRAG.DONE' }),
                  target: 'done',
                },
              },
            },
            busy: {
              entry: raise({ type: 'DRAG' }),
              on: {
                'POINTER.UP': {
                  target: 'done',
                },
                'DRAG.CANCEL': {
                  target: 'done',
                },
              },
            },
            done: {
              entry: raise({ type: 'DRAG.DONE' }),
              type: 'final',
            },
          },
        },
      },
    },
    touchHandler: {
      initial: 'active',
      states: {
        active: {
          on: {
            'TOUCH.START': {
              actions: [
                {
                  type: 'startTouches',
                  params: ({ event }) => ({ ev: event.ev }),
                },
              ],
              target: 'startDone',
            },
            'TOUCH.MOVE': {
              actions: {
                type: 'moveTouches',
                params: ({ event }) => ({ ev: event.ev }),
              },
              target: 'moveDone',
            },
            'TOUCH.END': {
              actions: {
                type: 'endTouches',
                params: ({ event }) => ({ ev: event.ev }),
              },
              target: 'endDone',
            },
          },
        },
        startDone: {
          entry: [raise({ type: 'TOUCH.START.DONE' })],
          always: 'active',
        },
        moveDone: {
          entry: raise({ type: 'TOUCH.MOVE.DONE' }),
          always: 'active',
        },
        endDone: {
          entry: raise({ type: 'TOUCH.END.DONE' }),
          always: 'active',
        },
      },
    },
    touchMonitor: {
      initial: 'inactive',
      states: {
        inactive: {
          on: {
            'TOUCH.MOVE.DONE': [
              {
                guard: and([or(['idle', 'sliding']), 'isMultiTouch']),
                target: 'active',
              },
            ],
          },
        },
        active: {
          entry: raise({ type: 'TOUCH' }),
          on: {
            'TOUCH.MOVE.DONE': [
              {
                guard: and(['touching', 'isZooming']),
                actions: ['zoomTouches', 'resetTouches'],
                target: 'zooming',
              },
            ],
            'TOUCH.END.DONE': [
              {
                guard: and(['isMultiTouchEnding']),
                actions: ['resetTouches'],
                target: 'done',
              },
            ],
          },
        },
        done: {
          entry: raise({ type: 'TOUCH.DONE' }),
          always: 'inactive',
        },
        zooming: {
          entry: raise({ type: 'ANIMATION.ZOOM' }),
          on: {
            'ANIMATION.DONE': {
              target: 'inactive',
            },
          },
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
