import { Box } from './box'

export const syncScroll = (e: null | HTMLElement, b: Box): void => {
  // assume valid if scrollLeft exists
  if (e === null || e.scrollLeft === null || b === null) {
    return
  }
  // box pointing to the identical element?
  if (
    Math.abs(e.scrollWidth - b.width) > 1 ||
    Math.abs(e.scrollHeight - b.height) > 1
  ) {
    console.log('syncScroll: wrong element size')
    return
  }
  const left = Math.round(-b.x)
  const top = Math.round(-b.y)
  if (left < 0 || top < 0) {
    return
  }
  //console.log("syncScroll", e.scrollLeft, e.scrollTop, "->", left, top);
  if (e.scrollLeft !== left) {
    e.scrollLeft = left
  }
  if (e.scrollTop !== top) {
    e.scrollTop = top
  }
}
