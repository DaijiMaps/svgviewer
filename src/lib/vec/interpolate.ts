import { add } from './add'
import { Vec } from './index'
import { scale } from './scale'

export function interpolate<T extends Vec>(a: T, b: T, t: number): T {
  return add(scale(b, t), scale(a, 1 - t))
}

type F = <T extends Vec>(_t: number) => (_b: T) => (_a: T) => T

export const interpolateF: F =
  <T extends Vec>(t: number) =>
  (b: T) =>
  (a: T) =>
    interpolate(a, b, t)
