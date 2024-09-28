import { expect, test } from 'vitest'
import { diag, Size } from './size'
import { Vec } from './vec'

test('diag', () => {
  const s: Size = { width: 4, height: 3 }

  const a: Vec = { x: 2, y: 1 }
  expect(diag(s, a)).toBe(0)

  const b: Vec = { x: 3, y: 1.5 }
  expect(diag(s, b)).toBe(1)

  const c: Vec = { x: 2, y: 2 }
  expect(diag(s, c)).toBe(2)

  const d: Vec = { x: 1, y: 1.5 }
  expect(diag(s, d)).toBe(3)
})
