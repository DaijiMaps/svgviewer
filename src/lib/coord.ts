import { BoxBox as Box, boxCopy } from './box/prefixed'
import type { LayoutConfig } from './layout'
import { MatrixMatrix as Matrix, matrixMultiply } from './matrix/prefixed'
import { fromTransform, invMove, Move, Scale } from './transform'

//// LayoutCoord
//// makeCoord
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

  // svg viewbox (S) -> svg origin (S)
  svg: Box
}

export const makeCoord = ({
  body,
  svg,
  svgOffset,
  svgScale,
}: Readonly<LayoutConfig>): LayoutCoord => {
  return {
    body: boxCopy(body),
    container: boxCopy(body),
    svgOffset: invMove(svgOffset),
    svgScale,
    svg: boxCopy(svg),
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
  ].reduce((a, b) => matrixMultiply(a, b))
}
