import { Vec } from './vec'

export interface Size {
  width: number
  height: number
}

// top, right, botton, left
export type Dir = 0 | 1 | 2 | 3

export function diag(size: Readonly<Size>, v: Vec): Dir {
  const a = size.width / size.height
  const p = v.x / v.y > a
  const q = Math.abs((size.width - v.x) / v.y) > a
  return p && q ? 0 : p && !q ? 1 : !p && !q ? 2 : 3
}
