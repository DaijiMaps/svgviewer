//// zoomToScale

import { svgMapViewerConfig } from './config'

export const zoomToScale = (z: number) =>
  Math.pow(svgMapViewerConfig.zoomFactor, z)

//// isUndefined
//// isNotUndefined
//// isDefined
//// isNotDefined
//// isNull
//// isNotNull
//// isUndefinedOrNull
//// ifUndefinedOr
//// ifNullOr
//// ifUndefinedOrNullOr

type U = undefined
const U = undefined

type N = null
const N = null

export const isUndefined = <A>(a: U | A): a is U => a === U
export const isNotUndefined = <A>(a: U | A): a is A => a !== U
export const isDefined = <A>(a: U | A): a is A => !isUndefined(a)
export const isNotDefined = <A>(a: U | A): a is U => !isNotUndefined(a)

export const isNull = <A>(a: N | A): a is N => a === N
export const isNotNull = <A>(a: N | A): a is A => a !== N

export const isUndefinedOrNull = <A>(a: U | N | A): a is U | N =>
  isUndefined(a) || isNull(a)

export const ifUndefinedOr = <A>(a: U | A, b: A): A =>
  isNotUndefined(a) ? a : b
export const ifNullOr = <A>(a: N | A, b: A): A => (isNotNull(a) ? a : b)
export const ifUndefinedOrNullOr = <A>(a: U | N | A, b: A): A =>
  !isUndefinedOrNull(a) ? a : b

// https://www.npmjs.com/package/is-immutable-type

export type ImmutableShallow<T extends object> = {
  readonly [P in keyof T & {}]: T[P]
}
