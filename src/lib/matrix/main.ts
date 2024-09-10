import { ImmutableShallow } from '../utils'
import { Vec } from '../vec'
import { multiply } from './multiply'

type Matrix = ImmutableShallow<
  [a: number, b: number, c: number, d: number, e: number, f: number]
>

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

export type H = ImmutableShallow<[p: number, q: number, r: number]>
export type V = ImmutableShallow<[s: number, t: number]>

export const vecToV = <T extends Vec>({ x, y }: T): V => [x, y]
export const vecFromV = ([x, y]: V): Vec => ({ x, y })

export const ab = ([a, b]: Matrix): V => [a, b]
export const cd = ([, , c, d]: Matrix): V => [c, d]
export const ef = ([, , , , e, f]: Matrix): V => [e, f]

export const ace = ([a, , c, , e]: Matrix): H => [a, c, e]
export const bdf = ([, b, , d, , f]: Matrix): H => [b, d, f]

export const prod = ([p, q, r]: H, [s, t]: V, n: number): number =>
  p * s + q * t + r * n

////

function toString([a, b, c, d, e, f]: Matrix): string {
  return `matrix(${a},${b},${c},${d},${e},${f})`
}

////

export type { Matrix }

export { empty, matrix, multiply, toString }
