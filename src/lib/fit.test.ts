import { expect, test } from 'vitest'
import { BoxBox as Box } from './box/prefixed'
import { fit } from './fit'

export const bv: Box = { x: 0, y: 0, width: 200, height: 100 }
export const ov: Box = { x: 0, y: 0, width: 10, height: 40 }
export const bh: Box = { x: 0, y: 0, width: 100, height: 200 }
export const oh: Box = { x: 0, y: 0, width: 40, height: 10 }

test('fitV', () => {
  const [[mx, my]] = fit(bv, ov)
  expect(mx).toBe(87.5)
  expect(my).toBe(0)
  const w = bv.width - mx * 2
  expect((w * ov.height) / ov.width).toBe(bv.height)
})

test('fitH', () => {
  const [[mx, my]] = fit(bh, oh)
  expect(mx).toBe(0)
  expect(my).toBe(87.5)
  const h = bh.height - my * 2
  expect((h * oh.width) / oh.height).toBe(bh.width)
})
