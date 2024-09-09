import { produce } from 'immer'
import { Box, boxCenter, boxCopy, boxMove, boxScaleAt } from './box'
import { LayoutCoord, makeCoord, toMatrixSvg } from './coord'
import { fit } from './fit'
import { Move, Scale, transformScale } from './transform'
import { zoomToScale } from './utils'
import { Vec, vecScale, vecSub } from './vec'

//// LayoutConfig
//// Layout

export interface LayoutConfig {
  readonly bodyViewBox: Box
  readonly svgViewBox: Box
  readonly svgOffset: Move
  readonly svgScale: Scale
  readonly fontSize: number
  readonly fontSizeSvg: number
}

export interface LayoutDrag {
  startFocus: DOMPointReadOnly
  startContainerViewBox: Box
  moveContainerViewBox: Box
}

export interface LayoutAnimation {
  containerViewBox: null | Box
  zoom: null | {
    svgViewBox: Box
    svgScale: Scale
    zoom: number
  }
}

export interface Layout extends LayoutCoord, LayoutDrag {
  config: LayoutConfig
  expand: number
  zoom: number
  focus: DOMPointReadOnly
  animation: null | LayoutAnimation
}

//// configLayout
//// makeLayout
//// focusLayout
//// zoomLayout

export function configLayout(
  svgViewBox: Box, // svgViewBox
  origBodyViewBox?: Box
): LayoutConfig {
  const windowViewBox: Box = {
    x: 0,
    y: 0,
    width: window.innerWidth,
    height: window.innerHeight,
  }
  const bodyViewBox: Box =
    origBodyViewBox !== undefined ? origBodyViewBox : windowViewBox
  // XXX svgViewBox is SVG-internal coordinate
  // XXX does NOT matter to calc svg fit
  const [x, y] = fit(bodyViewBox, svgViewBox)
  const s =
    x === 0
      ? svgViewBox.width / bodyViewBox.width
      : svgViewBox.height / bodyViewBox.height

  const style = getComputedStyle(document.body)
  const fontSize = parseFloat(style.fontSize)
  const fontSizeSvg = fontSize * s

  return {
    bodyViewBox,
    svgViewBox,
    svgOffset: { x, y },
    svgScale: { s },
    fontSize,
    fontSizeSvg,
  }
}

export function makeLayout(config: LayoutConfig): Layout {
  const coord = makeCoord(config)

  const c = boxCenter(coord.bodyViewBox)
  const focus = new DOMPointReadOnly(c.x, c.y)

  return {
    config,
    expand: 1,
    zoom: 0,
    focus,
    ...coord,
    startFocus: new DOMPointReadOnly(focus.x, focus.y),
    startContainerViewBox: boxCopy(coord.containerViewBox),
    moveContainerViewBox: boxCopy(coord.containerViewBox),
    animation: null,
  }
}

export function focusLayout(layout: Layout, p: Vec | DOMPointReadOnly): Layout {
  return produce(layout, (draft) => {
    draft.focus = 'z' in p ? p : new DOMPointReadOnly(p.x, p.y)
  })
}

export const zoomLayout = (layout: Layout, z: number): Layout => {
  return produce(layout, (draft) => {
    const scale = zoomToScale(z)
    const focusSvg = layout.focus.matrixTransform(toMatrixSvg(layout))

    draft.animation = {
      containerViewBox: null,
      zoom: {
        svgViewBox: boxScaleAt(
          layout.svgViewBox,
          1 / scale,
          focusSvg.x,
          focusSvg.y
        ),
        svgScale: transformScale(layout.svgScale, 1 / scale),
        zoom: layout.zoom + z,
      },
    }
  })
}

export const zoomEndLayout = (layout: Layout): Layout => {
  return produce(layout, (draft) => {
    if (layout.animation !== null) {
      if (layout.animation.containerViewBox !== null) {
        draft.containerViewBox = { ...layout.animation.containerViewBox }
      }
      if (layout.animation.zoom !== null) {
        draft.svgViewBox = { ...layout.animation.zoom.svgViewBox }
        draft.svgScale = { ...layout.animation.zoom.svgScale }
        draft.zoom = layout.animation.zoom.zoom
      }
    }
    draft.animation = null
  })
}

export const expandLayout = (
  layout: Layout,
  expand: number,
  focus?: DOMPointReadOnly
): Layout => {
  return produce(layout, (draft) => {
    const s = expand / layout.expand
    const c = boxCenter(layout.containerViewBox)
    const o = focus !== undefined ? focus : new DOMPointReadOnly(c.x, c.y)
    const osvg = o.matrixTransform(toMatrixSvg(layout))

    draft.expand = expand
    draft.containerViewBox = boxScaleAt(layout.containerViewBox, s, o.x, o.y)
    draft.svgOffset = vecScale(layout.svgOffset, s)
    draft.svgViewBox = boxScaleAt(layout.svgViewBox, s, osvg.x, osvg.y)
  })
}

export const recenterLayout = (layout: Layout): Layout => {
  return produce(layout, (draft) => {
    const d = vecSub(layout.containerViewBox, layout.startContainerViewBox)
    const dsvg = vecScale(d, -layout.svgScale.s)

    draft.containerViewBox = layout.startContainerViewBox
    draft.svgViewBox = boxMove(layout.svgViewBox, dsvg)
  })
}

//// dragStart
//// dragMove
//// dragEnd

export const dragStart = (layout: Layout): Layout => {
  return produce(layout, (draft) => {
    draft.startContainerViewBox = layout.containerViewBox
    draft.moveContainerViewBox = layout.containerViewBox
    draft.startFocus = layout.focus
  })
}

export const dragMove = (
  layout: Layout,
  x: number,
  y: number,
  dx?: number,
  dy?: number
): Layout => {
  return produce(layout, (draft) => {
    const o = layout.startFocus
    const p = { x, y }
    const d =
      dx !== undefined && dy !== undefined ? { x: dx, y: dy } : vecSub(p, o)

    if (dx !== undefined) {
      const v = layout.startContainerViewBox
      draft.animation = {
        containerViewBox: { ...v, x: v.x + d.x, y: v.y + d.y },
        zoom: null,
      }
    } else {
      draft.focus = new DOMPointReadOnly(x, y)
      draft.containerViewBox = boxMove(layout.startContainerViewBox, d)
    }
  })
}

export const dragEnd = (layout: Layout): Layout => {
  return produce(layout, (draft) => {
    draft.moveContainerViewBox = layout.containerViewBox
    draft.animation = null
  })
}

// XXX practically this is not needed if dragStart() is always called
// XXX mainly for test (see "recenter 3")
export const dragReset = (layout: Layout): Layout => {
  return produce(layout, (draft) => {
    draft.startContainerViewBox = layout.containerViewBox
  })
}
