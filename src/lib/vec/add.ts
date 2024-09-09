import { Vec } from '../vec'

export function add(a: Vec, b: Vec): Vec {
  const x = a.x + b.x
  const y = a.y + b.y
  return { x, y }
}

export const addF =
  (b: Vec): ((_a: Vec) => Vec) =>
  (a: Vec) =>
    add(a, b)
