import { ace, bdf, Matrix, prod, V } from './index'

export type Apply = (m: Matrix, v: V, n: number) => V

export function apply(m: Matrix, v: V, n: number): V {
  return [prod(ace(m), v, n), prod(bdf(m), v, n)]
}

type _ApplyF_ = (m: Matrix) => V
type _ApplyF__ = (v: V) => _ApplyF_
type _ApplyF___ = (n: number) => _ApplyF__

export type ApplyF = _ApplyF___

export const applyF: ApplyF = (n: number) => (v: V) => (m: Matrix) =>
  apply(m, v, n)
