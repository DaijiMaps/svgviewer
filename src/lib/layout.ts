import { pipe } from 'fp-ts/lib/function'
import { ReadonlyDeep } from 'type-fest'
import { AnimationZoom } from './animation'
import {
  BoxBox as Box,
  boxCenter,
  boxCopy,
  boxMove,
  boxScaleAt,
} from './box/prefixed'
import { fromScroll, LayoutCoord, makeCoord, toMatrixSvg } from './coord'
import { fit } from './fit'
import { getBodySize } from './react-resize'
import { Move, Scale, transformPoint } from './transform'
import { VecVec as Vec, vecScale, vecSub } from './vec/prefixed'

//// LayoutConfig
//// Layout

export type LayoutConfig = ReadonlyDeep<{
  readonly fontSize: number
  readonly container: Box
  readonly svg: Box
  readonly svgOffset: Move
  readonly svgScale: Scale
}>

export type Layout = ReadonlyDeep<
  LayoutCoord & {
    config: LayoutConfig
  }
>

//// configLayout
//// makeLayout

export function configLayout(
  fontSize: number,
  svg: Box,
  origBody?: Box
): LayoutConfig {
  const container: Box = origBody !== undefined ? origBody : getBodySize()
  const [[x, y], s] = fit(container, svg)

  return {
    fontSize,
    container,
    svg,
    svgOffset: { x, y },
    svgScale: { s },
  }
}

export function makeLayout(config: LayoutConfig): Layout {
  const coord = makeCoord(config)

  return {
    config,
    ...coord,
  }
}

export const toSvg = (layout: Layout, p: Vec): Vec =>
  transformPoint(toMatrixSvg(layout), p)

//// expandLayoutCenter
//// expandLayout

export const expandLayoutCenter = (layout: Layout, expand: number): Layout => {
  return expandLayout(layout, expand, boxCenter(layout.scroll))
}

export const expandLayout = (layout: Layout, s: number, focus: Vec): Layout => {
  const o = toSvg(layout, focus)

  return {
    ...layout,
    scroll: boxScaleAt(layout.scroll, s, focus.x, focus.y),
    svgOffset: vecScale(layout.svgOffset, s),
    svg: boxScaleAt(layout.svg, s, o.x, o.y),
  }
}

//// relocLayout
//// moveLayout
//// zoomLayout
//// recenterLayout
//// scrollLayout

export const relocLayout = (layout: Layout, dest: Box): Layout => {
  return {
    ...layout,
    scroll: boxCopy(dest),
  }
}

export const moveLayout = (layout: Layout, move: Vec): Layout => {
  return {
    ...layout,
    scroll: boxMove(layout.scroll, move),
  }
}

export const zoomLayout = (layout: Layout, zoom: AnimationZoom): Layout => {
  return {
    ...layout,
    svg: boxCopy(zoom.svg),
    svgScale: zoom.svgScale,
  }
}

export const recenterLayout = (layout: Layout, start: Box): Layout => {
  const d = vecSub(layout.scroll, start)
  const dsvg = vecScale(d, -layout.svgScale.s)

  return {
    ...layout,
    scroll: boxCopy(start),
    svg: boxMove(layout.svg, dsvg),
  }
}

export const scrollLayout = (layout: Layout, scroll: Box): Layout => {
  const move = vecSub(fromScroll(scroll), layout.scroll)
  return pipe(
    layout,
    (l) => moveLayout(l, move),
    (l) => recenterLayout(l, boxCopy(layout.scroll))
  )
}
