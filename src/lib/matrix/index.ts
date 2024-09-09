export type Matrix = [
  a: number,
  b: number,
  c: number,
  d: number,
  e: number,
  f: number,
]

export function matrix(
  a: number,
  b: number,
  c: number,
  d: number,
  e: number,
  f: number
): Matrix {
  return [a, b, c, d, e, f]
}

export type H = [p: number, q: number, r: number]
export type V = [s: number, t: number]

export const ab = ([a, b]: Matrix): V => [a, b]
export const cd = ([, , c, d]: Matrix): V => [c, d]
export const ef = ([, , , , e, f]: Matrix): V => [e, f]

export const ace = ([a, , c, , e]: Matrix): H => [a, c, e]
export const bdf = ([, b, , d, , f]: Matrix): H => [b, d, f]

export const prod = ([p, q, r]: H, [s, t]: V, n: number): number =>
  p * s + q * t + r * n
