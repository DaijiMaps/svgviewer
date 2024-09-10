//// boxTransform

import { pipe } from 'effect'
import { apply, Matrix } from '../matrix'
import { Box, mapF } from './main'
import { fromTlBr, tlBrFromB, tlBrToB, toTlBr } from './tlbr'

export const transform = (b: Box, m: Matrix): Box =>
  pipe(
    b,
    toTlBr,
    tlBrToB,
    (b) => mapF(b, (v) => apply(m, v, 1)),
    tlBrFromB,
    fromTlBr
  )
