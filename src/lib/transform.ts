import { pipe } from 'effect'
import { Box } from './box'
import { Matrix, multiply, vecFromV, vecToV } from './matrix'
import { apply } from './matrix/apply'
import { Vec } from './vec'

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
  return [1, 0, 0, 1, x, y]
}
function fromScale({ s }: Scale): Matrix {
  return [s, 0, 0, s, 0, 0]
}
function fromTransform(xf: Transform): Matrix {
  return 'x' in xf ? fromMove(xf) : fromScale(xf)
}

export { fromTransform, transformMove, transformScale }

//// matrixTranslate
//// matrixScale

function matrixTranslate(x: Matrix, m: Move): Matrix {
  return multiply(x, fromMove(m))
}

function matrixScale(x: Matrix, s: Scale): Matrix {
  return multiply(x, fromScale(s))
}

export { matrixScale, matrixTranslate }

////

function transformPoint<T extends Vec>(m: Matrix, t: T): T {
  const { x, y } = pipe(t, vecToV, (v) => apply(m, v, 1), vecFromV)
  return { ...t, x, y }
}

export { transformPoint }
