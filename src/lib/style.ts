import { toMatrixOuter } from './coord'
import * as matrix from './matrix'
import { scaleAt } from './matrix/scale'
import { matrixTranslate, transformPoint } from './transform'
import { ifNullOr, zoomToScale } from './utils'
import { Vec, sub as vecSub } from './vec'
import { PointerState } from './xstate-pointer'

export function dragStyle(pointer: Readonly<PointerState>) {
  if (!pointer.matches({ pointer: 'dragging' })) {
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

  if (!pointer.matches({ animator: 'moving' })) {
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
  const { layout, focus, zoom, animation } = pointer.context

  if (!pointer.matches({ animator: 'zooming' })) {
    return ''
  }

  if (animation === null) {
    return ''
  }

  const zd = ifNullOr(animation.zoom?.zoom ?? null, zoom) - zoom

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
  const p = matrix.empty
  const q = matrixTranslate(matrix.empty, d)

  return `
@keyframes move {
  from {
    transform-origin: left top;
    transform: ${matrix.toString(p)};
  }
  to {
    transform-origin: left top;
    transform: ${matrix.toString(q)};
  }
}
`
}

export const zoomInOutKeyFrames = (s: number, focus: Vec) => {
  const { x, y } = focus
  const p = scaleAt([1, 1], [x, y])
  const q = scaleAt([s, s], [x, y])

  return `
@keyframes zoomInOut {
  from {
    transform-origin: left top;
    transform: ${matrix.toString(p)};
  }
  to {
    transform-origin: left top;
    transform: ${matrix.toString(q)};
  }
}
`
}
