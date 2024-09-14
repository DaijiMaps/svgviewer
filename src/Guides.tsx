import { Cursor } from './Cursor'
import './Guides.css'
import { Layout } from './lib/layout'
import { Touches } from './lib/touch'
import { Vec } from './lib/vec'

export interface GuidesProps {
  _layout: Layout
  _focus: Vec
  _touches: Touches
}

export function Guides(props: Readonly<GuidesProps>) {
  return (
    <svg className="guides">
      <Cursor
        _layout={props._layout}
        _focus={props._focus}
        _touches={props._touches}
      />
    </svg>
  )
}
