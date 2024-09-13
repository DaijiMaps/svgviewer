import { BoxBox as Box, boxScaleAt } from './box/prefixed'
import { configLayout } from './layout'

export const DIAG_VIEWBOX = {
  x: 0,
  y: 0,
  width: 400,
  height: 300,
}

export const MAP_VIEWBOX = {
  x: 51.4891,
  y: 44.499,
  width: 1825.01,
  height: 1273,
}

const FONT_SIZE = 16
const ANIMATION_DURATION = 625
const WIDTH = MAP_VIEWBOX.width
const HEIGHT = MAP_VIEWBOX.height
const VIEWBOX = MAP_VIEWBOX

const origViewBox: Box = boxScaleAt(
  { x: 0, y: 0, width: WIDTH, height: HEIGHT },
  1,
  VIEWBOX.x + WIDTH / 2,
  VIEWBOX.y + HEIGHT / 2
)

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
