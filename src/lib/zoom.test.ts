import { expect, test } from 'vitest'

test('translate', () => {
  const o = new DOMPointReadOnly(0, 0)
  const p = new DOMPointReadOnly(1, 1)
  const m = new DOMMatrixReadOnly()
    .translate(0.5, 0.5)
    .scale(2, 2)
    .translate(-0.5, -0.5)
  const oo = o.matrixTransform(m)
  const pp = p.matrixTransform(m)
  expect(oo.x).toBe(-0.5)
  expect(pp.x).toBe(1.5)
})

test('rect', () => {
  const rect = { x: 0, y: 0, width: 400, height: 300 }

  const o = new DOMPointReadOnly(200, 150)

  const m = new DOMMatrixReadOnly()
    .translate(o.x, o.y)
    .scale(2, 2)
    .translate(-o.x, -o.y)

  const tl = new DOMPointReadOnly(rect.x, rect.y)
  const br = new DOMPointReadOnly(rect.x + rect.width, rect.y + rect.height)

  const tlI = tl.matrixTransform(m)
  const brI = br.matrixTransform(m)

  expect(tlI.x).toBe(-200)
  expect(brI.x).toBe(600)

  const tlO = tl.matrixTransform(m.inverse())
  const brO = br.matrixTransform(m.inverse())

  expect(tlO.x).toBe(100)
  expect(brO.x).toBe(300)
})
