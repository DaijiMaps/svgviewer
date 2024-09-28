import { svgMapViewerConfig } from './config'
import { toMatrixOuter } from './coord'
import { Layout } from './layout'
import { Matrix } from './matrix'
import { matrixEmpty, matrixScaleAt, matrixToString } from './matrix/prefixed'
import { matrixTranslate, transformPoint } from './transform'
import { ifNullOr, zoomToScale } from './utils'
import { vecSub } from './vec/prefixed'
import { PointerState } from './xstate-pointer'

export function scrollStyle(layout: Layout) {
  return `
.content {
  width: ${layout.scroll.width}px;
  height: ${layout.scroll.height}px;
}
`
}

export function modeStyle(pointer: Readonly<PointerState>) {
  return pointer.context.mode === 0
    ? `
.container {
}
`
    : `
.container {
  cursor: move;
  overflow: scroll;
  will-change: scroll-position;
  touch-action: pan-x pan-y;
}
`
}

export function dragStyle(pointer: Readonly<PointerState>) {
  if (!pointer.matches({ Pointer: 'Dragging' })) {
    return ''
  }

  return `
.container {
  cursor: grabbing;
  overflow: scroll;
}
`
}

export function moveStyle(pointer: Readonly<PointerState>) {
  const { layout, animation } = pointer.context

  if (!pointer.matches({ Animator: 'Busy' })) {
    return ''
  }

  if (animation === null || animation.move === null) {
    return ''
  }

  const d = vecSub(ifNullOr(animation.move, layout.scroll), layout.scroll)
  const q = matrixTranslate(matrixEmpty, d)

  return d.x === 0 && d.y === 0 ? `` : css(q)
}

export function zoomStyle(pointer: Readonly<PointerState>) {
  const { layout, focus, zoom, animation } = pointer.context

  if (!pointer.matches({ Animator: 'Busy' })) {
    return ''
  }

  if (animation === null || animation.zoom === null) {
    return ''
  }

  const zd = animation.zoom.zoom - zoom
  const s = zoomToScale(zd)
  const { x, y } = transformPoint(toMatrixOuter(layout), focus)
  const q = matrixScaleAt([s, s], [x, y])

  return zd === 0 ? `` : css(q)
}

export const css = (q: Readonly<Matrix>) => {
  const p = matrixEmpty

  return `
.svg {
  will-change: transform;
  animation: xxx ${svgMapViewerConfig.animationDuration}ms ease;
}
@keyframes xxx {
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
