import { ReadonlyDeep } from 'type-fest'
import { AnimationZoom } from './animation'
import {
  BoxBox as Box,
  boxCenter,
  boxCopy,
  boxMove,
  boxScaleAt,
} from './box/prefixed'
import { LayoutCoord, makeCoord, toMatrixSvg } from './coord'
import { fit } from './fit'
import { getBodySize } from './react-resize'
import { Move, Scale, transformPoint } from './transform'
import { VecVec as Vec, vecScale, vecSub } from './vec/prefixed'

//// LayoutConfig
//// Layout

export type LayoutConfig = ReadonlyDeep<{
  readonly fontSize: number
  readonly body: Box
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
  const body: Box = origBody !== undefined ? origBody : getBodySize()
  const [[x, y], s] = fit(body, svg)

  return {
    fontSize,
    body,
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

//// expandLayoutCenter
//// expandLayout

export const expandLayoutCenter = (layout: Layout, expand: number): Layout => {
  return expandLayout(layout, expand, boxCenter(layout.container))
}

export const expandLayout = (layout: Layout, s: number, focus: Vec): Layout => {
  const o = transformPoint(toMatrixSvg(layout), focus)

  return {
    ...layout,
    container: boxScaleAt(layout.container, s, focus.x, focus.y),
    svgOffset: vecScale(layout.svgOffset, s),
    svg: boxScaleAt(layout.svg, s, o.x, o.y),
  }
}

//// moveLayout
//// zoomLayout
//// recenterLayout

export const moveLayout = (layout: Layout, move: Box): Layout => {
  return {
    ...layout,
    container: boxCopy(move),
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
  const d = vecSub(layout.container, start)
  const dsvg = vecScale(d, -layout.svgScale.s)

  return {
    ...layout,
    container: boxCopy(start),
    svg: boxMove(layout.svg, dsvg),
  }
}
