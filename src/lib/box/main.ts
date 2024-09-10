import { Vec } from '../vec'

//// Box

export type Box = Readonly<
  Vec & {
    width: number
    height: number
  }
>

//// unit
//// copy
//// center
//// move
//// toViewbox

export const unit: Box = { x: 0, y: 0, width: 1, height: 1 }

export function copy(a: Box): Box {
  return { x: a.x, y: a.y, width: a.width, height: a.height }
}

export function center(o: Box): Vec {
  return { x: o.x + o.width * 0.5, y: o.y + o.height * 0.5 }
}

export function move(o: Box, v: Vec): Box {
  return { ...o, x: o.x + v.x, y: o.y + v.y }
}

export function toViewBox({ x, y, width, height }: Box): string {
  return `${x} ${y} ${width} ${height}`
}
