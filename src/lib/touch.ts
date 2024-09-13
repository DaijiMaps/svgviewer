import { ReadonlyDeep } from 'type-fest'
import { isUndefined } from './utils'
import { dist } from './vec/dist'
import { VecVec as Vec, vecMidpoint } from './vec/prefixed'

type Vecs = ReadonlyDeep<Map<number, Vec[]>>
type VecsEntry = ReadonlyDeep<[number, Vec[]]>
type VecsEntries = ReadonlyDeep<VecsEntry[]>

export type Touches = ReadonlyDeep<{
  vecs: Vecs
  points: Vec[]
  focus: null | Vec
  dists: number[]
  z: null | number
}>

function calcZoom([d0, d1, d2]: Readonly<number[]>): null | number {
  return isUndefined(d0) || isUndefined(d1) || isUndefined(d2)
    ? null
    : d0 < d1 && d1 < d2 // zoom-in
      ? -1
      : d0 > d1 && d1 > d2 // zoom-out
        ? 1
        : null
}

function updateDists(
  dists: Readonly<number[]>,
  dd: number,
  limit: number
): Readonly<number[]> {
  const prev = dists.length > 0 ? dists[0] : dd
  const l = Math.pow(prev - dd, 2)
  return dists.length === 0 || l > limit / 10 ? [dd, ...dists] : dists
}

export function vecsToPoints(vecs: Vecs): Readonly<Vec[]> {
  return Array.from(vecs.values()).flatMap((vs: Readonly<Vec[]>) =>
    vs.length === 0 ? [] : [vs[0]]
  )
}

function pointsToFocus(points: Readonly<Vec[]>): null | Vec {
  return points.length < 2 ? null : vecMidpoint(points)
}

function changesToEntries(ev: ReadonlyDeep<TouchEvent>): VecsEntries {
  return Array.from(ev.changedTouches).map((t) => [
    t.identifier,
    [{ x: t.clientX, y: t.clientY }],
  ])
}

export function handleTouchStart(
  touches: Touches,
  ev: Readonly<TouchEvent>
): Touches {
  const entries: VecsEntries = changesToEntries(ev)
  // XXX Map.concat
  const vecs: Vecs = new Map(entries.concat(Array.from(touches.vecs.entries())))
  const points = vecsToPoints(vecs)
  const focus = pointsToFocus(points)
  return { ...touches, vecs, points, focus }
}

export function handleTouchMove(
  touches: Touches,
  ev: Readonly<TouchEvent>,
  limit: number
): Touches {
  const changes = new Map(changesToEntries(ev))
  const vecs: Vecs = new Map(
    // XXX Map.merge
    Array.from(touches.vecs.entries()).map(([id, ovs]) => {
      const vs = changes.get(id)
      return vs !== undefined ? [id, [...vs, ...ovs]] : [id, ovs]
    })
  )
  const points = vecsToPoints(vecs)
  const focus = pointsToFocus(points)
  if (points.length < 2 || focus === null) {
    return { ...touches, vecs, points, focus }
  }
  const [p, q] = points
  const dists = updateDists(touches.dists, dist(p, q), limit)
  const z = calcZoom(dists)
  return {
    vecs,
    points,
    focus,
    dists,
    z,
  }
}

export function handleTouchEnd(
  touches: Touches,
  ev: Readonly<TouchEvent>
): Touches {
  const changes = new Map(changesToEntries(ev))
  const vecs = new Map(
    // XXX Map.filter
    Array.from(touches.vecs.entries()).filter(([id]) => !changes.has(id))
  )
  const points = vecsToPoints(vecs)
  const focus = pointsToFocus(points)
  return {
    vecs,
    points,
    focus,
    dists: vecs.size === 0 ? [] : touches.dists,
    z: vecs.size === 0 ? null : touches.z,
  }
}

export function isMultiTouch(touches: Touches): boolean {
  return touches.vecs.size >= 2
}

export function isMultiTouchEnding(touches: Touches): boolean {
  return touches.vecs.size === 0
}
