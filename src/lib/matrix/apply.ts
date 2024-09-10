import { ace, bdf, Matrix, prod, V } from './main'

export type Apply = (m: Matrix, v: V, n: number) => V

export function apply(m: Matrix, v: V, n: number): V {
  return [prod(ace(m), v, n), prod(bdf(m), v, n)]
}

export type ApplyF = (n: number) => (v: V) => (m: Matrix) => V

export const applyF: ApplyF = (n: number) => (v: V) => (m: Matrix) =>
  apply(m, v, n)
