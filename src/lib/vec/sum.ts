import { Vec } from './main'

export function sum(ps: Readonly<Vec[]>): null | Vec {
  return ps.length === 0
    ? null
    : ps.reduce((a, b) => ({ x: a.x + b.x, y: a.y + b.y }))
}
