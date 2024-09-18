import { Vec } from './main'
import { sub } from './sub'

export function angle<T extends Vec>(a: T, b: T): number {
  const v = sub(a, b)
  return v.y / v.x
}

type F = <T extends Vec>(_b: T) => (_a: T) => number

export const angleF: F =
  <T extends Vec>(b: T) =>
  (a: T) =>
    angle(a, b)
