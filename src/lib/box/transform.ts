//// boxTransform

import { pipe } from 'effect'
import { apply, Matrix } from '../matrix'
import { Box } from './main'
import { fromTlBr, mapF, toTlBr } from './tlbr'

export const transform = (b: Box, m: Matrix): Box =>
  pipe(b, toTlBr, (tlbr) => mapF(tlbr, (v) => apply(m, v, 1)), fromTlBr)
