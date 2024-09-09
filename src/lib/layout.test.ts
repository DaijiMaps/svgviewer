import { pipe } from 'effect'
import { expect, test } from 'vitest'
import { Box, boxScaleAt } from './box'
import { toMatrixSvg } from './coord'
import {
  configLayout,
  dragEnd,
  dragMove,
  dragReset,
  dragStart,
  expandLayout,
  focusLayout,
  makeLayout,
  recenterLayout,
  zoomEndLayout,
  zoomLayout,
} from './layout'
import { transformScale } from './transform'

const bodyViewBox: Box = { x: 0, y: 0, width: 1200, height: 1000 }
const origViewBox: Box = { x: 0, y: 0, width: 100, height: 100 }

const config = configLayout(origViewBox, bodyViewBox)
const layout = makeLayout(config)

test('layout config', () => {
  // svg scaled to (1000, 1000)
  // margin x/y is 100/0
  expect(config.svgOffset.x).toBe(100)
  expect(config.svgOffset.y).toBe(0)
})

test('make layout', () => {
  expect(layout.config).toStrictEqual(config)
  expect(layout.svgScale.s).toBe(0.1)
  expect(layout.startFocus.x).toBe(600)
})

test('zoom layout', () => {
  expect(layout.svgScale.s).toBe(0.1)
  const l0 = pipe(
    layout,
    (l) => zoomLayout(l, 0),
    (l) => zoomEndLayout(l)
  )
  expect(l0.svgScale.s).toBe(layout.svgScale.s)
  const l1 = pipe(
    layout,
    (l) => zoomLayout(l, 1),
    (l) => zoomEndLayout(l)
  )
  expect(l1.svgScale.s / layout.svgScale.s).toBe(1 / 2)
  expect(l1.zoom).toBe(1)
})

test('expand', () => {
  const l1 = expandLayout(layout, 1)
  expect(l1).toStrictEqual(layout)
})

test('expand 2', () => {
  const l1 = pipe(layout, (l) => expandLayout(l, 2))
  const l2 = pipe(l1, (l) => expandLayout(l, 1))

  expect(l1.containerViewBox).toStrictEqual({
    x: -600,
    y: -500,
    width: 2400,
    height: 2000,
  })
  expect(l1.svgViewBox).toStrictEqual({
    x: -50,
    y: -50,
    width: 200,
    height: 200,
  })
  expect(l2.containerViewBox).toStrictEqual({
    x: 0,
    y: 0,
    width: 1200,
    height: 1000,
  })
  expect(l2.svgViewBox).toStrictEqual({
    x: 0,
    y: 0,
    width: 100,
    height: 100,
  })
  expect(l2).toStrictEqual(layout)
})

test('boxScale', () => {
  const s = 2

  const o = new DOMPointReadOnly(
    layout.config.bodyViewBox.width / 2,
    layout.config.bodyViewBox.height / 2
  )

  const opsvg = o.matrixTransform(toMatrixSvg(layout))

  expect(o.x).toBe(600)

  const containerViewBox = boxScaleAt(layout.containerViewBox, s, o.x, o.y)
  const svgViewBox = boxScaleAt(layout.svgViewBox, s, opsvg.x, opsvg.y)

  expect(containerViewBox.x).toBe(-600)
  expect(svgViewBox.x).toBe(-50)

  const coord = {
    ...layout,
    containerViewBox,
    svgOffset: transformScale(layout.svgOffset, s),
    svgViewBox,
  }
  //const coordMatrixOuter = toMatrixOuter(coord);
  const coordMatrixSvg = toMatrixSvg(coord)

  const p = new DOMPointReadOnly(600, 500)
  const startContainerViewBox = p.matrixTransform(coordMatrixSvg)

  expect(startContainerViewBox.x).toBeCloseTo(50)
  expect(startContainerViewBox.y).toBeCloseTo(50)
})

test('recenter 1', () => {
  const l1 = pipe(layout, (l) => recenterLayout(l))
  expect(l1).toStrictEqual(layout)
})

test('recenter 2', () => {
  const l2 = pipe(
    layout,
    (l) => dragStart(l),
    (l) => dragMove(l, 600, 500),
    (l) => recenterLayout(l)
  )
  expect(l2).toStrictEqual(layout)
})

test('recenter 3', () => {
  const l1 = pipe(layout, (l) => expandLayout(l, 2))
  const l2 = pipe(
    l1,
    (l) => dragStart(l),
    (l) => dragMove(l, 0, 0),
    (l) => dragMove(l, 600, 500),
    (l) => recenterLayout(l)
  )
  const l3 = pipe(l2, (l) => expandLayout(l, 1, l2.focus))
  const l4 = pipe(l3, (l) => dragEnd(l))
  const l5 = pipe(l4, (l) => dragReset(l))
  expect(l5).toStrictEqual(layout)
})

test('recenter 4', () => {
  const l1 = pipe(
    layout,
    (l) => focusLayout(l, new DOMPointReadOnly(0, 0)),
    (l) => dragStart(l)
  )
  const ox1 = l1.startContainerViewBox.x
  const x1 = l1.containerViewBox.x
  expect(ox1).toBe(0)
  expect(x1).toBe(0)

  const l2 = pipe(
    l1,
    (l) => dragMove(l, 0, 0),
    (l) => recenterLayout(l)
  )
  const ox2 = l2.startContainerViewBox.x
  const x2 = l2.containerViewBox.x
  expect(ox2).toBe(0)
  expect(x2).toBe(0)

  const l3 = pipe(l2, (l) => dragMove(l, 1, 1))
  const ox3 = l3.startContainerViewBox.x
  const x3 = l3.containerViewBox.x
  expect(ox3).toBe(0)
  expect(x3).toBe(1)

  const l4 = pipe(l3, (l) => recenterLayout(l))
  const ox4 = l4.startContainerViewBox.x
  const x4 = l4.containerViewBox.x
  expect(ox4).toBe(0)
  expect(x4).toBe(0)
})

test('move + zoom', () => {
  const l1 = pipe(layout, dragStart, (l) => dragMove(l, 0, 0, 1, 0))
  const l2 = pipe(l1, recenterLayout)
  const l3 = pipe(
    l2,
    (l) => zoomLayout(l, 1),
    (l) => zoomEndLayout(l)
  )
  const l4 = pipe(
    l3,
    (l) => zoomLayout(l, -1),
    (l) => zoomEndLayout(l)
  )
  const l5 = pipe(l4, dragStart, (l) => dragMove(l, 0, 0, -1, 0), dragEnd)
  const l6 = pipe(l5, recenterLayout)

  expect(layout).toStrictEqual({
    ...l6,
    svgViewBox: {
      ...l6.svgViewBox,
      x: expect.closeTo(0, 5),
    },
  })
})
