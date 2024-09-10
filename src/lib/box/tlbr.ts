import { VecVec as Vec } from '../vec/prefixed'
import { B, Box } from './main'

//// TlBr
//// toTlBr
//// fromTlBr
//// tlBrToB
//// tlBrFromB

export type TlBr = Readonly<{ tl: Vec; br: Vec }>

export function toTlBr({ x, y, width, height }: Box): TlBr {
  return {
    tl: { x, y },
    br: { x: x + width, y: y + height },
  }
}

export function fromTlBr({ tl, br }: TlBr): Box {
  return {
    x: tl.x,
    y: tl.y,
    width: br.x - tl.x,
    height: br.y - tl.y,
  }
}

export function tlBrToB({ tl, br }: TlBr): B {
  return [
    [tl.x, tl.y],
    [br.x, br.y],
  ]
}

export function tlBrFromB([[tlx, tly], [brx, bry]]: B): TlBr {
  return {
    tl: { x: tlx, y: tly },
    br: { x: brx, y: bry },
  }
}
