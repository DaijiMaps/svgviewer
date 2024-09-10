import { pipe } from 'effect'
import { expect, test } from 'vitest'
import {
  animationEndLayout,
  animationMoveLayout,
  animationZoomLayout,
} from './animation'
import { Box, boxCenter, boxScaleAt } from './box'
import { toMatrixSvg } from './coord'
import { dragMove, dragReset, dragStart } from './drag'
import {
  configLayout,
  expandLayout,
  expandLayoutCenter,
  makeLayout,
  moveLayout,
  recenterLayout,
} from './layout'
import { transformPoint, transformScale } from './transform'
import { vec } from './vec'

const body: Box = { x: 0, y: 0, width: 1200, height: 1000 }
const origViewBox: Box = { x: 0, y: 0, width: 100, height: 100 }

const config = configLayout(origViewBox, body)
const layout = makeLayout(config)
const focus = boxCenter(body)

test('layout config', () => {
  // svg scaled to (1000, 1000)
  // margin x/y is 100/0
  expect(config.svgOffset.x).toBe(100)
  expect(config.svgOffset.y).toBe(0)
})

test('make layout', () => {
  expect(layout.config).toStrictEqual(config)
  expect(layout.svgScale.s).toBe(0.1)
})

test('zoom layout', () => {
  expect(layout.svgScale.s).toBe(0.1)
  const l0 = pipe(
    layout,
    (l) => animationZoomLayout(l, 0, 0, focus),
    (a) => animationEndLayout(layout, a)
  )
  expect(l0.svgScale.s).toBe(layout.svgScale.s)
  const l1 = pipe(
    layout,
    (l) => animationZoomLayout(l, 0, 1, focus),
    (a) => animationEndLayout(layout, a)
  )
  expect(l1.svgScale.s / layout.svgScale.s).toBe(1 / 2)
  //expect(l1.zoom).toBe(1)
})

test('expand', () => {
  const l1 = expandLayoutCenter(layout, 1)
  expect(l1).toStrictEqual(layout)
})

test('expand 2', () => {
  const l1 = pipe(layout, (l) => expandLayoutCenter(l, 2))
  const l2 = pipe(l1, (l) => expandLayoutCenter(l, 1 / 2))

  expect(l1.container).toStrictEqual({
    x: -600,
    y: -500,
    width: 2400,
    height: 2000,
  })
  expect(l1.svg).toStrictEqual({
    x: -50,
    y: -50,
    width: 200,
    height: 200,
  })
  expect(l2.container).toStrictEqual({
    x: 0,
    y: 0,
    width: 1200,
    height: 1000,
  })
  expect(l2.svg).toStrictEqual({
    x: 0,
    y: 0,
    width: 100,
    height: 100,
  })
  expect(l2).toStrictEqual(layout)
})

test('boxScale', () => {
  const s = 2

  const o = vec(layout.config.body.width / 2, layout.config.body.height / 2)

  const opsvg = transformPoint(toMatrixSvg(layout), o)

  expect(o.x).toBe(600)

  const container = boxScaleAt(layout.container, s, o.x, o.y)
  const svg = boxScaleAt(layout.svg, s, opsvg.x, opsvg.y)

  expect(container.x).toBe(-600)
  expect(svg.x).toBe(-50)

  const coord = {
    ...layout,
    container,
    svgOffset: transformScale(layout.svgOffset, s),
    svg,
  }
  //const coordMatrixOuter = toMatrixOuter(coord);
  const coordMatrixSvg = toMatrixSvg(coord)

  const p = vec(600, 500)
  const start = transformPoint(coordMatrixSvg, p)

  expect(start.x).toBeCloseTo(50)
  expect(start.y).toBeCloseTo(50)
})

test('recenter 1', () => {
  const d1 = dragStart(layout.container, vec(0, 0))
  const l1 = recenterLayout(layout, d1.start)
  expect(l1).toStrictEqual(layout)
})

test('recenter 2', () => {
  const l2 = pipe(
    layout,
    (l) => dragStart(l.container, focus),
    (d) => dragMove(d, 600, 500),
    (d) => recenterLayout(layout, d.start)
  )
  expect(l2).toStrictEqual(layout)
})

test('recenter 3', () => {
  const l1 = expandLayout(layout, 2, focus)
  const d1 = dragStart(l1.container, focus)
  const d2 = dragMove(d1, 0, 0)
  const d3 = dragMove(d2, 600, 500)
  const l2 = moveLayout(l1, d3.move)
  const l3 = recenterLayout(l2, d3.start)
  const l4 = expandLayout(l3, 1 / 2, focus)
  expect(l4).toStrictEqual(layout)
})

test('recenter 4', () => {
  const focus = vec(0, 0)
  const d1 = pipe(layout, (l) => dragStart(l.container, focus))
  const ox1 = d1.start.x
  const x1 = layout.container.x
  expect(ox1).toBe(0)
  expect(x1).toBe(0)

  const d2 = dragMove(d1, 0, 0)
  const l2 = pipe(d2, (d) =>
    pipe(
      layout,
      (l) => moveLayout(l, d.move),
      (l) => recenterLayout(l, d.start)
    )
  )
  const ox2 = d2.start.x
  const x2 = d2.move.x
  expect(ox2).toBe(0)
  expect(x2).toBe(0)

  const d3 = dragMove(d2, 1, 1)
  const l3 = moveLayout(l2, d3.move)
  const ox3 = d3.start.x
  const x3 = d3.move.x
  expect(ox3).toBe(0)
  expect(x3).toBe(1)

  const l4 = recenterLayout(l3, d3.start)
  const d4 = dragReset(l4.container)
  const ox4 = d4.start.x
  const x4 = d4.move.x
  expect(ox4).toBe(0)
  expect(x4).toBe(0)
})

test('move + zoom', () => {
  const d1 = dragStart(layout.container, focus)
  const d2 = dragMove(d1, 0, 0)
  const l2 = recenterLayout(layout, d2.start)
  const a1 = animationZoomLayout(l2, 0, 1, focus)
  const l3 = animationEndLayout(l2, a1)
  const a2 = animationZoomLayout(l3, 1, -1, focus)
  const l4 = animationEndLayout(l3, a2)
  const d5 = dragStart(l4.container, focus)
  const a6 = animationMoveLayout(d5, vec(-1, 0))
  const l5 = animationEndLayout(l4, a6)
  const l6 = moveLayout(l5, d5.move)
  const l7 = recenterLayout(l6, d5.start)

  expect(layout).toStrictEqual({
    ...l7,
    svg: {
      ...l7.svg,
      x: expect.closeTo(0, 5),
    },
  })
})
