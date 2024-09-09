import { Layout } from './lib/layout'

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

export const Cursor = (props: { _layout: Layout }) => {
  const { _layout: layout } = props
  return (
    <CursorSvgPath
      x={layout.focus.x}
      y={layout.focus.y}
      r={layout.config.fontSize / 2}
    />
  )
}
