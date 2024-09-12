/* eslint-disable functional/immutable-data */
/* eslint-disable functional/no-conditional-statements */
/* eslint-disable functional/no-expression-statements */
/* eslint-disable functional/prefer-immutable-types */
/* eslint-disable functional/no-loop-statements */
import { dist } from './vec/dist'
import { VecVec as Vec, vecInterpolate, vecMidpoint } from './vec/prefixed'

export interface Zoom {
  p: Vec
  dir: number
}

export interface Touches {
  vecs: Map<number, Vec[]>
  dists: number[]
  zoom: null | Zoom
  focus: null | Vec
}

function calcZoom(dists: Readonly<number[]>, p: Vec): null | Zoom {
  if (dists.length >= 3) {
    const [d0, d1, d2] = dists
    const dir = d0 < d1 && d1 < d2 ? -1 : d0 > d1 && d1 > d2 ? 1 : 0
    if (dir !== 0) {
      return { p, dir }
    }
  }
  return null
}

function updateDists(dists: number[], dd: number, limit: number): number[] {
  const prev = dists.length > 0 ? dists[0] : dd
  const l = Math.pow(prev - dd, 2)
  // XXX limit
  if (dists.length === 0 || l > limit / 10) {
    dists.unshift(dd)
  }
  return dists
}

export function vecsToPoints(vecs: Map<number, Vec[]>): Vec[] {
  return [...vecs.values()].flatMap((vs: Vec[]) =>
    vs.length === 0 ? [] : [vs[0]]
  )
}

function vecsToFocus(vecs: Map<number, Vec[]>): null | Vec {
  return vecs.size < 2 ? null : vecMidpoint(vecsToPoints(vecs))
}

export function handleTouchStart(touches: Touches, ev: TouchEvent): Touches {
  const vecs = structuredClone(touches.vecs)
  for (const t of ev.changedTouches) {
    const v = { x: t.clientX, y: t.clientY }
    vecs.set(t.identifier, [v])
  }
  return { ...touches, vecs, focus: vecsToFocus(vecs) }
}

export function handleTouchMove(
  touches: Touches,
  ev: TouchEvent,
  limit: number
): Touches {
  const vecs = structuredClone(touches.vecs)
  const points: Vec[] = []
  for (const t of ev.changedTouches) {
    const vs = vecs.get(t.identifier)
    if (vs === undefined || vs.length === 0) {
      continue
    }
    const prev = vs[0]
    const v = { x: t.clientX, y: t.clientY }
    const vd = dist(prev, v)
    // XXX limit
    if (vd < limit / 10) {
      continue
    }
    vs.unshift(v)
    vecs.set(t.identifier, vs)
    points.unshift(v)
  }
  if (points.length < 2) {
    return { ...touches, vecs }
  }
  const [p, q] = points
  const dists = updateDists(structuredClone(touches.dists), dist(p, q), limit)
  const zoom = calcZoom(dists, vecInterpolate(p, q, 0.5))
  return { vecs, dists, zoom, focus: vecsToFocus(vecs) }
}

export function handleTouchEnd(touches: Touches, ev: TouchEvent): Touches {
  const vecs = structuredClone(touches.vecs)
  for (const t of ev.changedTouches) {
    vecs.delete(t.identifier)
  }
  return {
    vecs,
    dists: vecs.size === 0 ? [] : touches.dists,
    zoom: vecs.size === 0 ? null : touches.zoom,
    focus: touches.focus,
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
