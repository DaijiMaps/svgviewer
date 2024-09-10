import { add, addF } from './add'
//import { assignA, oneA, zeroA } from './assign'
//import { copy } from './copy'
import { ImmutableShallow } from '../array'
import { dist, qdist } from './dist'
import { div, divF } from './div'
import { interpolate, interpolateF } from './interpolate'
import { min, minF } from './min'
import { mul, mulF } from './mul'
import { scale, scaleF } from './scale'
import { sub, subF } from './sub'

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

export {
  add,
  addF,
  //assignA,
  //copy,
  dist,
  div,
  divF,
  interpolate,
  interpolateF,
  min,
  minF,
  mul,
  mulF,
  one,
  //oneA,
  qdist,
  scale,
  scaleF,
  sub,
  subF,
  vec,
  zero,
}
