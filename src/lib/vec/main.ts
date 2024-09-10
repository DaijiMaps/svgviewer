import { ImmutableShallow } from '../utils'

type Vec = ImmutableShallow<{
  x: number
  y: number
}>

function vec(x: number, y: number): Vec {
  return { x, y }
}

const zero = vec(0, 0)
const one = vec(1, 1)

export type { Vec }

export { one, vec, zero }
