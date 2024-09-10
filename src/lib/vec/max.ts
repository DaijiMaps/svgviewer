import { Vec } from './index'
import { map2 } from './map'

export function max<T extends Vec>(a: T, b: T): T {
  return map2(a, b, Math.max)
}

export const maxF =
  <T extends Vec>(b: T): ((_a: T) => Vec) =>
  (a: T) =>
    max(a, b)
