import { Vec } from './index'

export function div<T extends Vec>(a: T, b: T): T {
  const x = a.x / b.x
  const y = a.y / b.y
  return { ...a, x, y }
}

export const divF =
  <T extends Vec>(b: T): ((_a: T) => Vec) =>
  (a: T) =>
    div(a, b)
