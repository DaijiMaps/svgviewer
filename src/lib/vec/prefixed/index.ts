import { add, addF } from '../add'
import { copy } from '../copy'
import { dist, qdist } from '../dist'
import { div, divF } from '../div'
import { interpolate, interpolateF } from '../interpolate'
import { one, vec, Vec, Vecs, zero } from '../main'
import { midpoint } from '../midpoint'
import { min, minF } from '../min'
import { mul, mulF } from '../mul'
import { scale, scaleF } from '../scale'
import { sub, subF } from '../sub'
import { sum } from '../sum'

export type { Vec as VecVec, Vecs as VecVecs }

export {
  add as vecAdd,
  addF as vecAddF,
  copy as vecCopy,
  dist as vecDist,
  div as vecDiv,
  divF as vecDivF,
  interpolate as vecInterpolate,
  interpolateF as vecInterpolateF,
  midpoint as vecMidpoint,
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
  sum as vecSum,
  vec as vecVec,
  zero as vecZero,
}
