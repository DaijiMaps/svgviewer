import { expect, test } from 'vitest'
import { vecAdd, vecInterpolate, vecScale } from './prefixed'

test('vecAdd', () => {
  const a = { x: 1, y: 1, w: 1 }
  const b = { x: 2, y: 2, w: 2 }

  const c = vecAdd(a, b)
  expect(a.x).toBe(1)
  expect(a.w).toBe(1)
  expect(b.x).toBe(2)
  expect(b.w).toBe(2)
  expect(c.x).toBe(3)
  expect(c.w).toBe(1)
})

test('vecScale', () => {
  const a = { x: 1, y: 1, w: 1 }
  const s = 2

  const b = vecScale(a, s)
  expect(a.x).toBe(1)
  expect(a.w).toBe(1)
  expect(b.x).toBe(2)
  expect(b.w).toBe(1)
})

test('vecInterpolate', () => {
  const p = { x: 0, y: 0 }
  const q = { x: 1, y: 1 }
  const t = 0.75

  const r = vecInterpolate(p, q, t)
  expect(r.x).toBe(0.75)
  expect(r.y).toBe(0.75)
})
