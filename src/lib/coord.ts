import { BoxBox as Box, boxCopy } from './box/prefixed'
import type { LayoutConfig } from './layout'
import { MatrixMatrix as Matrix, matrixMultiply } from './matrix/prefixed'
import { fromTransform, invMove, Move, Scale } from './transform'
import { vecScale } from './vec/prefixed'

//// LayoutCoord
//// makeCoord
//// toMatrixOuter
//// toMatrixSvg

export interface LayoutCoord {
  // C: client coord
  // S: svg coord

  // container (C) size
  container: Box

  // scroll (C) -> svg (C)
  scroll: Box

  // svg (C) -> svg viewbox (C)
  svgOffset: Move

  // svg viewbox ratio (C -> S)
  svgScale: Scale

  // svg viewbox (S) -> svg origin (S)
  svg: Box
}

export const makeCoord = ({
  container,
  svg,
  svgOffset,
  svgScale,
}: Readonly<LayoutConfig>): LayoutCoord => {
  return {
    container: boxCopy(container),
    scroll: boxCopy(container),
    svgOffset: invMove(svgOffset),
    svgScale,
    svg: boxCopy(svg),
  }
}

export const toMatrixOuter = ({ scroll }: Readonly<LayoutCoord>): Matrix => {
  return fromTransform(invMove(scroll))
}

export const toMatrixSvg = ({
  scroll,
  svgOffset,
  svgScale,
  svg,
}: Readonly<LayoutCoord>): Matrix => {
  return [
    fromTransform(svg),
    fromTransform(svgScale),
    fromTransform(svgOffset),
    fromTransform(invMove(scroll)),
  ].reduce((a, b) => matrixMultiply(a, b))
}

// inverse x/y
export const fromScroll = (s: Box): Box => vecScale(s, -1)
export const toScroll = (s: Box): Box => vecScale(s, -1)
