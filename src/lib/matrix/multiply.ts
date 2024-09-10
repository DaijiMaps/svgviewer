import { ab, cd, ef, Matrix } from '.'
import { apply } from './apply'

export function multiply(p: Matrix, q: Matrix): Matrix {
  return [
    ...apply(p, ab(q), 0),
    ...apply(p, cd(q), 0),
    ...apply(p, ef(q), 1),
  ] as Matrix
}

type _MultiplyF_ = (p: Matrix) => Matrix
type _MultiplyF__ = (q: Matrix) => _MultiplyF_

export type MultiplyF = _MultiplyF__

export const multiplyF: MultiplyF = (q: Matrix) => (p: Matrix) => multiply(p, q)
