import { Matrix, multiply, V } from './index'
import { translate } from './translate'

export function scale([sx, sy]: V): Matrix {
  return [
    [sx, 0],
    [0, sy],
    [0, 0],
  ]
}

export function scaleAt(s: V, c: V): Matrix {
  const [cx, cy] = c
  return [translate(c), scale(s), translate([-cx, -cy])].reduce((prev, cur) =>
    multiply(prev, cur)
  )
}
