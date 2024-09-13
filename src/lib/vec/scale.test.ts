import { pipe } from 'fp-ts/lib/function'
import { expect, test } from 'vitest'
import { vec } from './index'
import { scaleF } from './scale'

test('scaleF', () => {
  const f = scaleF(2)
  const res = pipe(vec(1, 1), f)

  expect(res.x).toBeCloseTo(2)
})
