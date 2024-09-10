import { Vec } from './index'

export function sub<T extends Vec>(a: T, b: T): T {
  const x = a.x - b.x
  const y = a.y - b.y
  return { ...a, x, y }
}

export const subF =
  <T extends Vec>(b: T): ((_a: T) => Vec) =>
  (a: T) =>
    sub(a, b)
