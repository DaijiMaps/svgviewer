import { Vec } from '../vec'
import { map2 } from './map'

export function min(a: Vec, b: Vec): Vec {
  return map2(a, b, Math.min)
}

export const minF =
  (b: Vec): ((_a: Vec) => Vec) =>
  (a: Vec) =>
    min(a, b)
