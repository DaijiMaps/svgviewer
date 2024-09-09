import { Vec } from '../vec'

export function sub(a: Vec, b: Vec): Vec {
  const x = a.x - b.x
  const y = a.y - b.y
  return { x, y }
}

export const subF =
  (b: Vec): ((_a: Vec) => Vec) =>
  (a: Vec) =>
    sub(a, b)
