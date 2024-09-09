import { Vec } from '../vec'

export function scale(a: Vec, s: number): Vec {
  const x = a.x * s
  const y = a.y * s
  return { x, y }
}

export const scaleF =
  (s: number): ((_v: Vec) => Vec) =>
  (v: Vec) =>
    scale(v, s)
