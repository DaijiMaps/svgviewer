import { ReadonlyDeep } from 'type-fest'
import { BoxBox as Box, boxCenter, boxCopy, boxMove } from './box/prefixed'
import { VecVec as Vec, vecCopy, vecSub } from './vec/prefixed'

export type Drag = ReadonlyDeep<{
  focus: Vec
  start: Box
  move: Box
}>

export const dragStart = (scroll: Box, focus: Vec): Drag => {
  return {
    focus: vecCopy(focus),
    start: boxCopy(scroll),
    move: boxCopy(scroll),
  }
}

export const dragMove = (drag: Drag, p: Vec): Drag => {
  const o = drag.focus
  const d = vecSub(p, o)

  return {
    ...drag,
    move: boxMove(drag.start, d),
  }
}

// XXX practically this is not needed if dragStart() is always called
// XXX mainly for test (see "recenter 3")
export const dragReset = (scroll: Box): Drag => {
  return {
    focus: boxCenter(scroll),
    start: boxCopy(scroll),
    move: boxCopy(scroll),
  }
}
