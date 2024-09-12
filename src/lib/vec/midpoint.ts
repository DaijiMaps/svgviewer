import { Vec } from './main'
import { scale } from './scale'
import { sum } from './sum'

export function midpoint(ps: Readonly<Vec[]>): null | Vec {
  const q = sum(ps)

  return q === null ? null : scale(q, 1 / ps.length)
}
