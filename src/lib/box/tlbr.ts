import { V } from '../matrix'
import { Box } from './main'

//// TlBr
//// toTlBr
//// fromTlBr

export type TlBr = Readonly<[tl: V, br: V]>

export function mapF([tl, br]: TlBr, f: (_v: V) => V): TlBr {
  return [f(tl), f(br)]
}

export function toTlBr({ x, y, width, height }: Box): TlBr {
  return [
    [x, y],
    [x + width, y + height],
  ]
}

export function fromTlBr([[tlx, tly], [brx, bry]]: TlBr): Box {
  return {
    x: tlx,
    y: tly,
    width: brx - tlx,
    height: bry - tly,
  }
}
