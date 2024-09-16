import { configLayout } from './layout'

export const DIAG_VIEWBOX = {
  x: 0,
  y: 0,
  width: 400,
  height: 300,
}

export const MAP_VIEWBOX = {
  x: -52,
  y: -45,
  width: 1928,
  height: 1363,
}

const FONT_SIZE = 16
const ANIMATION_DURATION = 625
const WIDTH = MAP_VIEWBOX.width
const HEIGHT = MAP_VIEWBOX.height
const VIEWBOX = MAP_VIEWBOX

const origViewBox = VIEWBOX

const layoutConfig = configLayout(FONT_SIZE, origViewBox)

// XXX
// XXX
// XXX
const DRAG_STEP_ALPHA = 0.2
const DRAG_STEP_LIMIT = 10
const DRAG_STEP_MAX_COUNT = 100
// XXX
// XXX
// XXX

export const config = {
  FONT_SIZE,
  ANIMATION_DURATION,
  WIDTH,
  HEIGHT,
  VIEWBOX,
  origViewBox,
  layoutConfig,
  DRAG_STEP_ALPHA,
  DRAG_STEP_LIMIT,
  DRAG_STEP_MAX_COUNT,
}
