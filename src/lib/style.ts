import { toMatrixOuter } from './coord'
import { ifNullOr, zoomToScale } from './utils'
import { Vec, vecSub } from './vec'
import { PointerState } from './xstate-pointer'

export function dragStyle(pointer: PointerState) {
  if (!pointer.matches({ pointer: 'dragging' })) {
    return ''
  }

  return `
.container {
  overflow: scroll;
}
`
}

export function moveStyle(pointer: PointerState) {
  const { layout } = pointer.context

  if (!pointer.matches({ animator: 'moving' })) {
    return ''
  }

  if (layout.animation === null) {
    return ''
  }

  const d = vecSub(
    ifNullOr(layout.animation.containerViewBox, layout.containerViewBox),
    layout.containerViewBox
  )

  const moveStyle =
    d.x === 0 && d.y === 0
      ? ``
      : `
.svg {
  will-change: transform;
  animation: move 1000ms ease;
}
${moveKeyFrames(d)}
`

  return moveStyle
}

export function zoomStyle(pointer: PointerState) {
  const { layout } = pointer.context

  if (!pointer.matches({ animator: 'zooming' })) {
    return ''
  }

  if (layout.animation === null) {
    return ''
  }

  const zd =
    ifNullOr(layout.animation.zoom?.zoom ?? null, layout.zoom) - layout.zoom

  const zoomStyle =
    zd === 0
      ? ``
      : `
.svg {
  will-change: transform;
  animation: zoomInOut 1000ms ease;
}
${zoomInOutKeyFrames(
  zoomToScale(zd),
  layout.focus.matrixTransform(toMatrixOuter(layout))
)}
`

  return zoomStyle
}

export const moveKeyFrames = (d: Vec) => {
  const { x, y } = d
  const p = new DOMMatrixReadOnly().translate(0, 0)
  const q = new DOMMatrixReadOnly().translate(x, y)

  return `
@keyframes move {
  from {
    transform-origin: left top;
    transform: ${p.toString()};
  }
  to {
    transform-origin: left top;
    transform: ${q.toString()};
  }
}
`
}

export const zoomInOutKeyFrames = (
  s: number,
  focus: { x: number; y: number }
) => {
  const { x, y } = focus
  const p = new DOMMatrixReadOnly().scale(1, 1, 1, x, y)
  const q = new DOMMatrixReadOnly().scale(s, s, 1, x, y)

  return `
@keyframes zoomInOut {
  from {
    transform-origin: left top;
    transform: ${p.toString()};
  }
  to {
    transform-origin: left top;
    transform: ${q.toString()};
  }
}
`
}
