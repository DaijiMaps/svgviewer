import { AnyActorRef, assign, setup } from 'xstate'
import { Animation, animationEndLayout } from './animation'
import { BoxBox } from './box/prefixed'
import { Drag } from './drag'
import {
  expandLayoutCenter,
  Layout,
  LayoutConfig,
  makeLayout,
  recenterLayout,
  relocLayout,
  scrollLayout,
} from './layout'

export interface LayoutInput {
  parent: AnyActorRef
  layout: Layout
}

export interface LayoutContext {
  parent: AnyActorRef
  layout: Layout
}

export type LayoutEvent =
  | { type: 'LAYOUT.MAKE'; config: LayoutConfig }
  | { type: 'LAYOUT.RESET' }
  | { type: 'LAYOUT.EXPANDCENTER'; s: number }
  | { type: 'LAYOUT.RELOC'; drag: Drag }
  | { type: 'LAYOUT.RECENTER'; drag: Drag }
  | { type: 'LAYOUT.SCROLL'; scroll: BoxBox }
  | { type: 'LAYOUT.ENDANIMATION'; animation: Animation }

export const layoutMachine = setup({
  types: {
    input: {} as LayoutInput,
    context: {} as LayoutContext,
    events: {} as LayoutEvent,
  },
  actions: {
    make: assign({
      layout: (_, { config }: { config: LayoutConfig }) => makeLayout(config),
    }),
    reset: assign({
      layout: ({ context: { layout } }): Layout => makeLayout(layout.config),
    }),
    expandCenter: assign({
      layout: ({ context: { layout } }, { s }: { s: number }): Layout =>
        expandLayoutCenter(layout, s),
    }),
    reloc: assign({
      layout: ({ context: { layout } }, { drag }: { drag: Drag }): Layout =>
        relocLayout(layout, drag.move),
    }),
    recenter: assign({
      layout: ({ context: { layout } }, { drag }: { drag: Drag }): Layout =>
        recenterLayout(layout, drag.start),
    }),
    scroll: assign({
      layout: (
        { context: { layout } },
        { scroll }: { scroll: BoxBox }
      ): Layout => {
        return scrollLayout(layout, scroll)
      },
    }),
    endAnimation: assign({
      layout: (
        { context: { layout } },
        { animation }: { animation: Animation }
      ): Layout => animationEndLayout(layout, animation),
    }),
  },
}).createMachine({
  initial: 'Idle',
  context: ({ input: { parent, layout } }) => ({
    parent,
    layout,
  }),
  states: {
    Idle: {},
  },
})
