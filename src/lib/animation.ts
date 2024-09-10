import { pipe } from 'effect'
import { boxMove, boxScaleAt } from './box/prefixed'
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
import { VecVec as Vec } from './vec/prefixed'

export const animationMoveLayout = (
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
