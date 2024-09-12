import { Layout } from './lib/layout'
import { Touches, vecsToPoints } from './lib/touch'
import { Vec } from './lib/vec'

const CursorSvgPath = (props: { x: number; y: number; r: number }) => {
  const { x, y, r } = props

  return (
    <path
      d={`
M${x},${y}
m-${r},0
h${r * 2}
m-${r},-${r}
v${r * 2}
M${x},${y - r}
a${r},${r} 0,0,1 0,${r * 2}
a${r},${r} 0,0,1 0,${-r * 2}
`}
      fill="none"
      stroke="black"
      strokeWidth={r * 0.05}
    />
  )
}

export const Cursor = (props: {
  _layout: Layout
  _focus: Vec
  _touches: Touches
}) => {
  const { _layout: layout, _focus: focus, _touches: touches } = props

  const points = vecsToPoints(touches.vecs)

  return (
    <>
      <CursorSvgPath x={focus.x} y={focus.y} r={layout.config.fontSize / 2} />
      {points.length > 1 && (
        <polyline
          points={points.map(({ x, y }) => `${x},${y}`).join(' ')}
          stroke="black"
          strokeWidth={(layout.config.fontSize * 0.05) / 2}
        />
      )}
    </>
  )
}
