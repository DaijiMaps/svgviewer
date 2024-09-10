import { scaleAt } from '../matrix'
import { Box } from './main'
import { transform } from './transform'

//// expandAt
//// expandAtRatio
//// expandAtCenter
//// expandAtOff

export const expandAt = (b: Box, s: number, cx: number, cy: number): Box => {
  const r = transform(b, scaleAt([s, s], [cx, cy]))
  return {
    x: -r.x,
    y: -r.y,
    width: b.width,
    height: b.height,
  }
}

export const expandAtRatio = (b: Box, s: number, rx: number, ry: number): Box =>
  expandAt(b, s, b.x + b.width * rx, b.y + b.height * ry)

export const expandAtCenter = (b: Box, s: number): Box =>
  expandAtRatio(b, s, 0.5, 0.5)

export const expandAtOff = (b: Box, s: number, dx: number, dy: number): Box =>
  expandAt(b, s, b.x + b.width * 0.5 + dx, b.y + b.height * 0.5 + dy)
