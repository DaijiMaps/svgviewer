import { matrixScaleAt } from '../matrix/prefixed'
import { Box } from './main'
import { transform } from './transform'

//// scaleAt
//// scaleAtRatio
//// scaleAtCenter
//// scaleAtOff

export const scaleAt = (b: Box, s: number, cx: number, cy: number): Box =>
  transform(b, matrixScaleAt([s, s], [cx, cy]))

export const scaleAtRatio = (b: Box, s: number, rx: number, ry: number): Box =>
  scaleAt(b, s, b.x + b.width * rx, b.y + b.height * ry)

export const scaleAtCenter = (b: Box, s: number): Box =>
  scaleAtRatio(b, s, 0.5, 0.5)

export const scaleAtOff = (b: Box, s: number, dx: number, dy: number): Box =>
  scaleAt(b, s, b.x + b.width * 0.5 + dx, b.y + b.height * 0.5 + dy)
