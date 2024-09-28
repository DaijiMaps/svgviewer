/* eslint-disable functional/prefer-immutable-types */
/* eslint-disable functional/immutable-data */
/* eslint-disable functional/no-expression-statements */
/* eslint-disable functional/no-conditional-statements */
import { BoxBox as Box, boxBox, BoxBox } from './box/prefixed'

export const syncScroll = (e: null | HTMLElement, b: Box): boolean => {
  // assume valid if scrollLeft exists
  if (e === null || e.scrollLeft === null || b === null) {
    return false
  }
  // box pointing to the identical element?
  if (
    Math.abs(e.scrollWidth - b.width) > 1 ||
    Math.abs(e.scrollHeight - b.height) > 1
  ) {
    return false
  }
  const left = Math.round(-b.x)
  const top = Math.round(-b.y)
  if (left < 0 || top < 0) {
    return false
  }
  if (e.scrollLeft !== left) {
    e.scrollLeft = left
  }
  if (e.scrollTop !== top) {
    e.scrollTop = top
  }

  return true
}

export function getScroll(e: null | Readonly<HTMLElement>): null | BoxBox {
  if (e !== null) {
    return boxBox(e.scrollLeft, e.scrollTop, e.scrollWidth, e.scrollHeight)
  }
  return null
}
