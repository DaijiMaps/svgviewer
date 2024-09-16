import { pipe } from 'fp-ts/lib/function'
import { expect, test } from 'vitest'
import { animationEndLayout, animationMove, animationZoom } from './animation'
import { BoxBox as Box, boxCenter, boxScaleAt } from './box/prefixed'
import { toMatrixSvg } from './coord'
import { dragMove, dragReset, dragStart } from './drag'
import {
  configLayout,
  expandLayout,
  expandLayoutCenter,
  makeLayout,
  recenterLayout,
  relocLayout,
} from './layout'
import { transformPoint, transformScale } from './transform'
import { vecVec } from './vec/prefixed'

const container: Box = { x: 0, y: 0, width: 1200, height: 1000 }
const origViewBox: Box = { x: 0, y: 0, width: 100, height: 100 }

const config = configLayout(16, origViewBox, container)
const layout = makeLayout(config)
const focus = boxCenter(container)

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
    (l) => animationZoom(l, 0, 0, focus),
    (a) => animationEndLayout(layout, a)
  )
  expect(l0.svgScale.s).toBe(layout.svgScale.s)
  const l1 = pipe(
    layout,
    (l) => animationZoom(l, 0, 1, focus),
    (a) => animationEndLayout(layout, a)
  )
  expect(l1.svgScale.s / layout.svgScale.s).toBe(1 / 2)
  //expect(l1.zoom).toBe(1)
})

test('expand center', () => {
  const l1 = expandLayoutCenter(layout, 1)
  expect(l1).toStrictEqual(layout)
})

test('expand 2', () => {
  const l1 = pipe(layout, (l) => expandLayoutCenter(l, 2))
  const l2 = pipe(l1, (l) => expandLayoutCenter(l, 1 / 2))

  expect(l1.scroll).toStrictEqual({
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
  expect(l2.scroll).toStrictEqual({
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

const U = (() => {
  const container: Box = { x: 0, y: 0, width: 1, height: 1 }
  const origViewBox: Box = { x: 0, y: 0, width: 1, height: 1 }
  const config = configLayout(16, origViewBox, container)
  const layout = makeLayout(config)
  const focus = boxCenter(container)
  return {
    container,
    origViewBox,
    config,
    layout,
    focus,
  }
})()

test('expand + zoom', () => {
  const l1 = expandLayoutCenter(U.layout, 2)
  const a1 = animationZoom(l1, 0, 1, U.focus)
  const l2 = animationEndLayout(l1, a1)
  const a2 = animationZoom(l2, 1, -1, U.focus)
  const l3 = animationEndLayout(l2, a2)
  const l4 = expandLayoutCenter(l3, 1 / 2)

  expect(l4).toStrictEqual(U.layout)
})

test('expand + zoom 2', () => {
  const focus = vecVec(0.25, 0.25)

  const l1 = expandLayoutCenter(U.layout, 2)
  const a1 = animationZoom(l1, 0, 1, focus)
  const l2 = animationEndLayout(l1, a1)
  const a2 = animationZoom(l2, 1, -1, focus)
  const l3 = animationEndLayout(l2, a2)
  const l4 = expandLayoutCenter(l3, 1 / 2)

  expect(l4).toStrictEqual(U.layout)
})

test('expand + zoom 3', () => {
  const res = pipe(
    { l: layout, a: null, d: null },
    ({ l, a, d }) => ({
      l: expandLayoutCenter(l, 3),
      a,
      d,
    }),
    ({ l, d }) => ({
      l,
      a: animationZoom(l, 0, 1, focus),
      d,
    }),
    ({ l, a, d }) => ({
      l: animationEndLayout(l, a),
      a,
      d,
    }),
    ({ l, d }) => ({
      l,
      a: animationZoom(l, 1, -1, focus),
      d,
    }),
    ({ l, a, d }) => ({
      l: animationEndLayout(l, a),
      a,
      d,
    }),
    ({ l, a, d }) => ({
      l: expandLayoutCenter(l, 1 / 3),
      a,
      d,
    })
  )
  expect(layout).toStrictEqual({
    ...res.l,
    scroll: {
      ...res.l.scroll,
      x: expect.closeTo(0, 5),
      y: expect.closeTo(0, 5),
    },
    svg: {
      ...res.l.svg,
      x: expect.closeTo(0, 5),
      y: expect.closeTo(0, 5),
    },
  })
})

test('boxScale', () => {
  const s = 2

  const o = vecVec(
    layout.config.container.width / 2,
    layout.config.container.height / 2
  )

  const opsvg = transformPoint(toMatrixSvg(layout), o)

  expect(o.x).toBe(600)

  const scroll = boxScaleAt(layout.scroll, s, o.x, o.y)
  const svg = boxScaleAt(layout.svg, s, opsvg.x, opsvg.y)

  expect(scroll.x).toBe(-600)
  expect(svg.x).toBe(-50)

  const coord = {
    ...layout,
    scroll,
    svgOffset: transformScale(layout.svgOffset, s),
    svg,
  }
  //const coordMatrixOuter = toMatrixOuter(coord);
  const coordMatrixSvg = toMatrixSvg(coord)

  const p = vecVec(600, 500)
  const start = transformPoint(coordMatrixSvg, p)

  expect(start.x).toBeCloseTo(50)
  expect(start.y).toBeCloseTo(50)
})

test('recenter 1', () => {
  const d1 = dragStart(layout.scroll, vecVec(0, 0))
  const l1 = recenterLayout(layout, d1.start)
  expect(l1).toStrictEqual(layout)
})

test('recenter 2', () => {
  const l2 = pipe(
    layout,
    (l) => dragStart(l.scroll, focus),
    (d) => dragMove(d, vecVec(600, 500)),
    (d) => recenterLayout(layout, d.start)
  )
  expect(l2).toStrictEqual(layout)
})

test('recenter 3', () => {
  const l1 = expandLayout(layout, 2, focus)
  const d1 = dragStart(l1.scroll, focus)
  const d2 = dragMove(d1, vecVec(0, 0))
  const d3 = dragMove(d2, vecVec(600, 500))
  const l2 = relocLayout(l1, d3.move)
  const l3 = recenterLayout(l2, d3.start)
  const l4 = expandLayout(l3, 1 / 2, focus)
  expect(l4).toStrictEqual(layout)
})

test('recenter 4', () => {
  const focus = vecVec(0, 0)
  const d1 = pipe(layout, (l) => dragStart(l.scroll, focus))
  const ox1 = d1.start.x
  const x1 = layout.scroll.x
  expect(ox1).toBe(0)
  expect(x1).toBe(0)

  const d2 = dragMove(d1, vecVec(0, 0))
  const l2 = pipe(d2, (d) =>
    pipe(
      layout,
      (l) => relocLayout(l, d.move),
      (l) => recenterLayout(l, d.start)
    )
  )
  const ox2 = d2.start.x
  const x2 = d2.move.x
  expect(ox2).toBe(0)
  expect(x2).toBe(0)

  const d3 = dragMove(d2, vecVec(1, 1))
  const l3 = relocLayout(l2, d3.move)
  const ox3 = d3.start.x
  const x3 = d3.move.x
  expect(ox3).toBe(0)
  expect(x3).toBe(1)

  const l4 = recenterLayout(l3, d3.start)
  const d4 = dragReset(l4.scroll)
  const ox4 = d4.start.x
  const x4 = d4.move.x
  expect(ox4).toBe(0)
  expect(x4).toBe(0)
})

test('move + zoom', () => {
  const d1 = dragStart(layout.scroll, focus)
  const d2 = dragMove(d1, vecVec(0, 0))
  const l2 = recenterLayout(layout, d2.start)
  const a1 = animationZoom(l2, 0, 1, focus)
  const l3 = animationEndLayout(l2, a1)
  const a2 = animationZoom(l3, 1, -1, focus)
  const l4 = animationEndLayout(l3, a2)
  const d5 = dragStart(l4.scroll, focus)
  const a6 = animationMove(d5, vecVec(-1, 0))
  const l5 = animationEndLayout(l4, a6)
  const l6 = relocLayout(l5, d5.move)
  const l7 = recenterLayout(l6, d5.start)

  expect(layout).toStrictEqual({
    ...l7,
    svg: {
      ...l7.svg,
      x: expect.closeTo(0, 5),
    },
  })
})
