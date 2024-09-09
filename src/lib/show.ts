import { Box } from './box'

const arrayFromPoint = (p: { x: number; y: number }): number[] => [p.x, p.y]
const arrayFromBox = (b: Box): number[] => [b.x, b.y, b.width, b.height]
const arrayFromDOMMatrixReadOnly = (m: DOMMatrixReadOnly): number[] => [
  m.a,
  m.b,
  m.c,
  m.d,
  m.e,
  m.f,
]

//// showNumber
//// showArray

export const showBoolean = (b: boolean) => showNumber(Number(b))
export const showNumber = (n: number) =>
  Number.isInteger(n) ? n : n.toPrecision(4)
export const showArray = (a: number[]) => a.map(showNumber).join(' ')

//// showPoint
//// showBox
//// showDOMMatrixReadOnly

export const showPoint = (p: null | { x: number; y: number }): string =>
  p === null ? '-' : showArray(arrayFromPoint(p))
export const showBox = (b: Box): string => showArray(arrayFromBox(b))
export const showDOMMatrixReadOnly = (m: DOMMatrixReadOnly): string =>
  showArray(arrayFromDOMMatrixReadOnly(m))
