import { BoxBox as Box } from './box/prefixed'
import { VecVec as Vec } from './vec/prefixed'

const arrayFromPoint = (p: Vec): number[] => [p.x, p.y]
const arrayFromBox = (b: Box): number[] => [b.x, b.y, b.width, b.height]

//// showNumber
//// showArray

export const showBoolean = (b: boolean) => showNumber(Number(b))
export const showNumber = (n: number) =>
  Number.isInteger(n) ? n : n.toPrecision(4)
export const showArray = (a: Readonly<number[]>) => a.map(showNumber).join(' ')

//// showPoint
//// showBox
//// showDOMMatrixReadOnly

export const showPoint = (p: null | Vec): string =>
  p === null ? '-' : showArray(arrayFromPoint(p))
export const showBox = (b: Box): string => showArray(arrayFromBox(b))
