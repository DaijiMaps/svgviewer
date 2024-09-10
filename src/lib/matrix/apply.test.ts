import { expect, test } from 'vitest'
import { apply } from './apply'
import { Matrix, V } from './main'

const m: Matrix = [
  [2, 0],
  [0, 2],
  [0, 0],
]
const p: V = [1, 1]

const q = apply(m, p, 1)

test('apply', () => {
  expect(q).toStrictEqual([2, 2])
})
