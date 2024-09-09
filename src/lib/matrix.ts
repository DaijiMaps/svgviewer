import { ImmutableShallow } from './array'

type Vec = Readonly<{ x: number; y: number }>

type Matrix = ImmutableShallow<
  Readonly<[a: number, b: number, c: number, d: number, e: number, f: number]>
>

function prod(
  ra: number,
  rb: number,
  rc: number,
  ca: number,
  cb: number,
  cc: number
): number {
  return ra * ca + rb * cb + rc * cc
}

function apply([ma, mb, mc, md, me, mf]: Matrix, v: Vec): Vec {
  const x = prod(ma, mc, me, v.x, v.y, 1)
  const y = prod(mb, md, mf, v.x, v.y, 1)
  return { x, y }
}

function multiply(
  [pa, pb, pc, pd, pe, pf]: Matrix,
  [qa, qb, qc, qd, qe, qf]: Matrix
): Matrix {
  const a = prod(pa, pc, pe, qa, qb, 0)
  const b = prod(pb, pd, pf, qa, qb, 0)
  const c = prod(pa, pc, pe, qc, qd, 0)
  const d = prod(pb, pd, pf, qc, qd, 0)
  const e = prod(pa, pc, pe, qe, qf, 1)
  const f = prod(pb, pd, pf, qe, qf, 1)
  return [a, b, c, d, e, f]
}

export type { Matrix, Vec }

export { apply, multiply, prod }
