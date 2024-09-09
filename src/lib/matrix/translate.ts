import { Matrix, V } from './index'

export function translate([tx, ty]: V): Matrix {
  return [1, 0, 0, 1, tx, ty]
}
