import { Box, boxCenter, boxCopy, boxMove } from './box'
import * as vec from './vec'
import { Vec } from './vec'

import { Layout, LayoutDrag } from './layout'

//// dragStart
//// dragMove
//// dragEnd

export const dragStart = (layout: Layout, focus: Vec): LayoutDrag => {
  return {
    focus: focus,
    start: boxCopy(layout.container),
    move: boxCopy(layout.container),
  }
}

export const dragStart2 = (container: Box, focus: Vec): LayoutDrag => {
  return {
    focus: vec.vec(focus.x, focus.y),
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
export const dragReset = (layout: Layout): LayoutDrag => {
  return {
    focus: boxCenter(layout.container),
    start: boxCopy(layout.container),
    move: boxCopy(layout.container),
  }
}
