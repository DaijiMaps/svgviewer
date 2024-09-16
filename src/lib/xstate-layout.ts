import { assign, setup } from 'xstate'
import { Animation, animationEndLayout } from './animation'
import { Drag } from './drag'
import {
  expandLayoutCenter,
  Layout,
  LayoutConfig,
  makeLayout,
  recenterLayout,
  relocLayout,
} from './layout'

export interface LayoutInput {
  layout: Layout
}

export interface LayoutContext {
  layout: Layout
}

export const layoutMachine = setup({
  types: {
    input: {} as LayoutInput,
    context: {} as LayoutContext,
  },
  actions: {
    layout: assign({
      layout: (_, { config }: { config: LayoutConfig }) => makeLayout(config),
    }),
    endZoom: assign({
      layout: (
        { context: { layout } },
        { animation }: { animation: Animation }
      ): Layout => animationEndLayout(layout, animation),
    }),
    recenterLayout: assign({
      layout: ({ context: { layout } }, { drag }: { drag: Drag }): Layout =>
        recenterLayout(layout, drag.start),
    }),
    resetLayout: assign({
      layout: ({ context: { layout } }): Layout => makeLayout(layout.config),
    }),
    expand: assign({
      layout: ({ context: { layout } }, { s }: { s: number }): Layout =>
        expandLayoutCenter(layout, s),
    }),
    endMove: assign({
      layout: ({ context: { layout } }, { drag }: { drag: Drag }): Layout =>
        relocLayout(layout, drag.move),
    }),
  },
}).createMachine({
  initial: 'Idle',
  context: ({ input: { layout } }) => ({
    layout,
  }),
  states: {
    Idle: {},
  },
})
