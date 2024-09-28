import { ReadonlyDeep } from 'type-fest'
import { ImmutableShallow } from '../utils'

type Vec = Readonly<
  ImmutableShallow<{
    x: number
    y: number
  }>
>

type Vecs = ReadonlyDeep<Vec[]>

function vec(x: number, y: number): Vec {
  return { x, y }
}

const zero = vec(0, 0)
const one = vec(1, 1)

export type { Vec, Vecs }

export { one, vec, zero }
