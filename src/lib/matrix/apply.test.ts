import { expect, test } from 'vitest'
import { Matrix, V } from '.'
import { apply } from './apply'

const m: Matrix = [2, 0, 0, 2, 0, 0]
const p: V = [1, 1]

const q = apply(m, p, 1)

test('apply', () => {
  expect(q).toStrictEqual([2, 2])
})
