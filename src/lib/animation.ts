import { pipe } from 'fp-ts/lib/function'
import { ReadonlyDeep } from 'type-fest'
import { Box } from './box'
import { boxMove, boxScaleAt } from './box/prefixed'
import { toMatrixSvg } from './coord'
import { Drag } from './drag'
import { Layout, relocLayout, zoomLayout } from './layout'
import { Scale, transformPoint, transformScale } from './transform'
import { zoomToScale } from './utils'
import { VecVec as Vec } from './vec/prefixed'

export type AnimationZoom = ReadonlyDeep<{
  svg: Box
  svgScale: Scale
  zoom: number
}>

export type Animation = ReadonlyDeep<{
  move: null | Box
  zoom: null | AnimationZoom
}>

export const animationMove = (drag: Drag, d: Vec): Animation => {
  return {
    move: boxMove(drag.start, d),
    zoom: null,
  }
}

export const animationZoom = (
  layout: Layout,
  zoom: number,
  z: number,
  focus: Vec
): Animation => {
  const s = 1 / zoomToScale(z)
  const o = transformPoint(toMatrixSvg(layout), focus)

  return {
    move: null,
    zoom: {
      svg: boxScaleAt(layout.svg, s, o.x, o.y),
      svgScale: transformScale(layout.svgScale, s),
      zoom: zoom + z,
    },
  }
}

export const animationEndLayout = (
  layout: Layout,
  animation: Animation
): Layout => {
  return pipe(
    layout,
    (l) => (animation.move === null ? l : relocLayout(l, animation.move)),
    (l) => (animation.zoom === null ? l : zoomLayout(l, animation.zoom))
  )
}
