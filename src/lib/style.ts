import { toMatrixOuter } from './coord'
import { matrixEmpty, matrixScaleAt, matrixToString } from './matrix/prefixed'
import { matrixTranslate, transformPoint } from './transform'
import { ifNullOr, zoomToScale } from './utils'
import { VecVec as Vec, vecSub } from './vec/prefixed'
import { PointerState } from './xstate-pointer'

export function dragStyle(pointer: Readonly<PointerState>) {
  if (!pointer.matches({ Pointer: 'Dragging' })) {
    return ''
  }

  return `
.container {
  overflow: scroll;
}
`
}

export function moveStyle(pointer: Readonly<PointerState>) {
  const { layout, animation } = pointer.context

  if (!pointer.matches({ Animator: 'Moving' })) {
    return ''
  }

  if (animation === null) {
    return ''
  }

  const d = vecSub(ifNullOr(animation.move, layout.container), layout.container)

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

export function zoomStyle(pointer: Readonly<PointerState>) {
  const { layout, focus, zoom, nextZoom, animation } = pointer.context

  if (!pointer.matches({ Animator: 'Zooming' })) {
    return ''
  }

  if (animation === null) {
    return ''
  }

  const zd = nextZoom - zoom

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
  transformPoint(toMatrixOuter(layout), focus)
)}
`

  return zoomStyle
}

export const moveKeyFrames = (d: Vec) => {
  const p = matrixEmpty
  const q = matrixTranslate(matrixEmpty, d)

  return `
@keyframes move {
  from {
    transform-origin: left top;
    transform: ${matrixToString(p)};
  }
  to {
    transform-origin: left top;
    transform: ${matrixToString(q)};
  }
}
`
}

export const zoomInOutKeyFrames = (s: number, focus: Vec) => {
  const { x, y } = focus
  const p = matrixScaleAt([1, 1], [x, y])
  const q = matrixScaleAt([s, s], [x, y])

  return `
@keyframes zoomInOut {
  from {
    transform-origin: left top;
    transform: ${matrixToString(p)};
  }
  to {
    transform-origin: left top;
    transform: ${matrixToString(q)};
  }
}
`
}
