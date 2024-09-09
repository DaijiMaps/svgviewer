import { Box } from './box'

export const getSvgViewport = (): null | Box => {
  const r = document.body.getBoundingClientRect()
  if (r === null) {
    return null
  }
  const e: null | SVGGElement = document.querySelector('#preview0-root')
  if (e === null) {
    return null
  }
  const m = e.getScreenCTM()?.inverse()
  if (m === null) {
    return null
  }
  const tl = new DOMPointReadOnly(0, 0).matrixTransform(m)
  const br = new DOMPointReadOnly(r.width, r.height).matrixTransform(m)
  return {
    x: tl.x,
    y: tl.y,
    width: br.x - tl.x,
    height: br.y - tl.y,
  }
}
