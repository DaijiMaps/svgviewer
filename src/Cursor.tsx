import { Layout } from './lib/layout'
import { Touches } from './lib/touch'
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

export const Cursor = (props: { _layout: Layout; _focus: Vec }) => {
  const { _layout: layout, _focus: focus } = props
  return (
    <CursorSvgPath x={focus.x} y={focus.y} r={layout.config.fontSize / 2} />
  )
}

function center(a: number, b: number): number {
  return (a + b) / 2
}

function midpoint(p: Vec, q: Vec): Vec {
  return { x: center(p.x, q.x), y: center(p.y, q.y) }
}

export const MultiCursor = (props: { _layout: Layout; _touches: Touches }) => {
  const { _layout: layout, _touches: touches } = props

  const points = [...touches.vecs.values()].flatMap((vs: Vec[]) =>
    vs.length === 0 ? [] : [vs[0]]
  )
  const midpoints = points.flatMap((q, i) =>
    i === 0 ? [] : [midpoint(points[i - 1], q)]
  )

  return (
    <>
      {midpoints.map(({ x, y }, i) => (
        <CursorSvgPath
          key={i}
          x={x}
          y={y}
          r={(layout.config.fontSize / 2) * 1}
        />
      ))}
      <polyline
        points={points.map(({ x, y }) => `${x},${y}`).join(' ')}
        stroke="black"
        strokeWidth={(layout.config.fontSize * 0.05) / 2}
      />
    </>
  )
}
