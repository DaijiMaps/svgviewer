import { Vec } from './index'

export function mul<T extends Vec>(a: T, b: T): T {
  const x = a.x * b.x
  const y = a.y * b.y
  return { ...a, x, y }
}

export const mulF =
  <T extends Vec>(b: T): ((_a: T) => Vec) =>
  (a: T) =>
    mul(a, b)
