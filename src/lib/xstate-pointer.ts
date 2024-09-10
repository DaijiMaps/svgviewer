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
  animationMoveLayout,
  animationZoomLayout,
} from './animation'
import { boxCenter } from './box/prefixed'
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
  isMultiTouch,
  isMultiTouchEnding,
  isNotMultiTouch,
  Touches,
} from './touch'
import { VecVec as Vec, vecScale, vecVec } from './vec/prefixed'
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
    isMultiTouch: ({ context: { touches } }) => isMultiTouch(touches),
    isNotMultiTouch: ({ context: { touches } }) => isNotMultiTouch(touches),
    isMultiTouchEnding: ({ context: { touches } }) =>
      isMultiTouchEnding(touches),
    isZooming: ({ context }) => {
      return context.touches.zoom !== null
    },
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
        vecVec(ev.pageX, ev.pageY),
    }),
    dragStart: assign({
      drag: ({ context: { layout, focus } }): LayoutDrag =>
        dragStart(layout.container, focus),
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
          : animationMoveLayout(drag, vecScale(keyToDir(ev.key), relative)),
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
    Config: {
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
          },
        },
      },
    },
    Pointer: {
      initial: 'Idle',
      states: {
        Idle: {
          on: {
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
                  'dragStart',
                  {
                    type: 'animationMoveLayout',
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
                actions: {
                  type: 'zoomKey',
                  params: ({ event }) => ({ ev: event.ev }),
                },
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
          entry: raise({ type: 'EXPAND' }),
          on: {
            'EXPAND.DONE': {
              target: 'Idle',
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
                  target: 'Reflecting',
                },
              },
            },
            Reflecting: {
              entry: raise({ type: 'REFLECT' }),
              on: {
                'REFLECT.DONE': {
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
                  actions: 'dragEnd',
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
          on: {
            'EXPAND.EXPANDED': {
              target: 'Expanded',
            },
          },
        },
        Expanded: {
          on: {
            'EXPAND.RENDERED': {
              actions: ['syncScroll'],
              target: 'Done',
            },
          },
        },
        Done: {
          entry: raise({ type: 'EXPAND.DONE' }),
          always: 'Unexpanded',
        },
      },
    },
    Reflector: {
      initial: 'Expanded',
      states: {
        Expanded: {
          on: {
            REFLECT: {
              target: 'Reflecting',
            },
          },
        },
        Reflecting: {
          on: {
            'REFLECT.REFLECTED': {
              actions: [
                'recenterLayout',
                'resetScroll',
                { type: 'expand', params: { n: 1 } },
              ],
              target: 'Reflected',
            },
          },
        },
        Reflected: {
          on: {
            'REFLECT.RENDERED': {
              target: 'Done',
            },
          },
        },
        Done: {
          entry: raise({ type: 'REFLECT.DONE' }),
          always: 'Expanded',
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
              actions: ['zoomEnd', 'recenterLayout', 'resetScroll'],
              target: 'Done',
            },
          },
        },
        Zooming: {
          on: {
            'ANIMATION.END': {
              actions: ['zoomEnd'],
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
              actions: [
                {
                  type: 'startTouches',
                  params: ({ event }) => ({ ev: event.ev }),
                },
              ],
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
          entry: [raise({ type: 'TOUCH.START.DONE' })],
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
            'TOUCH.MOVE.DONE': [
              {
                guard: and([or(['idle', 'sliding']), 'isMultiTouch']),
                target: 'Active',
              },
            ],
          },
        },
        Active: {
          entry: raise({ type: 'TOUCH' }),
          on: {
            'TOUCH.MOVE.DONE': [
              {
                guard: and(['touching', 'isZooming']),
                actions: ['zoomTouches', 'resetTouches'],
                target: 'Zooming',
              },
            ],
            'TOUCH.END.DONE': [
              {
                guard: and(['isMultiTouchEnding']),
                actions: ['resetTouches'],
                target: 'Done',
              },
            ],
          },
        },
        Done: {
          entry: raise({ type: 'TOUCH.DONE' }),
          always: 'Inactive',
        },
        Zooming: {
          entry: raise({ type: 'ANIMATION.ZOOM' }),
          on: {
            'ANIMATION.DONE': {
              target: 'Inactive',
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
