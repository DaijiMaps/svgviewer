//// Box

import { pipe } from 'effect'
import { Matrix, V } from './matrix'
import { apply } from './matrix/apply'
import { scaleAt } from './matrix/scale'
import { Vec } from './vec'

//// Box
//// boxMove

export type Box = Readonly<
  Vec & {
    width: number
    height: number
  }
>

const boxUnit: Box = { x: 0, y: 0, width: 1, height: 1 }

function boxCopy(a: Box): Box {
  return { x: a.x, y: a.y, width: a.width, height: a.height }
}

/*
function boxAssign(a: Box, b: Box): void {
  a.x = b.x
  a.y = b.y
  a.width = b.width
  a.height = b.height
}
*/

function boxCenter(o: Box): Vec {
  return { x: o.x + o.width * 0.5, y: o.y + o.height * 0.5 }
}

function boxMove(o: Box, v: Vec): Box {
  return { ...o, x: o.x + v.x, y: o.y + v.y }
}

export { boxCenter, boxCopy, boxMove, boxUnit }

//// boxToViewbox

export function boxToViewBox({ x, y, width, height }: Box): string {
  return `${x} ${y} ${width} ${height}`
}

//// TlBr
//// boxToTlBr
//// boxFromTlBr

export type TlBr = Readonly<[tl: V, br: V]>

function mapF([tl, br]: TlBr, f: (_v: V) => V): TlBr {
  return [f(tl), f(br)]
}

export function boxToTlBr({ x, y, width, height }: Box): TlBr {
  return [
    [x, y],
    [x + width, y + height],
  ]
}

export function boxFromTlBr([[tlx, tly], [brx, bry]]: TlBr): Box {
  return {
    x: tlx,
    y: tly,
    width: brx - tlx,
    height: bry - tly,
  }
}

//// boxTransform

export const boxTransform = (b: Box, m: Matrix): Box =>
  pipe(b, boxToTlBr, (tlbr) => mapF(tlbr, (v) => apply(m, v, 1)), boxFromTlBr)

//// boxScaleAt
//// boxScaleAtRatio
//// boxScaleAtCenter
//// boxScaleAtOff

export const boxScaleAt = (b: Box, s: number, cx: number, cy: number): Box =>
  boxTransform(b, scaleAt([s, s], [cx, cy]))

export const boxScaleAtRatio = (
  b: Box,
  s: number,
  rx: number,
  ry: number
): Box => boxScaleAt(b, s, b.x + b.width * rx, b.y + b.height * ry)

export const boxScaleAtCenter = (b: Box, s: number): Box =>
  boxScaleAtRatio(b, s, 0.5, 0.5)

export const boxScaleAtOff = (b: Box, s: number, dx: number, dy: number): Box =>
  boxScaleAt(b, s, b.x + b.width * 0.5 + dx, b.y + b.height * 0.5 + dy)

//// boxExpandAt
//// boxExpandAtRatio
//// boxExpandAtCenter
//// boxExpandAtOff

export const boxExpandAt = (b: Box, s: number, cx: number, cy: number): Box => {
  const r = boxTransform(b, scaleAt([s, s], [cx, cy]))
  return {
    x: -r.x,
    y: -r.y,
    width: b.width,
    height: b.height,
  }
}

export const boxExpandAtRatio = (
  b: Box,
  s: number,
  rx: number,
  ry: number
): Box => boxExpandAt(b, s, b.x + b.width * rx, b.y + b.height * ry)

export const boxExpandAtCenter = (b: Box, s: number): Box =>
  boxExpandAtRatio(b, s, 0.5, 0.5)

export const boxExpandAtOff = (
  b: Box,
  s: number,
  dx: number,
  dy: number
): Box => boxExpandAt(b, s, b.x + b.width * 0.5 + dx, b.y + b.height * 0.5 + dy)
