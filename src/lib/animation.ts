import { pipe } from 'effect'
import { boxMove, boxScaleAt } from './box'
import { toMatrixSvg } from './coord'
import {
  Layout,
  LayoutAnimation,
  LayoutDrag,
  moveLayout,
  zoomLayout,
} from './layout'
import { transformPoint, transformScale } from './transform'
import { zoomToScale } from './utils'
import * as vec from './vec'
import { Vec } from './vec'

//// animationMoveLayout
//// animationZoomLayout

export const animationMoveLayout = (
  drag: LayoutDrag,
  dx: number,
  dy: number
): LayoutAnimation => {
  return {
    move: boxMove(drag.start, vec.vec(dx, dy)),
    zoom: null,
  }
}

export const animationMoveLayout2 = (
  drag: LayoutDrag,
  d: Vec
): LayoutAnimation => {
  return {
    move: boxMove(drag.start, d),
    zoom: null,
  }
}

export const animationZoomLayout = (
  layout: Layout,
  oz: number,
  z: number,
  focus: Vec
): LayoutAnimation => {
  const s = 1 / zoomToScale(z)
  const o = transformPoint(toMatrixSvg(layout), focus)

  return {
    move: null,
    zoom: {
      svg: boxScaleAt(layout.svg, s, o.x, o.y),
      svgScale: transformScale(layout.svgScale, s),
      zoom: oz + z,
    },
  }
}

//// animationEndLayout

export const animationEndLayout = (
  layout: Layout,
  animation: LayoutAnimation
): Layout => {
  return pipe(
    layout,
    (l) => (animation.move === null ? l : moveLayout(l, animation.move)),
    (l) => (animation.zoom === null ? l : zoomLayout(l, animation.zoom))
  )
}
