import { Box, boxExpandAt, boxScaleAt } from './box'

//// Viewport

export interface Viewport {
  outer: Box
  inner: Box
}

export const viewportExpandAt = (
  { outer, inner }: Viewport,
  s: number,
  cx: number,
  cy: number
): Viewport => {
  return {
    outer: boxScaleAt(outer, s, 0, 0),
    inner: boxExpandAt(inner, s, cx, cy),
  }
}
