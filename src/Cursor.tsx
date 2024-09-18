import { useSelector } from '@xstate/react'
import { boxCenter } from './lib/box/prefixed'
import {
  selectFocus,
  selectLayout,
  selectMode,
  selectTouches,
} from './lib/react-pointer'
import { PointerRef } from './lib/xstate-pointer'

const CursorPath = (props: Readonly<{ x: number; y: number; r: number }>) => {
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

export const Cursor = (
  props: Readonly<{
    _pointerRef: PointerRef
  }>
) => {
  const { _pointerRef: pointerRef } = props
  const mode = useSelector(pointerRef, selectMode)
  const layout = useSelector(pointerRef, selectLayout)
  const focus = useSelector(pointerRef, selectFocus)
  const touches = useSelector(pointerRef, selectTouches)

  const c = boxCenter(layout.container)
  const r = layout.config.fontSize / 2

  return (
    <>
      <CursorPath x={focus.x} y={focus.y} r={r} />
      {mode === 0 && touches.points.length > 1 && (
        <polyline
          points={touches.points.map(({ x, y }) => `${x},${y}`).join(' ')}
          stroke="black"
          strokeWidth={r * 0.05}
        />
      )}
      {mode !== 0 && (
        <path
          d={`
M${c.x},${c.y}
m${r * -20},0
h${r * 40}
m${r * -20},${r * -20}
v${r * 40}
`}
          stroke="black"
          strokeWidth={(layout.config.fontSize * 0.05) / 2}
        />
      )}
    </>
  )
}
