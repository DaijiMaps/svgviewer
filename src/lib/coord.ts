import { Box } from './box'
import type { LayoutConfig } from './layout'
import { Matrix, multiply } from './matrix'
import { fromTransform, invMove, Move, Scale } from './transform'

//// LayoutCoord
//// toMatrixOuter
//// toMatrixSvg

export interface LayoutCoord {
  // C: client coord
  // S: svg coord

  // body (C) size
  body: Box

  // container (C) -> svg (C)
  container: Box

  // svg (C) -> svg viewbox (C)
  svgOffset: Move

  // svg viewbox ratio (C -> S)
  svgScale: Scale

  // v2i: svg viewbox (S) -> svg origin (S)
  svg: Box
}

export const makeCoord = ({
  body,
  svg,
  svgOffset,
  svgScale,
}: Readonly<LayoutConfig>): LayoutCoord => {
  return {
    body: structuredClone(body),
    container: structuredClone(body),
    svgOffset: invMove(svgOffset),
    svgScale,
    svg: structuredClone(svg),
  }
}

export const toMatrixOuter = ({ container }: Readonly<LayoutCoord>): Matrix => {
  return fromTransform(invMove(container))
}

export const toMatrixSvg = ({
  container,
  svgOffset,
  svgScale,
  svg,
}: Readonly<LayoutCoord>): Matrix => {
  return [
    fromTransform(svg),
    fromTransform(svgScale),
    fromTransform(svgOffset),
    fromTransform(invMove(container)),
  ].reduce((a, b) => multiply(a, b))
}
