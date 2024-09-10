import { ReadonlyDeep } from 'type-fest'
import { Box, boxCenter, boxCopy, boxMove, boxScaleAt } from './box'
import { LayoutCoord, makeCoord, toMatrixSvg } from './coord'
import { fit } from './fit'
import { getWindowSize } from './react-resize'
import { Move, Scale, transformPoint } from './transform'
import * as vec from './vec'
import { Vec } from './vec'

//// LayoutConfig
//// LayoutDrag
//// LayoutAnimation
//// LayoutAnimationZoom
//// Layout

export type LayoutConfig = ReadonlyDeep<{
  readonly body: Box
  readonly svg: Box
  readonly svgOffset: Move
  readonly svgScale: Scale
  readonly fontSize: number
  readonly fontSizeSvg: number
}>

export type LayoutDrag = ReadonlyDeep<{
  focus: Vec
  start: Box
  move: Box
}>

export type LayoutAnimationZoom = ReadonlyDeep<{
  svg: Box
  svgScale: Scale
  zoom: number
}>

export type LayoutAnimation = ReadonlyDeep<{
  move: null | Box
  zoom: null | LayoutAnimationZoom
}>

export type Layout = ReadonlyDeep<
  LayoutCoord & {
    config: LayoutConfig
  }
>

//// configLayout
//// makeLayout

export function configLayout(
  svg: Box, // svg
  origBody?: Box
): LayoutConfig {
  const body: Box = origBody !== undefined ? origBody : getWindowSize()
  const [[x, y], s] = fit(body, svg)

  const style = getComputedStyle(document.body)
  const fontSize = parseFloat(style.fontSize)
  const fontSizeSvg = fontSize * s

  return {
    body,
    svg,
    svgOffset: { x, y },
    svgScale: { s },
    fontSize,
    fontSizeSvg,
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
    svgOffset: vec.scale(layout.svgOffset, s),
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

export const zoomLayout = (
  layout: Layout,
  zoom: LayoutAnimationZoom
): Layout => {
  return {
    ...layout,
    svg: boxCopy(zoom.svg),
    svgScale: zoom.svgScale,
  }
}

export const recenterLayout = (layout: Layout, start: Box): Layout => {
  const d = vec.sub(layout.container, start)
  const dsvg = vec.scale(d, -layout.svgScale.s)

  return {
    ...layout,
    container: boxCopy(start),
    svg: boxMove(layout.svg, dsvg),
  }
}
