import { Vec } from './index'

export function scale<T extends Vec>(a: T, s: number): T {
  const x = a.x * s
  const y = a.y * s
  return { ...a, x, y }
}

export const scaleF =
  <T extends Vec>(s: number): ((_v: T) => T) =>
  (v: T) =>
    scale(v, s)
