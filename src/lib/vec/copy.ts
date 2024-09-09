import { vec } from '.'
import { Vec } from '../vec'

export function copy(src: Vec): Vec {
  return vec(src.x, src.y)
}
