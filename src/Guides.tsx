import { Cursor, MultiCursor } from './Cursor'
import './Guides.css'
import { Layout } from './lib/layout'
import { Touches } from './lib/touch'
import { Vec } from './lib/vec'

export interface GuidesProps {
  _layout: Layout
  _focus: Vec
  _touches: Touches
}

export function Guides(props: GuidesProps) {
  const { _touches: touches } = props
  return (
    <svg className="guides">
      {touches.vecs.size >= 2 ? (
        <MultiCursor _layout={props._layout} _touches={props._touches} />
      ) : (
        <Cursor _layout={props._layout} _focus={props._focus} />
      )}
    </svg>
  )
}
