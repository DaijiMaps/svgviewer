import { ReadonlyDeep } from 'type-fest/source/readonly-deep'
import { expect, test } from 'vitest'
import { ReallyReadonlyArray } from './array'

export type A = ReadonlyDeep<{ a: { a: { a: number } } }>

test('ReadonlyDeep', () => {
  const a1: A = { a: { a: { a: 0 } } }
  const a2: A = { a: { a: { a: 0 } } }

  expect(a1).toStrictEqual(a2)
})

export type T = ReallyReadonlyArray<number>

test('ReadonlyArray', () => {
  const t1: T = [1, 2]
  const t2: T = [1, 2]

  expect(t1).toStrictEqual(t2)
})
