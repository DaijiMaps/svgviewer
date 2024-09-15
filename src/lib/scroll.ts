import { BoxBox as Box, boxBox, BoxBox } from './box/prefixed'

// eslint-disable-next-line functional/prefer-immutable-types
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
    //console.log('syncScroll: wrong element size')
    return false
  }
  const left = Math.round(-b.x)
  const top = Math.round(-b.y)
  if (left < 0 || top < 0) {
    return false
  }
  //console.log("syncScroll", e.scrollLeft, e.scrollTop, "->", left, top);
  // eslint-disable-next-line functional/no-conditional-statements
  if (e.scrollLeft !== left) {
    // eslint-disable-next-line functional/no-expression-statements, functional/immutable-data
    e.scrollLeft = left
  }
  // eslint-disable-next-line functional/no-conditional-statements
  if (e.scrollTop !== top) {
    // eslint-disable-next-line functional/no-expression-statements, functional/immutable-data
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
