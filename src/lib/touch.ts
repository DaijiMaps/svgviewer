import { Vec, vecInterpolate } from './vec'
import { dist } from './vec/dist'

export interface Zoom {
  p: Vec
  dir: number
}

export interface Touches {
  vecs: Map<number, Vec[]>
  dists: number[]
  zoom: null | Zoom
}

function calcZoom(dists: number[], p: Vec): null | Zoom {
  if (dists.length >= 4) {
    let dir = 0
    const [d0, d1, d2, d3] = dists
    if (d0 < d1 && d1 < d2 && d2 < d3) {
      dir = -1
    } else if (d0 > d1 && d1 > d2 && d2 > d3) {
      dir = 1
    }
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

export function handleTouchStart(touches: Touches, ev: TouchEvent): Touches {
  const vecs = structuredClone(touches.vecs)
  for (const t of ev.changedTouches) {
    const v = { x: t.clientX, y: t.clientY }
    vecs.set(t.identifier, [v])
  }
  return { ...touches, vecs }
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
  return { vecs, dists, zoom }
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
  }
}
