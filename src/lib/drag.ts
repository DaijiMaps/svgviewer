import { Box, boxCenter, boxCopy, boxMove } from './box'
import * as vec from './vec'
import { Vec } from './vec'

import { LayoutDrag } from './layout'

export const dragStart = (container: Box, focus: Vec): LayoutDrag => {
  return {
    focus: focus,
    start: boxCopy(container),
    move: boxCopy(container),
  }
}

export const dragMove = (
  drag: LayoutDrag,
  x: number,
  y: number
): LayoutDrag => {
  const o = drag.focus
  const p = { x, y }
  const d = vec.sub(p, o)

  return {
    ...drag,
    move: boxMove(drag.start, d),
  }
}

// XXX practically this is not needed if dragStart() is always called
// XXX mainly for test (see "recenter 3")
export const dragReset = (container: Box): LayoutDrag => {
  return {
    focus: boxCenter(container),
    start: boxCopy(container),
    move: boxCopy(container),
  }
}
