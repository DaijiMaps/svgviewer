import { apply } from './apply'
import { ab, cd, ef, Matrix } from './main'

export function multiply(p: Matrix, q: Matrix): Matrix {
  return [apply(p, ab(q), 0), apply(p, cd(q), 0), apply(p, ef(q), 1)]
}

export type MultiplyF = (q: Matrix) => (p: Matrix) => Matrix

export const multiplyF: MultiplyF = (q: Matrix) => (p: Matrix) => multiply(p, q)
