import { expect, test } from 'vitest'
import { Box } from './box'
import { viewportExpandAt } from './viewport'

const u: Box = { x: 0, y: 0, width: 1, height: 1 }
const vp = { outer: u, inner: u }

test('viewport', () => {
  const vp1 = viewportExpandAt(vp, 2, 0.5, 0.5)

  expect(vp1).toStrictEqual({
    outer: {
      x: 0,
      y: 0,
      width: 2,
      height: 2,
    },
    inner: {
      x: 0.5,
      y: 0.5,
      width: 1,
      height: 1,
    },
  })
})
