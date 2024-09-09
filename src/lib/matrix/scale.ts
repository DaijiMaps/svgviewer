import { Matrix, V } from './index'

export function scale([sx, sy]: V): Matrix {
  return [sx, 0, 0, sy, 0, 0]
}
