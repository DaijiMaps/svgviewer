import { Dir } from './dir'
import { Vec } from './vec'

export interface Size {
  width: number
  height: number
}

export function diag(size: Readonly<Size>, v: Vec): Dir {
  const a = size.width / size.height
  const p = v.x / v.y > a
  const q = Math.abs((size.width - v.x) / v.y) > a
  return p && q ? 0 : p && !q ? 1 : !p && !q ? 2 : 3
}
