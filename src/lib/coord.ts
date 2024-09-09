import { Box } from './box'
import type { LayoutConfig } from './layout'
import { Move, Scale } from './transform'

//// LayoutCoord
//// toMatrixOuter
//// toMatrixSvg

export interface LayoutCoord {
  // C: client coord
  // S: svg coord

  // bodyViewBox (C) size
  bodyViewBox: Box

  // container (C) -> svg (C)
  containerViewBox: Box

  // svg (C) -> svg viewbox (C)
  svgOffset: Move

  // svg viewbox ratio (C -> S)
  svgScale: Scale

  // v2i: svg viewbox (S) -> svg origin (S)
  svgViewBox: Box
}

export const makeCoord = ({
  bodyViewBox,
  svgViewBox,
  svgOffset,
  svgScale,
}: Readonly<LayoutConfig>): LayoutCoord => {
  return {
    bodyViewBox: structuredClone(bodyViewBox),
    containerViewBox: structuredClone(bodyViewBox),
    svgOffset: { x: -svgOffset.x, y: -svgOffset.y },
    svgScale,
    svgViewBox: structuredClone(svgViewBox),
  }
}

export const toMatrixOuter = ({
  containerViewBox,
}: Readonly<LayoutCoord>): DOMMatrixReadOnly => {
  return new DOMMatrixReadOnly().translate(
    -containerViewBox.x,
    -containerViewBox.y
  )
}

export const toMatrixSvg = ({
  containerViewBox,
  svgOffset,
  svgScale,
  svgViewBox,
}: Readonly<LayoutCoord>): DOMMatrixReadOnly => {
  return new DOMMatrixReadOnly()
    .translate(svgViewBox.x, svgViewBox.y)
    .scale(svgScale.s, svgScale.s)
    .translate(svgOffset.x, svgOffset.y)
    .translate(-containerViewBox.x, -containerViewBox.y)
}
