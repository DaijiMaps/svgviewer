import { ImmutableShallow } from '../utils'
import { Vec } from '../vec'
import { multiply } from './multiply'

type Matrix = M

const empty: Matrix = [1, 0, 0, 1, 0, 0]

////

function matrix(
  a: number,
  b: number,
  c: number,
  d: number,
  e: number,
  f: number
): Matrix {
  return [a, b, c, d, e, f]
}

////

export type V = ImmutableShallow<[s: number, t: number]>
export type H = ImmutableShallow<[p: number, q: number, r: number]>
export type M = ImmutableShallow<
  [a: number, b: number, c: number, d: number, e: number, f: number]
>

export const vecToV = <T extends Vec>({ x, y }: T): V => [x, y]
export const vecFromV = ([x, y]: V): Vec => ({ x, y })

export const ab = ([a, b]: M): V => [a, b]
export const cd = ([, , c, d]: M): V => [c, d]
export const ef = ([, , , , e, f]: M): V => [e, f]

export const ace = ([a, , c, , e]: M): H => [a, c, e]
export const bdf = ([, b, , d, , f]: M): H => [b, d, f]

export const prod = ([p, q, r]: H, [s, t]: V, n: number): number =>
  p * s + q * t + r * n

////

function toString([a, b, c, d, e, f]: M): string {
  return `matrix(${a},${b},${c},${d},${e},${f})`
}

////

export type { Matrix }

export { empty, matrix, multiply, toString }
