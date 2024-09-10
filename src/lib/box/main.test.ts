import { expect, test } from 'vitest'
import { scaleAt } from '../matrix/scale'
import {
  BoxBox as Box,
  boxScaleAt,
  boxScaleAtCenter,
  boxTransform,
} from './prefixed'

const u: Box = { x: 0, y: 0, width: 1, height: 1 }

test('box origin scale', () => {
  const xf = scaleAt([2, 2], [0, 0])
  const b = boxTransform(u, xf)
  expect(b).toStrictEqual({
    x: 0,
    y: 0,
    width: 2,
    height: 2,
  })
})

test('box center scale', () => {
  const xf = scaleAt([2, 2], [0.5, 0.5])
  const b = boxTransform(u, xf)
  expect(b).toStrictEqual({
    x: -0.5,
    y: -0.5,
    width: 2,
    height: 2,
  })
})

test('scale at', () => {
  const b0 = boxScaleAt(boxScaleAt(u, 2, 0, 0), 0.5, 0, 0)
  expect(b0).toStrictEqual(u)

  const b1 = boxScaleAt(boxScaleAt(u, 2, 0.5, 0.5), 0.5, 0.5, 0.5)
  expect(b1).toStrictEqual(u)

  const b2 = boxScaleAt(u, 2, 0.5, 0.5)

  expect(b2).toStrictEqual({
    x: -0.5,
    y: -0.5,
    width: 2,
    height: 2,
  })
})

test('scale at center', () => {
  const b0 = boxScaleAtCenter(boxScaleAtCenter(u, 2), 0.5)
  expect(b0).toStrictEqual(u)

  const b = boxScaleAtCenter(u, 2)

  expect(b).toStrictEqual({
    x: -0.5,
    y: -0.5,
    width: 2,
    height: 2,
  })
})
