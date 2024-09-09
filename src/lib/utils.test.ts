import { expect, test } from 'vitest'
import { isNotNull, isNull } from './utils'

test('isNull', () => {
  expect(isNull(null)).toBe(true)
  expect(isNull(0)).toBe(false)
  expect(isNotNull(null)).toBe(false)
  expect(isNotNull(0)).toBe(true)
})
