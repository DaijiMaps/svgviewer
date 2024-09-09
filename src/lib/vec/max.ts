import { Vec } from '../vec'
import { map2 } from './map'

export function max(a: Vec, b: Vec): Vec {
  return map2(a, b, Math.max)
}

export const maxF =
  (b: Vec): ((_a: Vec) => Vec) =>
  (a: Vec) =>
    max(a, b)
