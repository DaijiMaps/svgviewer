import { Vec } from '../vec'

export function mul(a: Vec, b: Vec): Vec {
  const x = a.x * b.x
  const y = a.y * b.y
  return { x, y }
}

export const mulF =
  (b: Vec): ((_a: Vec) => Vec) =>
  (a: Vec) =>
    mul(a, b)
