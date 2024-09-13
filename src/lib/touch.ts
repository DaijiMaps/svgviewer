import { ReadonlyDeep } from 'type-fest'
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

function calcZoom(dists: Readonly<number[]>): null | number {
  if (dists.length >= 3) {
    const [d0, d1, d2] = dists
    const z = d0 < d1 && d1 < d2 ? -1 : d0 > d1 && d1 > d2 ? 1 : 0
    if (z !== 0) {
      return z
    }
  }
  return null
}

function updateDists(
  dists: Readonly<number[]>,
  dd: number,
  limit: number
): Readonly<number[]> {
  const prev = dists.length > 0 ? dists[0] : dd
  const l = Math.pow(prev - dd, 2)
  // XXX limit
  if (dists.length === 0 || l > limit / 10) {
    return [dd, ...dists]
  } else {
    return dists
  }
}

export function vecsToPoints(vecs: Vecs): Readonly<Vec[]> {
  return [...vecs.values()].flatMap((vs: Readonly<Vec[]>) =>
    vs.length === 0 ? [] : [vs[0]]
  )
}

function pointsToFocus(points: Readonly<Vec[]>): null | Vec {
  return points.length < 2 ? null : vecMidpoint(points)
}

export function handleTouchStart(
  touches: Touches,
  ev: Readonly<TouchEvent>
): Touches {
  const entries: VecsEntries = [...ev.changedTouches].map((t) => [
    t.identifier,
    [{ x: t.clientX, y: t.clientY }],
  ])
  const vecs: Vecs = new Map([...touches.vecs.entries(), ...entries])
  const points = vecsToPoints(vecs)
  const focus = pointsToFocus(points)
  return { ...touches, vecs, points, focus }
}

export function handleTouchMove(
  touches: Touches,
  ev: Readonly<TouchEvent>,
  limit: number
): Touches {
  const pqs = new Map(
    [...ev.changedTouches].flatMap((t) => {
      const vs = touches.vecs.get(t.identifier)
      if (vs === undefined || vs.length === 0) {
        return []
      }
      const prev = vs[0]
      const v = { x: t.clientX, y: t.clientY }
      const vd = dist(prev, v)
      // XXX limit
      if (vd < limit / 10) {
        return []
      }
      return [[t.identifier, v]]
    })
  )
  const vecs: Vecs = new Map(
    [...touches.vecs.entries()].map(([id, vs]) => {
      const v = pqs.get(id)
      return v !== undefined ? [id, [v, ...vs]] : [id, vs]
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
  const ids = new Set([...ev.changedTouches].map((t) => t.identifier))
  const vecs = new Map(
    [...touches.vecs.entries()].filter(([id]) => !ids.has(id))
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
  if (touches.vecs.size < 2) {
    return false
  }
  const [ps, qs] = touches.vecs.values()
  return (
    ps !== undefined && ps.length !== 0 && qs !== undefined && qs.length !== 0
  )
}

export function isNotMultiTouch(touches: Touches): boolean {
  return touches.vecs.size < 2
}

export function isMultiTouchEnding(touches: Touches): boolean {
  return touches.vecs.size === 0
}
