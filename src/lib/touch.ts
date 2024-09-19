import {
  number as Number,
  option as Option,
  readonlyArray as ReadonlyArray,
  readonlyMap as ReadonlyMap,
} from 'fp-ts'
import { pipe } from 'fp-ts/lib/function'
import { Touch } from 'react'
import { ReadonlyDeep } from 'type-fest'
import { isUndefined } from './utils'
import { dist } from './vec/dist'
import { VecVec as Vec, vecAngle, vecMidpoint, vecOrd } from './vec/prefixed'

const vecsOrd = ReadonlyArray.getOrd<Vec>(vecOrd)

const vecsWitherable = ReadonlyMap.getWitherable(Number.Ord)
const vecsFilterableWithIndex = ReadonlyMap.getFilterableWithIndex<number>()
const vecsMonoid = ReadonlyMap.getMonoid(
  Number.Eq,
  ReadonlyArray.getSemigroup<Vec>()
)

type VecsEntry = ReadonlyDeep<[number, Vec[]]>
type VecsEntries = ReadonlyDeep<VecsEntry[]>
type Vecs = ReadonlyDeep<Map<number, Vec[]>>

export type Touches = ReadonlyDeep<{
  vecs: Vecs
  points: Vec[]
  focus: null | Vec
  dists: number[]
  z: null | number
  horizontal: null | boolean
}>

function calcZoom([d0, d1, d2, d3]: Readonly<number[]>): null | number {
  return isUndefined(d0) ||
    isUndefined(d1) ||
    isUndefined(d2) ||
    isUndefined(d3)
    ? null
    : d0 < d1 && d1 < d2 && d2 < d3 // zoom-in
      ? -1
      : d0 > d1 && d1 > d2 && d2 > d3 // zoom-out
        ? 1
        : null
}

function updateDists(
  dists: Readonly<number[]>,
  d: number,
  limit: number
): Readonly<number[]> {
  const prev = dists.length > 0 ? dists[0] : d
  const l = Math.pow(prev - d, 2)
  return dists.length === 0 || l > limit / 10 ? [d, ...dists] : dists
}

export function vecsToPoints(vecs: Vecs): Readonly<Vec[]> {
  return pipe(
    vecs,
    ReadonlyMap.values(vecsOrd),
    ReadonlyArray.filterMap((vs) =>
      vs.length === 0 ? Option.none : Option.some(vs[0])
    )
  )
}

function pointsToFocus(points: Readonly<Vec[]>): null | Vec {
  return points.length < 2 ? null : vecMidpoint(points)
}

function changesToEntries(ev: ReadonlyDeep<TouchEvent>): VecsEntries {
  return pipe(
    ev.changedTouches,
    Array.from,
    ReadonlyArray.map<Touch, [number, Vec[]]>((t) => [
      t.identifier,
      [{ x: t.clientX, y: t.clientY }],
    ])
  )
}

function changesToVecs(ev: ReadonlyDeep<TouchEvent>): Vecs {
  return new Map(changesToEntries(ev))
}

export function handleTouchStart(
  touches: Touches,
  ev: Readonly<TouchEvent>
): Touches {
  const vecs: Vecs = vecsMonoid.concat(touches.vecs, changesToVecs(ev))
  const points = vecsToPoints(vecs)
  const focus = pointsToFocus(points)

  const horizontal =
    points.length !== 2 ? null : Math.abs(vecAngle(points[0], points[1])) < 0.5

  return { ...touches, vecs, points, focus, horizontal }
}

export function handleTouchMove(
  touches: Touches,
  ev: Readonly<TouchEvent>,
  limit: number
): Touches {
  const changes = changesToVecs(ev)
  const vecs = vecsWitherable.mapWithIndex(touches.vecs, (id, ovs) =>
    pipe(
      changes.get(id),
      Option.fromNullable,
      Option.fold(() => ovs, ReadonlyArray.concat(ovs))
    )
  )
  const points = vecsToPoints(vecs)
  const focus = pointsToFocus(points)
  const [p, q] = points
  if (focus === null || isUndefined(p) || isUndefined(q)) {
    return { ...touches, vecs, points, focus }
  }
  const dists = updateDists(touches.dists, dist(p, q), limit)
  const z = calcZoom(dists)
  return {
    vecs,
    points,
    focus,
    dists,
    z,
    horizontal: touches.horizontal,
  }
}

export function handleTouchEnd(
  touches: Touches,
  ev: Readonly<TouchEvent>
): Touches {
  const changes = changesToVecs(ev)
  const vecs: Vecs = vecsFilterableWithIndex.filterMapWithIndex(
    touches.vecs,
    (k: number, v: ReadonlyDeep<Vec[]>) =>
      // IDs in TouchEnd changedTouches => disappearing IDs
      changes.has(k) ? Option.none : Option.some(v)
  )
  const points = vecsToPoints(vecs)
  const focus = pointsToFocus(points)
  return {
    vecs,
    points,
    focus,
    dists: vecs.size === 0 ? [] : touches.dists,
    z: vecs.size === 0 ? null : touches.z,
    horizontal: touches.horizontal,
  }
}

export function resetTouches(): Touches {
  return {
    vecs: new Map(),
    points: [],
    focus: null,
    dists: [],
    z: null,
    horizontal: null,
  }
}

export function discardTouches(touches: Touches): Touches {
  const vecs = ReadonlyMap.map<ReadonlyDeep<Vec[]>, ReadonlyDeep<Vec[]>>(
    (ovs) =>
      pipe(
        ovs[0],
        Option.fromNullable,
        Option.fold(
          () => [],
          (v) => [v]
        )
      )
  )(touches.vecs)
  return { ...touches, vecs, dists: [], z: null }
}

export function isMultiTouch(touches: Touches): boolean {
  return touches.vecs.size >= 2
}

export function isMultiTouchEnding(touches: Touches): boolean {
  return touches.vecs.size === 0
}
