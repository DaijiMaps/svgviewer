import { add, addF } from '../add'
import { copy } from '../copy'
import { dist, qdist } from '../dist'
import { div, divF } from '../div'
import { interpolate, interpolateF } from '../interpolate'
import { one, vec, Vec, zero } from '../main'
import { min, minF } from '../min'
import { mul, mulF } from '../mul'
import { scale, scaleF } from '../scale'
import { sub, subF } from '../sub'

export type { Vec as VecVec }

export {
  add as vecAdd,
  addF as vecAddF,
  copy as vecCopy,
  dist as vecDist,
  div as vecDiv,
  divF as vecDivF,
  interpolate as vecInterpolate,
  interpolateF as vecInterpolateF,
  min as vecMin,
  minF as vecMinF,
  mul as vecMul,
  mulF as vecMulF,
  one as vecOne,
  qdist as vecQdist,
  scale as vecScale,
  scaleF as vecScaleF,
  sub as vecSub,
  subF as vecSubF,
  vec as vecVec,
  zero as vecZero,
}
