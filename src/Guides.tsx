import { Cursor } from './Cursor'
import './Guides.css'
import { Layout } from './lib/layout'
import { Vec } from './lib/vec'

export interface GuidesProps {
  _layout: Layout
  _focus: Vec
}

export function Guides(props: GuidesProps) {
  return (
    <svg className="guides">
      <Cursor _layout={props._layout} _focus={props._focus} />
    </svg>
  )
}
