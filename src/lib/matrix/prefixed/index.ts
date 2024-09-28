import { apply, applyF } from '../apply'
import { empty, H, matrix, Matrix, prod, V } from '../main'
import { multiply, multiplyF } from '../multiply'
import { rotate } from '../rotate'
import { scale, scaleAt } from '../scale'
import { toString } from '../toString'
import { translate } from '../translate'

export type { H as matrixH, Matrix as MatrixMatrix, V as matrixV }

export {
  apply as matrixApply,
  applyF as matrixApplyF,
  empty as matrixEmpty,
  matrix as matrixMatrix,
  multiply as matrixMultiply,
  multiplyF as matrixMultiplyF,
  prod as matrixProd,
  rotate as matrixRotate,
  scale as matrixScale,
  scaleAt as matrixScaleAt,
  toString as matrixToString,
  translate as matrixTranslate,
}
