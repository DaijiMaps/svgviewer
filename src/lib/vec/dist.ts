import { Vec } from './index'

export function dist<T extends Vec>(a: T, b: T): number {
  return Math.sqrt(qdist(a, b))
}

export const distF =
  <T extends Vec>(b: T) =>
  (a: T) =>
    dist(a, b)

export function qdist<T extends Vec>(a: T, b: T): number {
  return Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2)
}
