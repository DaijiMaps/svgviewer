import { ace, bdf, M, prod, V } from './main'

export type Apply = (m: M, v: V, n: number) => V

export function apply(m: M, v: V, n: number): V {
  return [prod(ace(m), v, n), prod(bdf(m), v, n)]
}

export type ApplyF = (n: number) => (v: V) => (m: M) => V

export const applyF: ApplyF = (n: number) => (v: V) => (m: M) => apply(m, v, n)
