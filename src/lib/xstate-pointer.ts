import { RefObject } from 'react'
import {
  ActorRefFrom,
  and,
  assign,
  not,
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
import { BoxBox, boxCenter } from './box/prefixed'
import { Drag, dragMove, dragStart } from './drag'
import { keyToDir, keyToZoom } from './key'
import {
  expandLayoutCenter,
  Layout,
  LayoutConfig,
  makeLayout,
  recenterLayout,
  relocLayout,
  scrollLayout,
} from './layout'
import { toggleMode } from './mode'
import {
  discardTouches,
  handleTouchEnd,
  handleTouchMove,
  handleTouchStart,
  isMultiTouch,
  isMultiTouchEnding,
  resetTouches,
  Touches,
} from './touch'
import { VecVec as Vec, vecScale, vecVec } from './vec/prefixed'
import { scrollMachine } from './xstate-scroll'

const DIST_LIMIT = 10

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
  mode: number
  expand: number
  z: number
  zoom: number
  touches: Touches
  drag: null | Drag
  animation: null | Animation
  debug: boolean
}

type PointerExternalEvent =
  | { type: 'LAYOUT'; config: LayoutConfig }
  | { type: 'LAYOUT.RESET' }
  | { type: 'DEBUG' }
  | { type: 'RENDERED' }
  | { type: 'ANIMATION.END' }
  | { type: 'SCROLL.GET.DONE'; scroll: BoxBox }
  | { type: 'SCROLL.SLIDE.DONE' }

type PointerInternalEvent =
  | { type: 'ANIMATION' }
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
  | { type: 'EXPAND'; n?: number }
  | { type: 'EXPAND.DONE' }
  | { type: 'EXPAND.EXPANDED' }
  | { type: 'EXPAND.RENDERED' }
  | { type: 'UNEXPAND' }
  | { type: 'UNEXPAND.DONE' }
  | { type: 'UNEXPAND.UNEXPANDED' }
  | { type: 'UNEXPAND.RENDERED' }
  | { type: 'ZOOM' }
  | { type: 'ZOOM.DONE' }
  | { type: 'SCROLL' }
  | { type: 'SCROLL.DONE' }

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

export type _PointerEvent =
  | PointerExternalEvent
  | PointerInternalEvent
  | PointerPointerEvent

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
    shouldToggleMode: (_, { ev }: { ev: KeyboardEvent }) => ev.key === 'm',
    isMultiTouch: ({ context: { touches } }) => isMultiTouch(touches),
    isMultiTouchEnding: ({ context: { touches } }) =>
      isMultiTouchEnding(touches),
    isExpanded: ({ context }) => context.expand !== 1,
    isTouchZooming: ({ context }) => context.touches.z !== null,
    isMoving: ({ context: { animation } }) =>
      animation !== null && animation.move !== null,
    isZooming: ({ context: { animation } }) =>
      animation !== null && animation.zoom !== null,
    isZoomingIn: ({ context: { z } }) => z !== null && z > 0,
    isAnimating: ({ context: { animation } }) => animation !== null,
    idle: and([
      stateIn({ Pointer: 'Idle' }),
      stateIn({ Dragger: 'Inactive' }),
      stateIn({ Slider: { PointerHandler: 'Inactive' } }),
      stateIn({ Animator: 'Inactive' }),
    ]),
    dragging: and([
      stateIn({ Pointer: 'Dragging' }),
      stateIn({ Dragger: 'Sliding' }),
      stateIn({ Slider: { PointerHandler: 'Inactive' } }),
      stateIn({ Animator: 'Inactive' }),
    ]),
    touching: and([
      stateIn({ Pointer: 'Touching' }),
      stateIn({ Dragger: 'Inactive' }),
      stateIn({ Slider: { PointerHandler: 'Inactive' } }),
      stateIn({ Animator: 'Inactive' }),
    ]),
    sliding: and([
      stateIn({ Pointer: 'Dragging' }),
      stateIn({ Dragger: 'Sliding' }),
      stateIn({ Slider: { PointerHandler: 'Active' } }),
      stateIn({ Animator: 'Inactive' }),
    ]),
    slidingDragBusy: and([
      stateIn({ Pointer: 'Dragging' }),
      stateIn({ Dragger: 'Sliding' }),
      stateIn({ Slider: { PointerHandler: 'Active' } }),
      stateIn({ Slider: { ScrollHandler: 'Busy' } }),
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
        pos: layout.scroll,
      })
    },
    slideScroll: ({ context: { layout, drag }, system }): void => {
      if (drag !== null) {
        system.get('scroll1').send({
          type: 'SLIDE',
          P: layout.scroll,
          Q: drag.move,
        })
      }
    },
    resetScroll: ({ context: { drag }, system }): void => {
      if (drag !== null) {
        system.get('scroll1').send({
          type: 'SYNC',
          pos: drag.start,
        })
      }
    },
    getScroll: ({ system }): void => {
      system.get('scroll1').send({
        type: 'GET',
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
        touches.z !== null ? touches.z : z,
      focus: ({ context: { focus, touches } }) =>
        touches.z !== null && touches.focus !== null ? touches.focus : focus,
    }),
    startZoom: assign({
      animation: ({ context: { layout, focus, z, zoom } }): null | Animation =>
        animationZoom(layout, zoom, z, focus),
      z: () => 0,
    }),
    endAnimation: assign({
      layout: ({ context: { layout, animation } }): Layout =>
        animation === null ? layout : animationEndLayout(layout, animation),
      zoom: ({ context: { animation, zoom } }): number =>
        animation === null || animation.zoom === null
          ? zoom
          : animation.zoom.zoom,
      animation: () => null,
    }),
    recenterLayout: assign({
      layout: ({ context: { layout, drag } }): Layout =>
        drag === null ? layout : recenterLayout(layout, drag.start),
    }),
    scrollLayout: assign({
      layout: (
        { context: { layout } },
        { scroll }: { scroll: BoxBox }
      ): Layout => {
        return scrollLayout(layout, scroll)
      },
    }),
    resetLayout: assign({
      layout: ({ context: { layout } }): Layout => makeLayout(layout.config),
      zoom: () => 0,
    }),
    resetFocus: assign({
      focus: ({ context: { layout } }): Vec => boxCenter(layout.container),
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
        dragStart(layout.scroll, focus),
    }),
    moveDrag: assign({
      drag: (
        { context: { drag } },
        { ev }: { ev: PointerEvent }
      ): null | Drag =>
        drag === null ? null : dragMove(drag, vecVec(ev.pageX, ev.pageY)),
    }),
    endDrag: assign({
      drag: () => null,
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
        drag === null ? layout : relocLayout(layout, drag.move),
      animation: () => null,
    }),
    startTouches: assign({
      touches: ({ context: { touches } }, { ev }: { ev: TouchEvent }) =>
        handleTouchStart(touches, ev),
    }),
    moveTouches: assign({
      touches: ({ context: { touches } }, { ev }: { ev: TouchEvent }) =>
        handleTouchMove(touches, ev, DIST_LIMIT),
    }),
    endTouches: assign({
      touches: ({ context: { touches } }, { ev }: { ev: TouchEvent }) =>
        handleTouchEnd(touches, ev),
    }),
    focusTouches: assign({
      focus: ({ context: { touches, focus } }) =>
        touches.focus !== null ? touches.focus : focus,
    }),
    resetTouches: assign({
      touches: () => resetTouches(),
      focus: ({ context: { touches, focus } }) =>
        touches.focus !== null ? touches.focus : focus,
    }),
    discardTouches: assign({
      touches: ({ context: { touches } }) => discardTouches(touches),
      focus: ({ context: { touches, focus } }) =>
        touches.focus !== null ? touches.focus : focus,
    }),
    toggleMode: assign({
      mode: ({ context: { mode } }) => toggleMode(mode),
    }),
  },
  actors: {
    scroll: scrollMachine,
  },
}).createMachine({
  type: 'parallel',
  id: 'pointer',
  context: ({ input: { containerRef, layout } }) => ({
    containerRef,
    layout,
    focus: boxCenter(layout.container),
    mode: 0,
    expand: 1,
    z: 0,
    zoom: 0,
    touches: resetTouches(),
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
            'LAYOUT.RESET': {
              actions: ['resetLayout', 'resetFocus'],
            },
            DEBUG: {
              actions: 'toggleDebug',
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
                // XXX Moving
                target: 'Animating',
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
                actions: ['resetLayout', 'resetFocus'],
              },
              {
                guard: {
                  type: 'shouldExpand',
                  params: ({ event }) => ({ ev: event.ev }),
                },
                target: 'Expanding',
              },
              {
                guard: {
                  type: 'shouldToggleMode',
                  params: ({ event }) => ({ ev: event.ev }),
                },
                target: 'Scrolling',
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
        Expanding: {
          initial: 'Checking',
          onDone: 'Idle',
          states: {
            Checking: {
              always: [
                {
                  guard: not('isExpanded'),
                  actions: raise({ type: 'EXPAND' }),
                  target: 'Expanding',
                },
                {
                  actions: raise({ type: 'UNEXPAND' }),
                  target: 'Expanding',
                },
              ],
            },
            Expanding: {
              on: {
                'EXPAND.DONE': {
                  target: 'Done',
                },
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
            'TOUCH.DONE': { target: 'Idle' },
          },
        },
        Animating: {
          entry: raise({ type: 'ANIMATION' }),
          on: {
            'ANIMATION.DONE': {
              target: 'Idle',
            },
          },
        },
        Zooming: {
          entry: raise({ type: 'ZOOM' }),
          on: {
            'ZOOM.DONE': {
              target: 'Idle',
            },
          },
        },
        Scrolling: {
          entry: raise({ type: 'SCROLL' }),
          on: {
            'SCROLL.DONE': {
              target: 'Idle',
            },
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
              target: 'Expanding',
            },
          },
        },
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
              target: 'Inactive',
            },
          },
        },
      },
    },
    Slider: {
      type: 'parallel',
      states: {
        PointerHandler: {
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
                'POINTER.MOVE': [
                  // XXX protect move handling with isMultiTouch
                  // XXX (checking context.touches directly/synchronously)
                  // XXX in-state guard is too slow to block moves
                  {
                    guard: and(['isMultiTouch', 'slidingDragBusy']),
                    target: 'Sliding',
                  },
                  {
                    guard: 'isMultiTouch',
                    target: 'Done',
                  },
                  {
                    guard: 'sliding',
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
                ],
                'SLIDE.DRAG.DONE': {
                  guard: not('slidingDragBusy'),
                  actions: 'endMove',
                  target: 'Active',
                },
                'POINTER.UP': [
                  {
                    guard: 'slidingDragBusy',
                    target: 'Sliding',
                  },
                  {
                    target: 'Done',
                  },
                ],
                'DRAG.CANCEL': [
                  {
                    guard: 'slidingDragBusy',
                    target: 'Sliding',
                  },
                  {
                    target: 'Done',
                  },
                ],
              },
            },
            Sliding: {
              on: {
                'SLIDE.DRAG.DONE': {
                  guard: not('slidingDragBusy'),
                  actions: 'endMove',
                  target: 'Done',
                },
              },
            },
            Done: {
              entry: raise({ type: 'SLIDE.DONE' }),
              always: 'Inactive',
            },
          },
        },
        ScrollHandler: {
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
                'SCROLL.SLIDE.DONE': {
                  actions: raise({ type: 'SLIDE.DRAG.DONE' }),
                  target: 'Idle',
                },
              },
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
                'endDrag',
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
              actions: raise({ type: 'UNEXPAND.DONE' }),
              target: 'Unexpanded',
            },
          },
        },
      },
    },
    Animator: {
      initial: 'Inactive',
      states: {
        Inactive: {
          on: {
            ANIMATION: {
              target: 'Animating',
            },
          },
        },
        Animating: {
          on: {
            'ANIMATION.END': [
              {
                guard: 'isMoving',
                actions: [
                  'endAnimation',
                  'recenterLayout',
                  'resetScroll',
                  'endDrag',
                ],
                target: 'Done',
              },
              {
                guard: 'isZooming',
                actions: 'endAnimation',
                target: 'Done',
              },
            ],
          },
        },
        Done: {
          entry: raise({ type: 'ANIMATION.DONE' }),
          always: 'Inactive',
        },
      },
    },
    PointerMonitor: {
      initial: 'Inactive',
      states: {
        Inactive: {
          on: {
            'POINTER.DOWN': {
              guard: 'idle',
              target: 'Active',
            },
          },
        },
        Active: {
          on: {
            'POINTER.MOVE': {
              target: 'Dragging',
            },
            'POINTER.UP': {
              actions: raise({ type: 'DRAG.DONE' }),
              target: 'Done',
            },
          },
        },
        Dragging: {
          entry: raise({ type: 'DRAG' }),
          on: {
            'POINTER.UP': {
              target: 'Done',
            },
            'DRAG.CANCEL': {
              target: 'Done',
            },
            'TOUCH.MOVE.DONE': {
              guard: 'isMultiTouch',
              target: 'Done',
            },
          },
        },
        Done: {
          entry: raise({ type: 'DRAG.DONE' }),
          always: 'Inactive',
        },
      },
    },
    TouchHandler: {
      on: {
        'TOUCH.START': [
          { guard: 'isAnimating' },
          {
            actions: [
              {
                type: 'startTouches',
                params: ({ event }) => ({ ev: event.ev }),
              },
              'focusTouches',
              raise({ type: 'TOUCH.START.DONE' }),
            ],
          },
        ],
        'TOUCH.MOVE': [
          { guard: 'isAnimating' },
          {
            actions: [
              {
                type: 'moveTouches',
                params: ({ event }) => ({ ev: event.ev }),
              },
              'focusTouches',
              raise({ type: 'TOUCH.MOVE.DONE' }),
            ],
          },
        ],
        'TOUCH.END': {
          actions: [
            {
              type: 'endTouches',
              params: ({ event }) => ({ ev: event.ev }),
            },
            'focusTouches',
            raise({ type: 'TOUCH.END.DONE' }),
          ],
        },
      },
    },
    TouchMonitor: {
      initial: 'Inactive',
      states: {
        Inactive: {
          on: {
            'TOUCH.START.DONE': {
              guard: 'isMultiTouch',
              actions: raise({ type: 'DRAG.CANCEL' }),
              target: 'Active',
            },
            'TOUCH.MOVE.DONE': {
              guard: 'isMultiTouch',
              actions: raise({ type: 'DRAG.CANCEL' }),
              target: 'Active',
            },
          },
        },
        Active: {
          entry: [raise({ type: 'TOUCH' })],
          on: {
            'TOUCH.MOVE.DONE': [
              {
                guard: not('touching'),
                target: 'Done',
              },
              {
                guard: and(['touching', 'isTouchZooming']),
                actions: 'zoomTouches',
                target: 'Zooming',
              },
            ],
            'TOUCH.END.DONE': {
              guard: 'isMultiTouchEnding',
              actions: 'resetTouches',
              target: 'Done',
            },
          },
        },
        Zooming: {
          entry: raise({ type: 'ZOOM' }),
          on: {
            'ZOOM.DONE': [
              {
                guard: not('isMultiTouch'),
                actions: 'resetTouches',
                target: 'Done',
              },
              {
                actions: 'discardTouches',
                target: 'Active',
              },
            ],
          },
        },
        Done: {
          entry: raise({ type: 'TOUCH.DONE' }),
          always: 'Inactive',
        },
      },
    },
    Zoomer: {
      initial: 'Idle',
      states: {
        Idle: {
          on: {
            ZOOM: [
              {
                guard: not('isZoomingIn'),
                actions: raise({ type: 'EXPAND', n: 3 }),
                target: 'Expanding',
              },
              {
                guard: 'isZoomingIn',
                actions: raise({ type: 'EXPAND', n: 1 }),
                target: 'Expanding',
              },
            ],
          },
        },
        Expanding: {
          on: {
            'EXPAND.DONE': {
              actions: 'startZoom',
              target: 'Animating',
            },
          },
        },
        Animating: {
          entry: raise({ type: 'ANIMATION' }),
          on: {
            'ANIMATION.DONE': {
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
          entry: raise({ type: 'ZOOM.DONE' }),
          always: 'Idle',
        },
      },
    },
    Scroller: {
      initial: 'Idle',
      states: {
        Idle: {
          entry: raise({ type: 'SCROLL.DONE' }),
          on: {
            SCROLL: {
              target: 'Expanding',
            },
          },
        },
        Expanding: {
          // XXX expand to fit the whole map
          entry: raise({ type: 'EXPAND', n: 9 }),
          on: {
            'EXPAND.DONE': {
              actions: 'toggleMode',
              target: 'Scrolling',
            },
          },
        },
        Scrolling: {
          on: {
            CLICK: {
              actions: ['toggleMode', 'getScroll'],
            },
            'SCROLL.GET.DONE': {
              actions: [
                {
                  type: 'scrollLayout',
                  params: ({ event: { scroll } }) => ({ scroll }),
                },
              ],
              target: 'Unexpanding',
            },
          },
        },
        Unexpanding: {
          entry: raise({ type: 'UNEXPAND' }),
          on: {
            'UNEXPAND.DONE': {
              target: 'Idle',
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
