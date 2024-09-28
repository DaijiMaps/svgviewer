import { BoxBox as Box } from './box/prefixed'
import {
  MatrixMatrix as Matrix,
  matrixApply,
  matrixMultiply,
} from './matrix/prefixed'
import { VecVec as Vec } from './vec/prefixed'

//// Transform
//// Move
//// Scale
//// Matrix

export type Transform = Move | Scale
export type Move = Readonly<Vec>
export type Scale = Readonly<{ s: number }>

//// transformMove
//// transformScale

function transformMove(xf: Move, x: number, y: number): Move
function transformMove(xf: Box, x: number, y: number): Box
function transformMove(xf: Move | Box, x: number, y: number): Move | Box {
  return {
    ...xf,
    x: xf.x + x,
    y: xf.y + y,
  }
}

function transformScale(xf: Move, s: number): Move
function transformScale(xf: Scale, s: number): Scale
function transformScale(xf: Move | Scale, s: number) {
  return 'x' in xf ? { x: xf.x * s, y: xf.y * s } : { s: xf.s * s }
}

//// invMove
//// invScale
//// invTransform

function invMove({ x, y }: Move): Move {
  return { x: -x, y: -y }
}
function invScale({ s }: Scale): Scale {
  return { s: 1 / s }
}
function invTransform(xf: Transform): Transform {
  return 'x' in xf ? invMove(xf) : invScale(xf)
}

export { invMove, invScale, invTransform }

//// fromMove
//// fromScale
//// fromTransform

function fromMove({ x, y }: Move): Matrix {
  return [
    [1, 0],
    [0, 1],
    [x, y],
  ]
}
function fromScale({ s }: Scale): Matrix {
  return [
    [s, 0],
    [0, s],
    [0, 0],
  ]
}
function fromTransform(xf: Transform): Matrix {
  return 'x' in xf ? fromMove(xf) : fromScale(xf)
}

export { fromTransform, transformMove, transformScale }

//// matrixTranslate
//// matrixScale

function matrixTranslate(x: Readonly<Matrix>, m: Move): Matrix {
  return matrixMultiply(x, fromMove(m))
}

function matrixScale(x: Readonly<Matrix>, s: Scale): Matrix {
  return matrixMultiply(x, fromScale(s))
}

export { matrixScale, matrixTranslate }

////

function transformPoint<T extends Vec>(m: Readonly<Matrix>, t: T): T {
  const { x, y } = t
  const [p, q] = matrixApply(m, [x, y], 1)
  return { ...t, x: p, y: q }
}

export { transformPoint }
