import { Vec } from '../vec'

export function div(a: Vec, b: Vec): Vec {
  const x = a.x / b.x
  const y = a.y / b.y
  return { x, y }
}

export const divF =
  (b: Vec): ((_a: Vec) => Vec) =>
  (a: Vec) =>
    div(a, b)
